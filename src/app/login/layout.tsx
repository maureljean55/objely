import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Objely pour déclarer et retrouver vos objets.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
