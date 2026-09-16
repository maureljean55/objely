import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Vos notifications Objely : messages, correspondances et restitutions.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
