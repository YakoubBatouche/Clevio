type PortfolioFilter = {
  id: string
  label: string
  description: string
}

type PortfolioItem = {
  id: string
  filterId: string
  title: string
  image: string
  alt: string
  position?: string
}

export type PortfolioCategory = {
  id: string
  title: string
  description: string
  cover: string
  filters: readonly PortfolioFilter[]
  items: readonly PortfolioItem[]
}

const identity = 'work/brand-identity.webp'
const website = 'work/digital-experience.webp'
const studio = 'work/visual-story.webp'
const chroma = 'work/brand-thumbnail-chroma.svg'

export const portfolioCategories: readonly PortfolioCategory[] = [
  {
    id: 'print-identity',
    title: 'Print & Identité Visuelle',
    description: 'Conception Offline',
    cover: identity,
    filters: [
      { id: 'branding', label: 'Branding', description: 'Logos, chartes graphiques, guidelines, direction artistique.' },
      { id: 'editorial', label: 'Édition & Catalogues', description: 'Brochures, magazines, rapports, menus.' },
      { id: 'packaging', label: 'Packaging & Étiquettes', description: 'Design d’emballages (agroalimentaire, cosmétique, retail).' },
      { id: 'signage', label: 'Signalétique & Grand Format', description: 'Enseignes, stands d’exposition, habillages, roll-ups.' },
      { id: 'marketing-materials', label: 'Supports Marketing', description: 'Flyers, cartes de visite, affiches, goodies.' },
    ],
    items: [
      {
        id: 'foil-mark', filterId: 'packaging', title: 'شعار بطباعة فضية', image: identity,
        alt: 'رمز هندسي فضي مطبوع على علبة بنفسجية', position: 'center 28%',
      },
      {
        id: 'identity-poster', filterId: 'marketing-materials', title: 'ملصق للهوية البصرية', image: 'work/brand-poster.svg',
        alt: 'ملصق بنفسجي تجريبي يجمع بين رمز هندسي وشبكة تصميم وعبارة من الفكرة إلى الشكل',
      },
      {
        id: 'orbit-mark', filterId: 'branding', title: 'شعار المدار', image: 'work/brand-logo-orbit.svg',
        alt: 'مداران متقاطعان بلون أخضر داكن حول نقطة برتقالية على شبكة ورقية',
      },
      {
        id: 'echo-poster', filterId: 'marketing-materials', title: 'ملصق الصدى', image: 'work/brand-poster-echo.svg',
        alt: 'حلقات خضراء مائلة تتكرر حول كلمة ECHO على خلفية خضراء داكنة',
      },
      {
        id: 'terrace-mark', filterId: 'branding', title: 'شعار الأقواس', image: 'work/brand-logo-terrace.svg',
        alt: 'ثلاثة أقواس بلون الطين على بطاقة كريمية مائلة',
      },
      {
        id: 'solar-poster', filterId: 'marketing-materials', title: 'ملصق ساعات الشمس', image: 'work/brand-poster-solar.svg',
        alt: 'قرص شمسي ذهبي يطل على تلال داكنة بجوار عبارة Solar hours',
      },
      {
        id: 'signal-mark', filterId: 'branding', title: 'شعار الإشارة', image: 'work/brand-logo-signal.svg',
        alt: 'ثلاث شرائط مائلة ونقطة في شعار يعرض تنويعاته اللونية',
      },
      {
        id: 'modular-poster', filterId: 'marketing-materials', title: 'ملصق الوحدات الهندسية', image: 'work/brand-poster-modular.svg',
        alt: 'ملصق بأرباع دوائر ومساحات هندسية حمراء وصفراء وزرقاء',
      },
      {
        id: 'tide-mark', filterId: 'branding', title: 'شعار المدّ', image: 'work/brand-logo-tide.svg',
        alt: 'شارة دائرية زرقاء تضم موجتين ونقطة ذهبية',
      },
      {
        id: 'contour-poster', filterId: 'marketing-materials', title: 'ملصق خطوط التضاريس', image: 'work/brand-poster-contours.svg',
        alt: 'خطوط طبوغرافية متداخلة وعلامات حمراء على خلفية زرقاء فاتحة',
      },
      {
        id: 'petal-mark', filterId: 'branding', title: 'شعار البتلات', image: 'work/brand-logo-petal.svg',
        alt: 'رمز مستوحى من بتلات زهرة مع أربع عينات لونية وردية وبنفسجية',
      },
      {
        id: 'paper-poster', filterId: 'marketing-materials', title: 'ملصق طيّات الورق', image: 'work/brand-poster-paper.svg',
        alt: 'ورقة صفراء مطوية تبرز أسطحها وظلالها على خلفية مسطّرة',
      },
      {
        id: 'weave-mark', filterId: 'branding', title: 'شعار النسيج', image: 'work/brand-logo-weave.svg',
        alt: 'خطّان متشابكان باللونين الذهبي والكريمي فوق خلفية داكنة',
      },
      {
        id: 'letterpress-poster', filterId: 'marketing-materials', title: 'ملصق الطباعة البارزة', image: 'work/brand-poster-letterpress.svg',
        alt: 'حرف لاتيني بطبقتين متداخلتين باللونين الأحمر والأخضر على ورق كريمي',
      },
    ],
  },
  {
    id: 'web-app',
    title: 'Web & App',
    description: 'Conception Tech, UI/UX & Code',
    cover: website,
    filters: [
      { id: 'corporate-websites', label: 'Sites Vitrines & Corporate', description: 'Sites d’entreprise, institutions, portfolio.' },
      { id: 'ecommerce', label: 'E-Commerce & Retail', description: 'Boutiques en ligne, catalogues connectés, parcours d’achat.' },
      { id: 'mobile-apps', label: 'Applications Mobiles', description: 'Apps iOS / Android (UI/UX et développement).' },
      { id: 'web-apps', label: 'Web Apps & Outils Métier', description: 'Plateformes sur mesure, tableaux de bord, systèmes de réservation.' },
      { id: 'landing-uiux', label: 'Landing Pages & UI/UX Pur', description: 'Pages de conversion (Ads) et maquettes Figma / Design Systems.' },
    ],
    items: [
      {
        id: 'website-preview', filterId: 'landing-uiux', title: 'تصوّر لواجهة ويب', image: website,
        alt: 'حاسوب محمول يعرض واجهة موقع بخلفية زرقاء داكنة', position: '30% center',
      },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & Growth',
    description: 'Stratégie & Acquisition',
    cover: chroma,
    filters: [
      { id: 'social-media', label: 'Stratégie & Social Media', description: 'Lignes éditoriales, direction artistique des flux, templates.' },
      { id: 'ads', label: 'Campagnes Publicitaires (Ads)', description: 'Créatives publicitaires pour Meta (Facebook/Instagram) et Google Ads.' },
      { id: 'seo', label: 'SEO & Visibilité', description: 'Optimisation Google Business Profile / Google Maps, référencement naturel.' },
      { id: 'direct-marketing', label: 'Email & WhatsApp Marketing', description: 'Conception de campagnes et tunnels de communication client.' },
    ],
    items: [
      {
        id: 'identity-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة للهوية البصرية', image: 'work/brand-thumbnail.svg',
        alt: 'صورة مصغّرة تجريبية برمز بنفسجي لامع ونص تفاصيل الهوية',
      },
      {
        id: 'chroma-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لتحوّلات اللون', image: chroma,
        alt: 'منشور بوجوه صفراء ووردية وبنفسجية بجوار عبارة COLOR SHIFT',
      },
      {
        id: 'grain-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لملمس الطباعة', image: 'work/brand-thumbnail-grain.svg',
        alt: 'مشهد دائري بجبال مثلثة وخطوط محزّزة على خلفية مرجانية',
      },
      {
        id: 'motion-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لأثر الحركة', image: 'work/brand-thumbnail-motion.svg',
        alt: 'خطوط سماوية متموجة تترك أثرًا متكررًا بجوار عبارة AFTER IMAGE',
      },
      {
        id: 'type-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لتباين الخطوط', image: 'work/brand-thumbnail-type.svg',
        alt: 'حروف لاتينية كبيرة بخطّين مختلفين فوق دائرة برتقالية',
      },
      {
        id: 'nocturne-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لألوان الليل', image: 'work/brand-thumbnail-nocturne.svg',
        alt: 'هلال وردي ونجوم صغيرة فوق تلال داكنة بجوار عبارة Night colors',
      },
      {
        id: 'cut-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة للقصاصات الورقية', image: 'work/brand-thumbnail-cut.svg',
        alt: 'قصاصات هندسية وردية وبنفسجية فوق بطاقة مائلة بجانب عبارة CUT OUT',
      },
    ],
  },
  {
    id: 'audiovisual-media',
    title: 'Audiovisuel & Média',
    description: 'Storytelling & Post-Production',
    cover: studio,
    filters: [
      { id: 'storyboard', label: 'Scénarisation & Storyboard', description: 'Écriture de scripts pour spots, pubs et films de marque.' },
      { id: 'motion', label: 'Motion Design & Animation', description: '2D/3D, logos animés, habillages vidéo, infographies.' },
      { id: 'post-production', label: 'Montage & Post-Production', description: 'Montage dynamique, étalonnage (color grading), sound design.' },
      { id: 'shooting-direction', label: 'Direction Artistique de Shootings', description: 'Moodboards et briefs créatifs pour packshots produits et tournages.' },
    ],
    items: [
      {
        id: 'studio-direction', filterId: 'shooting-direction', title: 'تصوّر لإضاءة الاستوديو', image: studio,
        alt: 'كاميرا سينمائية تحت إضاءة الاستوديو الزرقاء والكهرمانية', position: '75% center',
      },
    ],
  },
]
