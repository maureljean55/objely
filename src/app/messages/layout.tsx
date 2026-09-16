import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Vos conversations avec les autres utilisateurs Objely.",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
