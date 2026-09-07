export type Language = "fr" | "en";

export type TranslationDict = {
  common: {
    locale: string;
    timeNow: string;
    timeMinAgo: string;
    timeHoursAgo: string;
    timeYesterday: string;
    timeDaysAgo: string;
  };
  nav: {
    home: string;
    myItems: string;
    activity: string;
    profile: string;
  };
  home: {
    question: string;
    welcomeBanner: string;
    lostCta: string;
    lostSubtitle: string;
    foundCta: string;
    foundSubtitle: string;
    scanQr: string;
    recentFindsTitle: string;
    noLocation: string;
    foundPrefix: string;
    noRecentFinds: string;
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
  activity: {
    title: string;
    filterAll: string;
    filterMatches: string;
    filterMessages: string;
    filterRestitutions: string;
    newMatch: string;
    matchFoundFor: string;
    lostItem: string;
    foundItem: string;
    matchPercent: string;
    details: string;
    discuss: string;
    waitingVerification: string;
    noMatches: string;
    ownershipVerification: string;
    verificationNeeded: string;
    seeRequest: string;
  };
  search: {
    title: string;
    searchPlaceholder: string;
    filters: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  myItemCard: {
    statusSearching: string;
    statusMatched: string;
    statusRecovered: string;
    statusReturned: string;
    lostByMe: string;
    foundByMe: string;
    lostVerb: string;
    foundVerb: string;
    noLocation: string;
    deleteAria: string;
    resolvedQuestionLost: string;
    resolvedQuestionFound: string;
    notResolvedLost: string;
    notResolvedFound: string;
    yes: string;
    no: string;
    confirmDeleteTitle: string;
    confirmDeleteBody: string;
    yesDelete: string;
    cancel: string;
    dismissAria: string;
    whyDeleted: string;
    reasonPlaceholder: string;
    send: string;
  };
  itemDetail: {
    back: string;
    status: string;
    matchFound: string;
    stillSearching: string;
    matchFoundBody: string;
    stillSearchingBody: string;
    itemRecovered: string;
    itemReturned: string;
  };
};

export const translations: Record<Language, TranslationDict> = {
  fr: {
    common: {
      locale: "fr-FR",
      timeNow: "à l'instant",
      timeMinAgo: "il y a {n} min",
      timeHoursAgo: "il y a {n} h",
      timeYesterday: "hier",
      timeDaysAgo: "il y a {n} j",
    },
    nav: {
      home: "Accueil",
      myItems: "Mes objets",
      activity: "Activité",
      profile: "Profil",
    },
    home: {
      question: "Quelque chose à retrouver ?",
      welcomeBanner: "Compte confirmé, bienvenue sur Objely !",
      lostCta: "J'ai perdu un objet",
      lostSubtitle: "Déclarez un objet disparu",
      foundCta: "J'ai trouvé un objet",
      foundSubtitle: "Aidez à restituer",
      scanQr: "Scanner un QR code",
      recentFindsTitle: "Objets récemment trouvés près de vous",
      noLocation: "Lieu non précisé",
      foundPrefix: "Trouvé",
      noRecentFinds: "Aucun objet trouvé signalé pour le moment. Revenez bientôt !",
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
    activity: {
      title: "Activité",
      filterAll: "Tout",
      filterMatches: "Correspondances",
      filterMessages: "Messages",
      filterRestitutions: "Restitutions",
      newMatch: "Nouvelle correspondance",
      matchFoundFor: "Une correspondance possible a été trouvée pour votre",
      lostItem: "objet perdu",
      foundItem: "objet trouvé",
      matchPercent: "% de correspondance",
      details: "Détails",
      discuss: "Discuter",
      waitingVerification: "En attente de vérification",
      noMatches: "Aucune correspondance pour le moment. Vous serez averti dès qu'une déclaration correspond à un de vos objets.",
      ownershipVerification: "Vérification de propriété",
      verificationNeeded: "Une vérification est nécessaire avant la restitution de",
      seeRequest: "Voir la demande",
    },
    search: {
      title: "Mes objets",
      searchPlaceholder: "Rechercher parmi mes objets",
      filters: "Filtres",
      emptyTitle: "Vous n'avez déclaré aucun objet",
      emptySubtitle: "Déclarez un objet perdu ou trouvé depuis l'accueil pour le suivre ici.",
    },
    myItemCard: {
      statusSearching: "Recherche active",
      statusMatched: "Correspondance trouvée",
      statusRecovered: "Retrouvé",
      statusReturned: "Restitué",
      lostByMe: "Perdu par moi",
      foundByMe: "Trouvé par moi",
      lostVerb: "Perdu",
      foundVerb: "Trouvé",
      noLocation: "Lieu non précisé",
      deleteAria: "Supprimer la déclaration",
      resolvedQuestionLost: "Avez-vous retrouvé votre objet ?",
      resolvedQuestionFound: "Avez-vous restitué l'objet à son propriétaire ?",
      notResolvedLost: "retrouvé votre objet",
      notResolvedFound: "restitué l'objet",
      yes: "Oui",
      no: "Non",
      confirmDeleteTitle: "Confirmer la suppression",
      confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer la déclaration sans avoir {phrase} ?",
      yesDelete: "Oui, supprimer",
      cancel: "Annuler",
      dismissAria: "Ignorer",
      whyDeleted: "Pourquoi avez-vous supprimé votre déclaration ?",
      reasonPlaceholder: "Votre réponse (facultatif)...",
      send: "Envoyer",
    },
    itemDetail: {
      back: "Retour",
      status: "Statut",
      matchFound: "Une correspondance a été trouvée",
      stillSearching: "Recherche toujours active",
      matchFoundBody: "Consultez l'onglet Activité pour voir la correspondance et échanger.",
      stillSearchingBody: "Personne n'a encore signalé cet objet. Vous serez averti dès qu'une correspondance est trouvée.",
      itemRecovered: "Objet retrouvé",
      itemReturned: "Objet restitué",
    },
  },
  en: {
    common: {
      locale: "en-US",
      timeNow: "just now",
      timeMinAgo: "{n} min ago",
      timeHoursAgo: "{n} h ago",
      timeYesterday: "yesterday",
      timeDaysAgo: "{n} d ago",
    },
    nav: {
      home: "Home",
      myItems: "My items",
      activity: "Activity",
      profile: "Profile",
    },
    home: {
      question: "Looking for something?",
      welcomeBanner: "Account confirmed, welcome to Objely!",
      lostCta: "I lost an item",
      lostSubtitle: "Report a missing item",
      foundCta: "I found an item",
      foundSubtitle: "Help return it",
      scanQr: "Scan a QR code",
      recentFindsTitle: "Recently found items near you",
      noLocation: "Location not specified",
      foundPrefix: "Found",
      noRecentFinds: "No found items reported yet. Check back soon!",
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
    activity: {
      title: "Activity",
      filterAll: "All",
      filterMatches: "Matches",
      filterMessages: "Messages",
      filterRestitutions: "Returns",
      newMatch: "New match",
      matchFoundFor: "A possible match was found for your",
      lostItem: "lost item",
      foundItem: "found item",
      matchPercent: "% match",
      details: "Details",
      discuss: "Chat",
      waitingVerification: "Awaiting verification",
      noMatches: "No matches yet. You'll be notified as soon as a declaration matches one of your items.",
      ownershipVerification: "Ownership verification",
      verificationNeeded: "Verification is needed before returning",
      seeRequest: "View request",
    },
    search: {
      title: "My items",
      searchPlaceholder: "Search my items",
      filters: "Filters",
      emptyTitle: "You haven't reported any items",
      emptySubtitle: "Report a lost or found item from the home screen to track it here.",
    },
    myItemCard: {
      statusSearching: "Actively searching",
      statusMatched: "Match found",
      statusRecovered: "Recovered",
      statusReturned: "Returned",
      lostByMe: "Lost by me",
      foundByMe: "Found by me",
      lostVerb: "Lost",
      foundVerb: "Found",
      noLocation: "Location not specified",
      deleteAria: "Delete declaration",
      resolvedQuestionLost: "Did you find your item?",
      resolvedQuestionFound: "Did you return the item to its owner?",
      notResolvedLost: "found your item",
      notResolvedFound: "returned the item",
      yes: "Yes",
      no: "No",
      confirmDeleteTitle: "Confirm deletion",
      confirmDeleteBody: "Are you sure you want to delete the declaration without having {phrase}?",
      yesDelete: "Yes, delete",
      cancel: "Cancel",
      dismissAria: "Dismiss",
      whyDeleted: "Why did you delete your declaration?",
      reasonPlaceholder: "Your answer (optional)...",
      send: "Send",
    },
    itemDetail: {
      back: "Back",
      status: "Status",
      matchFound: "A match has been found",
      stillSearching: "Still actively searching",
      matchFoundBody: "Check the Activity tab to see the match and chat.",
      stillSearchingBody: "No one has reported this item yet. You'll be notified as soon as a match is found.",
      itemRecovered: "Item recovered",
      itemReturned: "Item returned",
    },
  },
};
