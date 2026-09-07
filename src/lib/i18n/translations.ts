export type Language = "fr" | "en";

export type TranslationDict = {
  nav: {
    home: string;
    myItems: string;
    activity: string;
    profile: string;
  };
  settings: {
    title: string;
    preferences: string;
    language: string;
    security: string;
    password: string;
    devices: string;
    confidentiality: string;
    privacySecurity: string;
    permissions: string;
    assistance: string;
    reportProblem: string;
    logout: string;
    deleteAccount: string;
  };
};

export const translations: Record<Language, TranslationDict> = {
  fr: {
    nav: {
      home: "Accueil",
      myItems: "Mes objets",
      activity: "Activité",
      profile: "Profil",
    },
    settings: {
      title: "Paramètres",
      preferences: "Préférences",
      language: "Langue",
      security: "Sécurité",
      password: "Mot de passe",
      devices: "Connexion et appareils",
      confidentiality: "Confidentialité",
      privacySecurity: "Confidentialité & Sécurité",
      permissions: "Autorisations",
      assistance: "Assistance",
      reportProblem: "Signaler un problème",
      logout: "Déconnexion",
      deleteAccount: "Supprimer mon compte",
    },
  },
  en: {
    nav: {
      home: "Home",
      myItems: "My items",
      activity: "Activity",
      profile: "Profile",
    },
    settings: {
      title: "Settings",
      preferences: "Preferences",
      language: "Language",
      security: "Security",
      password: "Password",
      devices: "Login & devices",
      confidentiality: "Privacy",
      privacySecurity: "Privacy & Security",
      permissions: "Permissions",
      assistance: "Support",
      reportProblem: "Report a problem",
      logout: "Log out",
      deleteAccount: "Delete my account",
    },
  },
};
