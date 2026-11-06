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
    title: 'المطبوعات والهوية البصرية',
    description: 'تصميم المواد المطبوعة والمادية',
    cover: identity,
    filters: [
      { id: 'branding', label: 'تصميم العلامة التجارية', description: 'تصميم الشعارات، وإعداد أدلة الهوية البصرية وإرشادات استخدامها، والإخراج الفني.' },
      { id: 'editorial', label: 'المطبوعات التحريرية والكتالوجات', description: 'تصميم الكتيبات والمجلات والتقارير وقوائم الطعام.' },
      { id: 'packaging', label: 'التغليف والملصقات التعريفية', description: 'تصميم عبوات المنتجات الغذائية ومستحضرات التجميل ومنتجات التجزئة.' },
      { id: 'signage', label: 'اللافتات والطباعة كبيرة الحجم', description: 'تصميم اللافتات وأجنحة المعارض وتغليف الواجهات واللافتات القابلة للّف.' },
      { id: 'marketing-materials', label: 'المواد التسويقية', description: 'تصميم المنشورات الورقية وبطاقات العمل والملصقات والهدايا الترويجية.' },
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
        alt: 'حلقات خضراء مائلة تتكرر حول كلمة «الصدى» بالإنجليزية على خلفية خضراء داكنة',
      },
      {
        id: 'terrace-mark', filterId: 'branding', title: 'شعار الأقواس', image: 'work/brand-logo-terrace.svg',
        alt: 'ثلاثة أقواس بلون الطين على بطاقة كريمية مائلة',
      },
      {
        id: 'solar-poster', filterId: 'marketing-materials', title: 'ملصق ساعات الشمس', image: 'work/brand-poster-solar.svg',
        alt: 'قرص شمسي ذهبي يطل على تلال داكنة بجوار عبارة «ساعات الشمس» بالإنجليزية',
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
    title: 'المواقع والتطبيقات',
    description: 'التصميم التقني، وتصميم الواجهات وتجربة المستخدم، والبرمجة',
    cover: website,
    filters: [
      { id: 'corporate-websites', label: 'المواقع التعريفية ومواقع المؤسسات', description: 'مواقع للشركات والمؤسسات ومواقع لعرض الأعمال.' },
      { id: 'ecommerce', label: 'التجارة الإلكترونية وتجارة التجزئة', description: 'متاجر إلكترونية، وكتالوجات متصلة بالمتاجر، وتصميم رحلة الشراء.' },
      { id: 'mobile-apps', label: 'تطبيقات الهواتف الذكية', description: 'تصميم واجهات التطبيقات وتجربة استخدامها وتطويرها لنظامَي آي أو إس وأندرويد.' },
      { id: 'web-apps', label: 'تطبيقات الويب وأدوات العمل', description: 'منصات مصمّمة حسب الطلب، ولوحات تحكّم، وأنظمة حجز.' },
      { id: 'landing-uiux', label: 'صفحات الهبوط وتصميم الواجهات وتجربة المستخدم', description: 'صفحات هبوط للحملات الإعلانية مصمّمة لزيادة التحويلات، ونماذج واجهات في فيغما، وأنظمة تصميم.' },
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
    title: 'التسويق الرقمي والنمو',
    description: 'الاستراتيجية واستقطاب العملاء',
    cover: chroma,
    filters: [
      { id: 'social-media', label: 'الاستراتيجية ووسائل التواصل الاجتماعي', description: 'وضع التوجّه التحريري، والإخراج الفني لحسابات التواصل، وتصميم قوالب المنشورات.' },
      { id: 'ads', label: 'الحملات الإعلانية', description: 'تصميم مواد إعلانية لفيسبوك وإنستغرام على منصّات ميتا، ولإعلانات غوغل.' },
      { id: 'seo', label: 'تحسين الظهور في محركات البحث', description: 'تحسين الملف التجاري على غوغل والظهور على خرائط غوغل وفي نتائج البحث المجانية.' },
      { id: 'direct-marketing', label: 'التسويق عبر البريد الإلكتروني وواتساب', description: 'تصميم الحملات وتخطيط مراحل التواصل مع العملاء.' },
    ],
    items: [
      {
        id: 'identity-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة للهوية البصرية', image: 'work/brand-thumbnail.svg',
        alt: 'صورة مصغّرة تجريبية برمز بنفسجي لامع ونص تفاصيل الهوية',
      },
      {
        id: 'chroma-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لتحوّلات اللون', image: chroma,
        alt: 'منشور بوجوه صفراء ووردية وبنفسجية بجوار عبارة «تحوّل اللون» بالإنجليزية',
      },
      {
        id: 'grain-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لملمس الطباعة', image: 'work/brand-thumbnail-grain.svg',
        alt: 'مشهد دائري بجبال مثلثة وخطوط محزّزة على خلفية مرجانية',
      },
      {
        id: 'motion-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لأثر الحركة', image: 'work/brand-thumbnail-motion.svg',
        alt: 'خطوط سماوية متموجة تترك أثرًا متكررًا بجوار عبارة «الأثر البصري» بالإنجليزية',
      },
      {
        id: 'type-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لتباين الخطوط', image: 'work/brand-thumbnail-type.svg',
        alt: 'حروف لاتينية كبيرة بخطّين مختلفين فوق دائرة برتقالية',
      },
      {
        id: 'nocturne-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة لألوان الليل', image: 'work/brand-thumbnail-nocturne.svg',
        alt: 'هلال وردي ونجوم صغيرة فوق تلال داكنة بجوار عبارة «ألوان الليل» بالإنجليزية',
      },
      {
        id: 'cut-thumbnail', filterId: 'social-media', title: 'صورة مصغّرة للقصاصات الورقية', image: 'work/brand-thumbnail-cut.svg',
        alt: 'قصاصات هندسية وردية وبنفسجية فوق بطاقة مائلة بجانب عبارة «قصاصات» بالإنجليزية',
      },
    ],
  },
  {
    id: 'audiovisual-media',
    title: 'الإنتاج السمعي البصري والإعلام',
    description: 'السرد القصصي وما بعد الإنتاج',
    cover: studio,
    filters: [
      { id: 'storyboard', label: 'كتابة السيناريو واللوحات القصصية', description: 'كتابة النصوص للمقاطع الترويجية والإعلانات وأفلام العلامات التجارية.' },
      { id: 'motion', label: 'التصميم الحركي والرسوم المتحركة', description: 'رسوم متحركة ثنائية وثلاثية الأبعاد، وشعارات متحركة، وعناصر بصرية للفيديو، ورسوم معلوماتية.' },
      { id: 'post-production', label: 'المونتاج وما بعد الإنتاج', description: 'مونتاج بإيقاع حيوي، ومعالجة الألوان، وتصميم الصوت.' },
      { id: 'shooting-direction', label: 'الإخراج الفني لجلسات التصوير', description: 'إعداد لوحات مرجعية بصرية وموجزات إبداعية لتصوير المنتجات والفيديو.' },
    ],
    items: [
      {
        id: 'studio-direction', filterId: 'shooting-direction', title: 'تصوّر لإضاءة الاستوديو', image: studio,
        alt: 'كاميرا سينمائية تحت إضاءة الاستوديو الزرقاء والكهرمانية', position: '75% center',
      },
    ],
  },
]
