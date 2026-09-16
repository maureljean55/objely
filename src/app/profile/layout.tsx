import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "Gérez votre profil, vos paramètres et votre confidentialité sur Objely.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
