"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getMyProfile, updateAvatarUrl, uploadAvatarPhoto } from "@/lib/supabase/profile";
import { PRESET_AVATARS } from "@/lib/presetAvatars";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile().then(({ data }) => {
      if (!data) return;
      const [first, ...rest] = (data.full_name ?? "").split(" ");
      setFirstName(first ?? "");
      setLastName(rest.join(" "));
      setAvatarUrl(data.avatar_url);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const { url, error: uploadError } = await uploadAvatarPhoto(file);
    if (uploadError || !url) {
      setError("L'envoi de la photo a échoué, réessayez.");
    } else {
      setAvatarUrl(url);
      setPickerOpen(false);
    }
    setIsUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    if (avatarUrl) {
      const { error: saveError } = await updateAvatarUrl(avatarUrl);
      if (saveError) {
        setError("Une erreur est survenue, réessayez.");
        setIsSaving(false);
        return;
      }
    }
    router.push("/profile");
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile/settings" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 -ml-2 p-2 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Modifier le profil</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-primary font-semibold font-body-lg text-body-lg hover:opacity-70 transition-opacity active:scale-95 disabled:opacity-50"
        >
          Enregistrer
        </button>
      </header>

      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-container-margin pb-8 max-w-lg mx-auto">
        <section className="flex flex-col items-center justify-center py-xl">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-lowest soft-shadow bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Photo de profil" className="w-full h-full object-cover" src={avatarUrl} />
              ) : (
                <span className="material-symbols-outlined text-[40px]">person</span>
              )}
            </div>
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center border border-outline-variant/20 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
            </button>
          </div>
          <button onClick={() => setPickerOpen((v) => !v)} className="text-primary font-body-md text-body-md font-semibold hover:opacity-70 transition-opacity">
            {isUploading ? "Envoi en cours…" : "Modifier la photo"}
          </button>

          {pickerOpen && (
            <div className="w-full bg-surface-container-lowest rounded-[20px] soft-shadow p-lg mt-lg animate-fadeIn">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary font-headline-sm text-headline-sm hover:bg-primary/5 transition-colors mb-lg disabled:opacity-50"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Importer une photo
              </button>

              <p className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-3">Ou choisissez un avatar</p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = avatarUrl === avatar.url;
                  return (
                    <button
                      key={avatar.seed}
                      onClick={() => setAvatarUrl(avatar.url)}
                      aria-label={`Avatar ${avatar.seed}`}
                      className={`aspect-square rounded-full overflow-hidden bg-surface-container transition-all duration-200 hover:scale-110 active:scale-95 ${
                        isSelected ? "ring-4 ring-primary scale-110" : "ring-2 ring-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={avatar.seed} className="w-full h-full" src={avatar.url} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {error && <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3 text-center mb-lg">{error}</p>}

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
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary btn-primary-gradient text-on-primary py-4 rounded-xl font-body-lg text-body-lg font-semibold shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
