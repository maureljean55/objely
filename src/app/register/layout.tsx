import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Inscrivez-vous gratuitement sur Objely pour déclarer et retrouver vos objets perdus.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
