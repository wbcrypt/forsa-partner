export type Locale = 'en' | 'fr' | 'ar'
export const LOCALES = [
  { code: 'en' as Locale, label: 'EN', dir: 'ltr' as const },
  { code: 'fr' as Locale, label: 'FR', dir: 'ltr' as const },
  { code: 'ar' as Locale, label: 'ع', dir: 'rtl' as const },
]
const T: Record<Locale, Record<string, string>> = {
  en: {
    dashboard:'Dashboard', myStudents:'My Students', commissions:'Commissions',
    referrals:'Referral Tools', reports:'Reports', profile:'Profile', signOut:'Sign out',
    signIn:'Sign in', welcomeBack:'Welcome back', partnerPortal:'Partner Portal',
    loginSubtitle:'Access your FORSA partner account',
    emailAddr:'Email address', password:'Password',
    totalReferrals:'Total Referrals', approved:'Approved', pending:'Pending',
    rejected:'Rejected', estimatedComm:'Est. Commissions', paidComm:'Paid Commissions',
    conversionRate:'Conversion Rate', thisMonth:'This month',
    student:'Student', university:'University', status:'Status', date:'Date',
    noStudents:'No students yet',
    noStudentsDesc:'Students you refer will appear here once they apply.',
    search:'Search students…', allStatuses:'All statuses',
    referralLink:'Your Referral Link', referralCode:'Your Referral Code',
    copyLink:'Copy link', copied:'Copied!', shareWhatsApp:'Share via WhatsApp',
    qrCode:'QR Code', scanToApply:'Students scan to apply with FORSA',
    howItWorks:'How It Works',
    step1:'Share your unique link or code with students',
    step2:'Students apply for financing through FORSA',
    step3:'FORSA reviews and approves the application',
    step4:'You earn your referral commission',
    commPending:'Pending', commApproved:'Approved', commPaid:'Paid',
    commHistory:'Commission History', amount:'Amount', paymentDate:'Payment Date',
    noComm:'No commissions yet',
    noCommDesc:'Commissions are generated when referred students are approved by FORSA.',
    totalEarned:'Total Earned', totalPending:'Total Pending',
    exportCSV:'Export CSV', exportPDF:'Export PDF',
    monthlyReport:'Monthly Summary', convRate:'Conversion Rate',
    referralsMonth:'Referrals this month', approvedMonth:'Approved this month',
    commMonth:'Commissions this month',
    profileSettings:'Profile Settings', name:'Name', phone:'Phone',
    partnerType:'Partner type', website:'Website', country:'Country',
    save:'Save changes', cancel:'Cancel', saving:'Saving…',
    profileUpdated:'Profile updated', loading:'Loading…', retry:'Try again',
  },
  fr: {
    dashboard:'Tableau de bord', myStudents:'Mes étudiants', commissions:'Commissions',
    referrals:'Outils de référence', reports:'Rapports', profile:'Profil', signOut:'Déconnexion',
    signIn:'Se connecter', welcomeBack:'Bon retour', partnerPortal:'Portail Partenaire',
    loginSubtitle:'Accédez à votre compte partenaire FORSA',
    emailAddr:'Adresse e-mail', password:'Mot de passe',
    totalReferrals:'Total Références', approved:'Approuvés', pending:'En attente',
    rejected:'Rejetés', estimatedComm:'Commissions estimées', paidComm:'Commissions payées',
    conversionRate:'Taux de conversion', thisMonth:'Ce mois',
    student:'Étudiant', university:'Université', status:'Statut', date:'Date',
    noStudents:"Pas encore d'étudiants",
    noStudentsDesc:'Les étudiants référencés apparaîtront ici.',
    search:'Rechercher…', allStatuses:'Tous les statuts',
    referralLink:'Votre lien de référence', referralCode:'Votre code de référence',
    copyLink:'Copier', copied:'Copié!', shareWhatsApp:'Partager sur WhatsApp',
    qrCode:'QR Code', scanToApply:'Les étudiants scannent pour postuler',
    howItWorks:'Comment ça marche',
    step1:'Partagez votre lien ou code unique',
    step2:"L'étudiant postule via FORSA",
    step3:'FORSA examine et approuve',
    step4:'Vous percevez votre commission',
    commPending:'En attente', commApproved:'Approuvées', commPaid:'Payées',
    commHistory:'Historique', amount:'Montant', paymentDate:'Date de paiement',
    noComm:'Pas encore de commissions',
    noCommDesc:"Les commissions sont générées lors de l'approbation des étudiants.",
    totalEarned:'Total gagné', totalPending:'Total en attente',
    exportCSV:'Exporter CSV', exportPDF:'Exporter PDF',
    monthlyReport:'Résumé mensuel', convRate:'Taux de conversion',
    referralsMonth:'Références ce mois', approvedMonth:'Approuvés ce mois',
    commMonth:'Commissions ce mois',
    profileSettings:'Paramètres du profil', name:'Nom', phone:'Téléphone',
    partnerType:'Type de partenaire', website:'Site web', country:'Pays',
    save:'Enregistrer', cancel:'Annuler', saving:'Enregistrement…',
    profileUpdated:'Profil mis à jour', loading:'Chargement…', retry:'Réessayer',
  },
  ar: {
    dashboard:'لوحة التحكم', myStudents:'طلابي', commissions:'العمولات',
    referrals:'أدوات الإحالة', reports:'التقارير', profile:'الملف الشخصي', signOut:'خروج',
    signIn:'تسجيل الدخول', welcomeBack:'مرحباً بعودتك', partnerPortal:'بوابة الشريك',
    loginSubtitle:'سجّل الدخول إلى حساب شريك FORSA',
    emailAddr:'البريد الإلكتروني', password:'كلمة المرور',
    totalReferrals:'إجمالي الإحالات', approved:'معتمد', pending:'معلق',
    rejected:'مرفوض', estimatedComm:'العمولات المتوقعة', paidComm:'العمولات المدفوعة',
    conversionRate:'معدل التحويل', thisMonth:'هذا الشهر',
    student:'الطالب', university:'الجامعة', status:'الحالة', date:'التاريخ',
    noStudents:'لا يوجد طلاب بعد',
    noStudentsDesc:'سيظهر الطلاب الذين تحيلهم هنا بعد تقديمهم.',
    search:'البحث…', allStatuses:'جميع الحالات',
    referralLink:'رابط الإحالة', referralCode:'رمز الإحالة',
    copyLink:'نسخ', copied:'تم النسخ!', shareWhatsApp:'واتساب',
    qrCode:'رمز QR', scanToApply:'امسح للتقديم عبر FORSA',
    howItWorks:'كيف يعمل',
    step1:'شارك رابطك الفريد مع الطلاب',
    step2:'يتقدم الطالب عبر FORSA',
    step3:'تراجع FORSA وتوافق',
    step4:'تحصل على عمولتك',
    commPending:'معلقة', commApproved:'معتمدة', commPaid:'مدفوعة',
    commHistory:'سجل العمولات', amount:'المبلغ', paymentDate:'تاريخ الدفع',
    noComm:'لا توجد عمولات بعد',
    noCommDesc:'تُنشأ العمولات عند اعتماد الطلاب.',
    totalEarned:'إجمالي المكتسب', totalPending:'إجمالي المعلق',
    exportCSV:'تصدير CSV', exportPDF:'تصدير PDF',
    monthlyReport:'الملخص الشهري', convRate:'معدل التحويل',
    referralsMonth:'الإحالات هذا الشهر', approvedMonth:'المعتمدون هذا الشهر',
    commMonth:'العمولات هذا الشهر',
    profileSettings:'إعدادات الملف', name:'الاسم', phone:'الهاتف',
    partnerType:'نوع الشريك', website:'الموقع', country:'الدولة',
    save:'حفظ', cancel:'إلغاء', saving:'جاري الحفظ…',
    profileUpdated:'تم التحديث', loading:'جاري التحميل…', retry:'إعادة المحاولة',
  },
}
function getSaved(): Locale {
  try { return (localStorage.getItem('forsa_partner_locale') as Locale) || 'fr' } catch { return 'fr' }
}
let current: Locale = getSaved()
export function getLocale() { return current }
export function setLocale(l: Locale) {
  current = l
  try { localStorage.setItem('forsa_partner_locale', l) } catch {}
  const dir = LOCALES.find(x => x.code === l)?.dir || 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', l)
  window.dispatchEvent(new Event('localechange'))
}
export function t(key: string): string {
  return T[current]?.[key] || T.en?.[key] || key
}
try {
  const s = getSaved()
  const dir = LOCALES.find(x => x.code === s)?.dir || 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', s)
} catch {}
