-- FAQ content lives in the database (not hardcoded in the app) so it can be
-- updated without a redeploy, and so a future admin page can manage it.
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faq_items enable row level security;

create policy "FAQ items are publicly readable"
  on public.faq_items for select
  using (true);

insert into public.faq_items (question, answer, sort_order) values
(
  'Comment déclarer un objet perdu ou trouvé ?',
  'Depuis l''accueil, appuyez sur « J''ai perdu un objet » ou « J''ai trouvé un objet ». Renseignez les détails (nom, photos, couleurs, description), le lieu et la date, puis validez : Objely recherche immédiatement une correspondance parmi les déclarations existantes.',
  1
),
(
  'Comment fonctionne la correspondance entre objets ?',
  'Objely compare automatiquement chaque nouvelle déclaration aux déclarations existantes de type opposé (perdu ↔ trouvé) : même catégorie, couleurs, marque, lieu proche et date compatible augmentent le pourcentage de correspondance. Dès qu''une correspondance suffisante est trouvée, les deux parties sont averties.',
  2
),
(
  'Comment organiser une restitution en toute sécurité ?',
  'Donnez toujours rendez-vous dans un lieu public et fréquenté, de préférence en journée. Avant de confirmer, le trouveur vérifie que le déclarant connaît un détail privé de l''objet pour s''assurer qu''il s''agit bien du propriétaire.',
  3
),
(
  'Comment supprimer mon compte ?',
  'La suppression de compte en libre-service n''est pas encore disponible. Contactez notre service client depuis l''onglet Aide > « Envoyez-nous un message » et nous traiterons votre demande rapidement.',
  4
);
