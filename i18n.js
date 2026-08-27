// Tesla - i18n Translation Dictionary & Engine

const translations = {
  en: {
    brandTag: "Tesla Official",
    home: "Home",
    howItWorks: "Ecosystem",
    showcase: "Vehicles",
    sourceConsign: "Order",
    trackOrder: "Track Order",
    about: "About",
    clientPortal: "Dashboard",
    clientBrief: "Custom Order",
    heroSubtitle: "Electric Cars, Solar & Clean Energy",
    heroTitle: "Model Y",
    heroDesc: "From $31,490 After Federal Tax Credit",
    initiateBrief: "Order Now",
    viewVault: "Learn More",
    engineTitle: "Engineered for Sustainability",
    engineDesc: "Accelerating the world\\'s transition to sustainable energy.",
    division1Title: "Electric Vehicles",
    division1Desc: "High-performance electric vehicles designed for safety, range, and over-the-air updates.",
    division2Title: "Energy Storage & Solar",
    division2Desc: "Produce clean solar energy and store it in Powerwall to power your home seamlessly.",
    footerRights: "Tesla © 2026"
  },
  es: {
    brandTag: "Tesla Oficial",
    home: "Inicio",
    howItWorks: "Ecosistema",
    showcase: "Vehículos",
    sourceConsign: "Pedir",
    trackOrder: "Rastrear",
    about: "Acerca de",
    clientPortal: "Panel",
    clientBrief: "Pedido Personalizado",
    heroSubtitle: "Autos Eléctricos, Solar y Energía Limpia",
    heroTitle: "Model Y",
    heroDesc: "Desde $31,490 después del crédito fiscal federal",
    initiateBrief: "Ordenar Ahora",
    viewVault: "Saber Más",
    engineTitle: "Diseñado para la Sostenibilidad",
    engineDesc: "Acelerando la transición mundial hacia la energía sostenible.",
    division1Title: "Vehículos Eléctricos",
    division1Desc: "Autos eléctricos de alto rendimiento diseñados para seguridad, autonomía y actualizaciones inalámbricas.",
    division2Title: "Almacenamiento de Energía y Solar",
    division2Desc: "Produce energía solar limpia y almacénala en Powerwall para alimentar tu hogar.",
    footerRights: "Tesla © 2026"
  },
  fr: {
    brandTag: "Tesla Officiel",
    home: "Accueil",
    howItWorks: "Écosystème",
    showcase: "Véhicules",
    sourceConsign: "Commander",
    trackOrder: "Suivi",
    about: "À propos",
    clientPortal: "Tableau de bord",
    clientBrief: "Commande",
    heroSubtitle: "Voitures Électriques, Solaire & Énergie Propre",
    heroTitle: "Model Y",
    heroDesc: "À partir de 31 490 $ après crédit d'impôt fédéral",
    initiateBrief: "Commander",
    viewVault: "En savoir plus",
    engineTitle: "Conçu pour la Durabilité",
    engineDesc: "Accélérer la transition mondiale vers l'énergie durable.",
    division1Title: "Véhicules Électriques",
    division1Desc: "Voitures électriques haute performance conçues pour la sécurité, l'autonomie et les mises à jour OTA.",
    division2Title: "Stockage d'Énergie & Solaire",
    division2Desc: "Produisez de l'énergie solaire propre et stockez-la dans le Powerwall.",
    footerRights: "Tesla © 2026"
  },
  de: {
    brandTag: "Tesla Offiziell",
    home: "Startseite",
    howItWorks: "Ökosystem",
    showcase: "Fahrzeuge",
    sourceConsign: "Bestellen",
    trackOrder: "Verfolgen",
    about: "Über uns",
    clientPortal: "Dashboard",
    clientBrief: "Bestellung",
    heroSubtitle: "Elektroautos, Solar & Saubere Energie",
    heroTitle: "Model Y",
    heroDesc: "Ab 31.490 $ nach Bundesteuergutschrift",
    initiateBrief: "Jetzt Bestellen",
    viewVault: "Mehr Erfahren",
    engineTitle: "Entwickelt für Nachhaltigkeit",
    engineDesc: "Beschleunigung des weltweiten Übergangs zu nachhaltiger Energie.",
    division1Title: "Elektrofahrzeuge",
    division1Desc: "Leistungsstarke Elektrofahrzeuge für Sicherheit, Reichweite und Over-the-Air-Updates.",
    division2Title: "Energiespeicher & Solar",
    division2Desc: "Erzeugen Sie saubere Solarenergie und speichern Sie diese im Powerwall.",
    footerRights: "Tesla © 2026"
  },
  ja: {
    brandTag: "テスラ公式",
    home: "ホーム",
    howItWorks: "エコシステム",
    showcase: "車両",
    sourceConsign: "注文",
    trackOrder: "注文追跡",
    about: "概要",
    clientPortal: "ポータル",
    clientBrief: "カスタム注文",
    heroSubtitle: "電気自動車、ソーラー、クリーンエネルギー",
    heroTitle: "Model Y",
    heroDesc: "連邦税額控除後 $31,490 から",
    initiateBrief: "今すぐ注文",
    viewVault: "詳細を見る",
    engineTitle: "持続可能性のための設計",
    engineDesc: "持続可能なエネルギーへの世界の移行を加速する。",
    division1Title: "電気自動車",
    division1Desc: "安全性、航続距離、無線アップデートのために設計された高性能電気自動車。",
    division2Title: "エネルギー貯蔵・ソーラー",
    division2Desc: "クリーンな太陽光発電を行い、Powerwallに蓄えて自宅に電力を供給します。",
    footerRights: "Tesla © 2026"
  }
};

function changeLanguage(lang) {
  localStorage.setItem('tesla_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  const dict = translations[lang] || translations.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerText = dict[key];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.tesla-menu-links') || document.querySelector('.nav-links');
  if (navLinks && !document.getElementById('lang-selector')) {
    const select = document.createElement('select');
    select.id = 'lang-selector';
    select.className = 'bg-black text-white border border-white/20 rounded-lg px-2 py-1 text-xs font-mono uppercase cursor-pointer';
    
    const langs = [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'fr', label: 'Français' },
      { code: 'de', label: 'Deutsch' },
      { code: 'ja', label: '日本語' }
    ];

    langs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.innerText = l.label;
      select.appendChild(opt);
    });

    const savedLang = localStorage.getItem('tesla_lang') || 'en';
    select.value = savedLang;
    changeLanguage(savedLang);

    select.addEventListener('change', (e) => {
      changeLanguage(e.target.value);
    });

    const li = document.createElement('li');
    li.style.marginLeft = '12px';
    li.appendChild(select);
    navLinks.appendChild(li);
  }
});
