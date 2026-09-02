export type MyItemStatus = "searching" | "recovered" | "returned";

export type MyItem = {
  id: string;
  title: string;
  category: string;
  /** Did I declare it lost, or did I declare I found it? */
  type: "lost" | "found";
  /** searching = no match yet · recovered = my lost item was found by someone · returned = the item I found was given back to its owner */
  status: MyItemStatus;
  declaredDateLabel: string;
  location: string;
  image: string;
  /** The other person involved, once a match exists */
  match?: {
    name: string;
    dateLabel: string;
    durationLabel: string;
  };
  details: string;
};

export const MY_ITEMS: MyItem[] = [
  {
    id: "iphone-14-pro",
    title: "iPhone 14 Pro Noir",
    category: "Téléphones",
    type: "lost",
    status: "searching",
    declaredDateLabel: "Perdu le 12 oct.",
    location: "Paris 15e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcKlnzfvaN-bmeuUIGJ4gfRF2ko9IvqtgDqtgdYkukq_BDKZFzXLxulEcuYXV1uhmP-PsSG0byBv4dxCPU5alrDsE7J2eVzRGXpQk8MVoRdo-vRhfWbNSFrvVqgViJTsa6T8mQvVRjNkmobZ8V7D9tRwz8IxlkQE6OgEjxpTd4-Urlfx01o0aeIadJDQEYUPyI_WQ4Zian0mW4_5w-pN4eOWdUyZjNnHBhzM11Zka02iKlUM1y2qru",
    details: "Coque bleue, écran fissuré en haut à droite.",
  },
  {
    id: "sac-a-dos-noir",
    title: "Sac à dos noir",
    category: "Sacs",
    type: "lost",
    status: "recovered",
    declaredDateLabel: "Perdu le 12 oct.",
    location: "Paris 11e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVZe46M5x8qXC3h2DOyPoXkYVWeSoWvUI435nRmzIEN1--7pMtaNWlk5Q1VgJPLx5-9u1tGeX6RXZVid3X_lCQXQXvJ4RONcKjQgHs1xyix2HmYk3xP2Q_6HqqILnEqmy7OYiTPFbfsmrEDqLL_A5nESIp-crOQwnTx7lX1jycLQKt2M4SCAdqpKh8mf_5vnYQeena3JPsC1iX82LLXIUKK838cpHi4nelFNdi4dimAk59ayExXFzs",
    match: { name: "Jean D.", dateLabel: "Trouvé le 15 oct.", durationLabel: "3 jours" },
    details: "Ordinateur portable et clés à l'intérieur, rendus intacts.",
  },
  {
    id: "sac-a-main-cuir",
    title: "Sac à main en cuir",
    category: "Sacs",
    type: "found",
    status: "returned",
    declaredDateLabel: "Trouvé le 7 oct.",
    location: "Gare de Lyon, Paris",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzRy31A-tA9ur8LWAQyHrs0D3843_S-zmZtA3E0AVZtv8xbjuWXAMCyu23c-VJGZTpWL-O677uSY5fq4VIFWYXqJiSMB_4IqttGjSembhVoA2vv27RBXEO4_F6VbAQmOVKhElBSGFSvyDbUQCALbJiNRXDjhofuvdN215Sl3KOoleEVgcoPk-YlHJn6_U6YkX5DQ5xjzrLNuxpmEn5Q17b6Dla7wlRL_kDAftywtZln2AIc885pAN0",
    match: { name: "Camille R.", dateLabel: "Restitué le 9 oct.", durationLabel: "2 jours" },
    details: "Portefeuille et papiers d'identité retrouvés à l'intérieur.",
  },
];

export function getMyItem(id: string): MyItem | undefined {
  return MY_ITEMS.find((item) => item.id === id);
}
