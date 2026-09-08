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
  profile: {
    settingsAria: string;
    trustLevel: string;
    tierNew: string;
    tierBronze: string;
    tierSilver: string;
    tierGold: string;
    statSignaled: string;
    statFound: string;
    statRecovered: string;
    signIn: string;
    signInBody: string;
    noAccount: string;
    greeting: string;
    darkMode: string;
    messages: string;
    notifications: string;
    help: string;
    reportProblem: string;
  };
  login: {
    back: string;
    dataProtected: string;
    title: string;
    subtitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    rememberMe: string;
    forgotPassword: string;
    submitting: string;
    submit: string;
    or: string;
    continueGoogle: string;
    continueApple: string;
    noAccount: string;
    createAccount: string;
    termsPrefix: string;
    termsLink: string;
    termsAnd: string;
    privacyLink: string;
    termsSuffix: string;
    invalidCredentials: string;
    expiredLink: string;
  };
  register: {
    secureSignup: string;
    dataEncrypted: string;
    title: string;
    subtitle: string;
    fullNameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    phoneHint: string;
    countryAria: string;
    addressLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    passwordsMismatch: string;
    passwordStrength: string;
    strengthVeryWeak: string;
    strengthWeak: string;
    strengthMedium: string;
    strengthStrong: string;
    criteriaLength: string;
    criteriaUpper: string;
    criteriaDigit: string;
    criteriaSymbol: string;
    acceptTermsPrefix: string;
    termsLink: string;
    termsAnd: string;
    privacyLink: string;
    termsSuffix: string;
    submitting: string;
    submit: string;
    haveAccount: string;
    signIn: string;
    alreadyRegistered: string;
    rateLimited: string;
    checkEmailTitle: string;
    checkEmailBody: string;
    backToLogin: string;
  };
  splash: {
    tagline: string;
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
    profile: {
      settingsAria: "Paramètres du compte",
      trustLevel: "Niveau de confiance",
      tierNew: "Nouveau",
      tierBronze: "Bronze",
      tierSilver: "Argent",
      tierGold: "Or",
      statSignaled: "Objets\nsignalés",
      statFound: "Objets\ntrouvés",
      statRecovered: "Retrouvés",
      signIn: "Se connecter",
      signInBody: "Connectez-vous pour déclarer vos objets et suivre vos retrouvailles.",
      noAccount: "Pas de compte ? Créer un compte",
      greeting: "Bonjour 👋",
      darkMode: "Mode sombre",
      messages: "Messages",
      notifications: "Notifications",
      help: "Aide",
      reportProblem: "Signaler un problème",
    },
    login: {
      back: "Retour",
      dataProtected: "Vos données sont protégées",
      title: "Connectez-vous à Objely",
      subtitle: "Retrouvez vos objets et gérez vos déclarations en toute simplicité.",
      identifierLabel: "E-mail ou numéro de téléphone",
      identifierPlaceholder: "Votre e-mail ou numéro de téléphone",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Votre mot de passe",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      rememberMe: "Se souvenir de moi",
      forgotPassword: "Mot de passe oublié ?",
      submitting: "Connexion…",
      submit: "Se connecter",
      or: "ou",
      continueGoogle: "Continuer avec Google",
      continueApple: "Continuer avec Apple",
      noAccount: "Vous n'avez pas encore de compte ?",
      createAccount: "Créer un compte",
      termsPrefix: "En continuant, vous acceptez les",
      termsLink: "Conditions d'utilisation",
      termsAnd: "et la",
      privacyLink: "Politique de confidentialité",
      termsSuffix: "d'Objely.",
      invalidCredentials: "E-mail ou mot de passe incorrect.",
      expiredLink: "Ce lien de confirmation n'est plus valable (déjà utilisé ou expiré). Réinscrivez-vous ou reconnectez-vous pour recevoir un nouveau lien.",
    },
    register: {
      secureSignup: "Inscription sécurisée",
      dataEncrypted: "Vos données sont sécurisées et chiffrées",
      title: "Créer un compte",
      subtitle: "Rejoignez Objely pour sécuriser, inventorier et retrouver tous vos objets en un instant.",
      fullNameLabel: "Prénom et nom",
      emailLabel: "Adresse e-mail",
      phoneLabel: "Numéro de mobile",
      phoneHint: "(pour les alertes d'objets)",
      countryAria: "Pays",
      addressLabel: "Adresse (optionnel)",
      passwordLabel: "Mot de passe",
      confirmPasswordLabel: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre mot de passe",
      passwordsMismatch: "Les mots de passe ne correspondent pas.",
      passwordStrength: "Sécurité du mot de passe :",
      strengthVeryWeak: "Très faible",
      strengthWeak: "Faible",
      strengthMedium: "Moyen",
      strengthStrong: "Fort",
      criteriaLength: "8+ caractères",
      criteriaUpper: "1 majuscule",
      criteriaDigit: "1 chiffre",
      criteriaSymbol: "1 symbole",
      acceptTermsPrefix: "J'accepte les",
      termsLink: "Conditions générales",
      termsAnd: "et la",
      privacyLink: "Politique de confidentialité",
      termsSuffix: "d'Objely.",
      submitting: "Création…",
      submit: "Créer mon compte",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      alreadyRegistered: "Un compte existe déjà avec cet e-mail.",
      rateLimited: "Trop d'e-mails envoyés récemment, réessayez dans quelques minutes.",
      checkEmailTitle: "Vérifiez votre e-mail",
      checkEmailBody: "Nous avons envoyé un lien de confirmation à {email}. Cliquez dessus pour activer votre compte.",
      backToLogin: "Retour à la connexion",
    },
    splash: {
      tagline: "Perdu. Trouvé. Retrouvé.",
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
    profile: {
      settingsAria: "Account settings",
      trustLevel: "Trust level",
      tierNew: "New",
      tierBronze: "Bronze",
      tierSilver: "Silver",
      tierGold: "Gold",
      statSignaled: "Items\nreported",
      statFound: "Items\nfound",
      statRecovered: "Recovered",
      signIn: "Sign in",
      signInBody: "Sign in to report your items and track your recoveries.",
      noAccount: "No account? Create one",
      greeting: "Hello 👋",
      darkMode: "Dark mode",
      messages: "Messages",
      notifications: "Notifications",
      help: "Help",
      reportProblem: "Report a problem",
    },
    login: {
      back: "Back",
      dataProtected: "Your data is protected",
      title: "Sign in to Objely",
      subtitle: "Find your items and manage your reports with ease.",
      identifierLabel: "Email or phone number",
      identifierPlaceholder: "Your email or phone number",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      submitting: "Signing in…",
      submit: "Sign in",
      or: "or",
      continueGoogle: "Continue with Google",
      continueApple: "Continue with Apple",
      noAccount: "Don't have an account yet?",
      createAccount: "Create an account",
      termsPrefix: "By continuing, you agree to Objely's",
      termsLink: "Terms of Service",
      termsAnd: "and",
      privacyLink: "Privacy Policy",
      termsSuffix: ".",
      invalidCredentials: "Incorrect email or password.",
      expiredLink: "This confirmation link is no longer valid (already used or expired). Sign up again or sign in to get a new one.",
    },
    register: {
      secureSignup: "Secure sign-up",
      dataEncrypted: "Your data is secure and encrypted",
      title: "Create an account",
      subtitle: "Join Objely to secure, catalog, and find all your belongings instantly.",
      fullNameLabel: "First and last name",
      emailLabel: "Email address",
      phoneLabel: "Mobile number",
      phoneHint: "(for item alerts)",
      countryAria: "Country",
      addressLabel: "Address (optional)",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      confirmPasswordPlaceholder: "Confirm your password",
      passwordsMismatch: "Passwords don't match.",
      passwordStrength: "Password strength:",
      strengthVeryWeak: "Very weak",
      strengthWeak: "Weak",
      strengthMedium: "Medium",
      strengthStrong: "Strong",
      criteriaLength: "8+ characters",
      criteriaUpper: "1 uppercase letter",
      criteriaDigit: "1 digit",
      criteriaSymbol: "1 symbol",
      acceptTermsPrefix: "I agree to Objely's",
      termsLink: "Terms of Service",
      termsAnd: "and",
      privacyLink: "Privacy Policy",
      termsSuffix: ".",
      submitting: "Creating…",
      submit: "Create my account",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      alreadyRegistered: "An account already exists with this email.",
      rateLimited: "Too many emails sent recently, please try again in a few minutes.",
      checkEmailTitle: "Check your email",
      checkEmailBody: "We've sent a confirmation link to {email}. Click it to activate your account.",
      backToLogin: "Back to sign in",
    },
    splash: {
      tagline: "Lost. Found. Reunited.",
    },
  },
};
