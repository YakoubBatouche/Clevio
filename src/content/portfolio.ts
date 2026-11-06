type PortfolioFilter = {
  id: string
  label: string
  description: string
}

type PortfolioItem = {
  id: string
  filterId: string | null
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

const printPoster = 'work/brand-poster.svg'
const orbitLogo = 'work/brand-logo-orbit.svg'
const chroma = 'work/brand-thumbnail-chroma.svg'
const website = 'work/digital-experience.webp'
const studio = 'work/visual-story.webp'

export const portfolioCategories: readonly PortfolioCategory[] = [
  {
    id: 'print',
    title: 'المطبوعات',
    description: 'تصميم المطبوعات وتنسيق النصوص والصور على الورق.',
    cover: printPoster,
    filters: [
      { id: 'brochures', label: 'الكتيبات', description: 'كتيبات تعريفية تعرض المنتجات والخدمات بوضوح.' },
      { id: 'magazines', label: 'المجلات', description: 'تصميم الأغلفة وتنسيق المقالات والصور داخل المجلات.' },
      { id: 'reports', label: 'التقارير', description: 'تصميم التقارير وعرض البيانات في رسوم وجداول واضحة.' },
      { id: 'menus', label: 'قوائم الطعام', description: 'قوائم مرتّبة تسهّل قراءة الأطباق والأسعار.' },
    ],
    items: [
      {
        id: 'identity-poster', filterId: null, title: 'ملصق للهوية البصرية', image: printPoster,
        alt: 'ملصق بنفسجي تجريبي يجمع بين رمز هندسي وشبكة تصميم وعبارة من الفكرة إلى الشكل',
      },
      {
        id: 'foil-mark', filterId: null, title: 'شعار بطباعة فضية', image: 'work/brand-identity.webp',
        alt: 'رمز هندسي فضي مطبوع على علبة بنفسجية', position: 'center 28%',
      },
      {
        id: 'solar-poster', filterId: null, title: 'ملصق ساعات الشمس', image: 'work/brand-poster-solar.svg',
        alt: 'قرص شمسي ذهبي يطل على تلال داكنة بجوار عبارة «ساعات الشمس» بالإنجليزية',
      },
      {
        id: 'modular-poster', filterId: null, title: 'ملصق الوحدات الهندسية', image: 'work/brand-poster-modular.svg',
        alt: 'ملصق بأرباع دوائر ومساحات هندسية حمراء وصفراء وزرقاء',
      },
      {
        id: 'contour-poster', filterId: null, title: 'ملصق خطوط التضاريس', image: 'work/brand-poster-contours.svg',
        alt: 'خطوط طبوغرافية متداخلة وعلامات حمراء على خلفية زرقاء فاتحة',
      },
      {
        id: 'paper-poster', filterId: null, title: 'ملصق طيّات الورق', image: 'work/brand-poster-paper.svg',
        alt: 'ورقة صفراء مطوية تبرز أسطحها وظلالها على خلفية مسطّرة',
      },
      {
        id: 'letterpress-poster', filterId: null, title: 'ملصق الطباعة البارزة', image: 'work/brand-poster-letterpress.svg',
        alt: 'حرف لاتيني بطبقتين متداخلتين باللونين الأحمر والأخضر على ورق كريمي',
      },
    ],
  },
  {
    id: 'logos',
    title: 'الشعارات',
    description: 'تصميم رموز وشعارات تعبّر عن شخصية العلامة.',
    cover: orbitLogo,
    filters: [],
    items: [
      {
        id: 'orbit-mark', filterId: null, title: 'شعار المدار', image: orbitLogo,
        alt: 'مداران متقاطعان بلون أخضر داكن حول نقطة برتقالية على شبكة ورقية',
      },
      {
        id: 'terrace-mark', filterId: null, title: 'شعار الأقواس', image: 'work/brand-logo-terrace.svg',
        alt: 'ثلاثة أقواس بلون الطين على بطاقة كريمية مائلة',
      },
      {
        id: 'signal-mark', filterId: null, title: 'شعار الإشارة', image: 'work/brand-logo-signal.svg',
        alt: 'ثلاث شرائط مائلة ونقطة في شعار يعرض تنويعاته اللونية',
      },
      {
        id: 'tide-mark', filterId: null, title: 'شعار المدّ', image: 'work/brand-logo-tide.svg',
        alt: 'شارة دائرية زرقاء تضم موجتين ونقطة ذهبية',
      },
      {
        id: 'petal-mark', filterId: null, title: 'شعار البتلات', image: 'work/brand-logo-petal.svg',
        alt: 'رمز مستوحى من بتلات زهرة مع أربع عينات لونية وردية وبنفسجية',
      },
      {
        id: 'weave-mark', filterId: null, title: 'شعار النسيج', image: 'work/brand-logo-weave.svg',
        alt: 'خطّان متشابكان باللونين الذهبي والكريمي فوق خلفية داكنة',
      },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'التسويق الرقمي والنمو',
    description: 'تصميم محتوى بصري للتواصل مع الجمهور عبر القنوات الرقمية.',
    cover: chroma,
    filters: [
      { id: 'social-posts', label: 'منشورات التواصل الاجتماعي', description: 'تصميم منشورات وقوالب تناسب هوية العلامة والمنصّة.' },
      { id: 'thumbnails', label: 'الصور المصغّرة', description: 'تصميم صور مصغّرة تعرّف المشاهد بموضوع الفيديو.' },
      { id: 'stories', label: 'القصص', description: 'تصميم محتوى عمودي للقصص على منصّات التواصل.' },
      { id: 'email-signatures', label: 'توقيعات البريد الإلكتروني', description: 'توقيعات تحمل هوية العلامة وتعرض بيانات التواصل.' },
    ],
    items: [
      {
        id: 'echo-poster', filterId: 'social-posts', title: 'تصوّر لمنشور الصدى', image: 'work/brand-poster-echo.svg',
        alt: 'حلقات خضراء مائلة تتكرر حول كلمة «الصدى» بالإنجليزية على خلفية خضراء داكنة',
      },
      {
        id: 'identity-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة للهوية البصرية', image: 'work/brand-thumbnail.svg',
        alt: 'صورة مصغّرة تجريبية برمز بنفسجي لامع ونص تفاصيل الهوية',
      },
      {
        id: 'chroma-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لتحوّلات اللون', image: chroma,
        alt: 'وجوه صفراء ووردية وبنفسجية بجوار عبارة «تحوّل اللون» بالإنجليزية',
      },
      {
        id: 'grain-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لملمس الطباعة', image: 'work/brand-thumbnail-grain.svg',
        alt: 'مشهد دائري بجبال مثلثة وخطوط محزّزة على خلفية مرجانية',
      },
      {
        id: 'motion-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لأثر الحركة', image: 'work/brand-thumbnail-motion.svg',
        alt: 'خطوط سماوية متموجة تترك أثرًا متكررًا بجوار عبارة «الأثر البصري» بالإنجليزية',
      },
      {
        id: 'type-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لتباين الخطوط', image: 'work/brand-thumbnail-type.svg',
        alt: 'حروف لاتينية كبيرة بخطّين مختلفين فوق دائرة برتقالية',
      },
      {
        id: 'nocturne-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لألوان الليل', image: 'work/brand-thumbnail-nocturne.svg',
        alt: 'هلال وردي ونجوم صغيرة فوق تلال داكنة بجوار عبارة «ألوان الليل» بالإنجليزية',
      },
      {
        id: 'cut-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة للقصاصات الورقية', image: 'work/brand-thumbnail-cut.svg',
        alt: 'قصاصات هندسية وردية وبنفسجية فوق بطاقة مائلة بجانب عبارة «قصاصات» بالإنجليزية',
      },
    ],
  },
  {
    id: 'web-app',
    title: 'المواقع والتطبيقات',
    description: 'تصميم وتطوير واجهات رقمية سهلة الاستخدام.',
    cover: website,
    filters: [
      { id: 'websites', label: 'المواقع الإلكترونية', description: 'مواقع تعريفية وصفحات هبوط ومتاجر إلكترونية.' },
      { id: 'apps', label: 'التطبيقات', description: 'تصميم وتطوير تطبيقات للهواتف الذكية.' },
      { id: 'web-platforms', label: 'منصات الويب', description: 'منصّات تفاعلية تشمل لوحات التحكّم وأنظمة الحجز.' },
    ],
    items: [
      {
        id: 'website-preview', filterId: 'websites', title: 'تصوّر لواجهة ويب', image: website,
        alt: 'حاسوب محمول يعرض واجهة موقع بخلفية زرقاء داكنة', position: '30% center',
      },
    ],
  },
  {
    id: 'audiovisual-media',
    title: 'الإنتاج السمعي البصري والإعلام',
    description: 'إنتاج محتوى مرئي ومسموع من التصوير إلى المونتاج.',
    cover: studio,
    filters: [
      { id: 'reels', label: 'مقاطع ريلز', description: 'تصوير ومونتاج مقاطع عمودية قصيرة لمنصّات التواصل.' },
      { id: 'motion-design', label: 'التصميم الحركي', description: 'تحريك الشعارات والرسوم والعناصر البصرية للفيديو.' },
    ],
    items: [
      {
        id: 'studio-direction', filterId: null, title: 'تصوّر لإضاءة الاستوديو', image: studio,
        alt: 'كاميرا سينمائية تحت إضاءة الاستوديو الزرقاء والكهرمانية', position: '75% center',
      },
    ],
  },
]
