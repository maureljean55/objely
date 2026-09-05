create extension if not exists pgcrypto;

create type public.item_type as enum ('lost', 'found');
create type public.item_status as enum ('searching', 'matched', 'recovered', 'returned');
create type public.match_status as enum ('pending', 'confirmed', 'rejected');

-- One row per "J'ai perdu" / "J'ai trouvé" declaration. Mirrors the shape the
-- UI already expects (see src/lib/myItems.ts's MyItem type and the
-- report-lost/report-found draft in src/lib/declarationDraft.ts).
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.item_type not null,
  status public.item_status not null default 'searching',
  category_id text not null,
  category_label text not null,
  category_icon text,
  title text not null,
  description text,
  brand text,
  color text,
  location text,
  hide_exact_location boolean not null default false,
  photos text[] not null default '{}',
  occurred_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_user_id_idx on public.items (user_id);
create index items_type_status_idx on public.items (type, status);

alter table public.items enable row level security;

-- Found/lost listings need to be browsable by everyone (home feed, search,
-- matching) — nothing sensitive lives on this table, see item_secrets below.
create policy "Items are viewable by any authenticated user"
  on public.items for select
  to authenticated
  using (true);

create policy "Users can insert their own items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.items for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger set_items_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- A private identifying detail (e.g. "there's a coffee stain on the inside
-- pocket") used to verify the true owner before a match is confirmed. Kept
-- out of `items` so the broad "any authenticated user can view items" policy
-- above never exposes it.
create table public.item_secrets (
  item_id uuid primary key references public.items (id) on delete cascade,
  private_detail text not null
);

alter table public.item_secrets enable row level security;

create policy "Item secrets are only visible to their owner"
  on public.item_secrets for select
  to authenticated
  using (exists (
    select 1 from public.items
    where items.id = item_secrets.item_id and items.user_id = auth.uid()
  ));

create policy "Item secrets are only insertable by their owner"
  on public.item_secrets for insert
  to authenticated
  with check (exists (
    select 1 from public.items
    where items.id = item_secrets.item_id and items.user_id = auth.uid()
  ));

create policy "Item secrets are only updatable by their owner"
  on public.item_secrets for update
  to authenticated
  using (exists (
    select 1 from public.items
    where items.id = item_secrets.item_id and items.user_id = auth.uid()
  ));

-- Links a lost declaration to a found declaration with a match score.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  lost_item_id uuid not null references public.items (id) on delete cascade,
  found_item_id uuid not null references public.items (id) on delete cascade,
  match_percent smallint not null check (match_percent between 0 and 100),
  status public.match_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (lost_item_id, found_item_id)
);

create index matches_lost_item_idx on public.matches (lost_item_id);
create index matches_found_item_idx on public.matches (found_item_id);

alter table public.matches enable row level security;

create policy "Matches are viewable by the involved item owners"
  on public.matches for select
  to authenticated
  using (
    exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
    or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
  );

-- Until a real matching job runs with elevated privileges, allow either
-- involved owner to record a match themselves (e.g. after spotting their own
-- item in someone else's "found" listing).
create policy "An involved item owner can create a match"
  on public.matches for insert
  to authenticated
  with check (
    exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
    or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
  );

create policy "Involved item owners can update a match"
  on public.matches for update
  to authenticated
  using (
    exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
    or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
  );

-- Chat between the two people on a match.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_match_id_idx on public.messages (match_id, created_at);

alter table public.messages enable row level security;

create policy "Messages are viewable by the involved match participants"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = messages.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

create policy "Match participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = messages.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );
