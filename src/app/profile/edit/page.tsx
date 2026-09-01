"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZfuwmAGmqsioZXn2vl0S5TeziGs1iRvYxOAMNX1PWzii9KRcgCccoERwU1Dj76e0-cAN4M1_1ws_bjeZmtSxzXtieAa2J7ngwaqInqx_rnuPJJ3W5dj_MCvXoNG0YdF_6oyDqnRm6zIuhi6ii40MgIjkG5rsKX0XWiP40a5Eu8sK6GuUecMT6pJPUQbKbX9MSI_u1c4V0_o8xVv6hlzkKug9iRIUbUXwp-O7ITLOaaSCSmax9QdFC";

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="bg-surface-container-lowest rounded-[20px] soft-shadow divide-y divide-outline-variant/30 overflow-hidden">{children}</div>;
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center px-4 py-3 gap-4">
      <label className="w-24 shrink-0 font-body-lg text-body-lg text-on-surface">{label}</label>
      <input {...props} className="flex-1 bg-transparent border-none p-0 font-body-lg text-body-lg text-on-surface-variant focus:ring-0 outline-none placeholder:text-outline" />
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("Julie");
  const [lastName, setLastName] = useState("Bertrand");
  const [email, setEmail] = useState("julie.bertrand@example.com");
  const [phone, setPhone] = useState("+33 6 12 34 56 78");
  const [city, setCity] = useState("Paris");
  const [bio, setBio] = useState("Amoureuse des animaux et passionnée de photographie. Je perds souvent mes clés !");

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile/settings" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 -ml-2 p-2 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Modifier le profil</h1>
        <button
          onClick={() => router.push("/profile")}
          className="text-primary font-semibold font-body-lg text-body-lg hover:opacity-70 transition-opacity active:scale-95"
        >
          Enregistrer
        </button>
      </header>

      <main className="pt-20 px-container-margin pb-8 max-w-lg mx-auto">
        <section className="flex flex-col items-center justify-center py-xl">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-lowest soft-shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Julie Bertrand" className="w-full h-full object-cover" src={AVATAR} />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center border border-outline-variant/20 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
            </button>
          </div>
          <button className="text-primary font-body-md text-body-md font-semibold hover:opacity-70 transition-opacity">
            Modifier la photo
          </button>
        </section>

        <div className="mb-lg">
          <FieldGroup>
            <Field label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" />
            <Field label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Votre nom" />
          </FieldGroup>
        </div>

        <div className="mb-lg">
          <FieldGroup>
            <Field label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre adresse e-mail" />
            <Field label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Votre numéro" />
            <Field label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Votre ville" />
          </FieldGroup>
        </div>

        <section className="mb-lg">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2 ml-4">À propos de moi</h2>
          <div className="bg-surface-container-lowest rounded-[20px] soft-shadow">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-transparent border-none p-4 font-body-lg text-body-lg text-on-surface-variant focus:ring-0 outline-none min-h-[100px] resize-none"
              placeholder="Ajoutez une courte bio..."
            />
          </div>
        </section>

        <div className="flex items-center justify-center gap-1 font-label-md text-label-md text-outline mb-xl">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <p>Vos informations personnelles sont protégées.</p>
        </div>

        <button
          onClick={() => router.push("/profile")}
          className="w-full bg-primary btn-primary-gradient text-on-primary py-4 rounded-xl font-body-lg text-body-lg font-semibold shadow-md active:scale-[0.98] transition-transform"
        >
          Enregistrer les modifications
        </button>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
