import { services } from './site'

type PortfolioFilter = {
  id: string
  label: string
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
  filters: readonly PortfolioFilter[]
  items: readonly PortfolioItem[]
}

const identity = 'work/brand-identity.webp'
const digital = 'work/digital-experience.webp'
const film = 'work/visual-story.webp'

export const portfolioCategories: readonly PortfolioCategory[] = [
  {
    id: 'creative-design',
    title: services[0],
    filters: [
      { id: 'graphics', label: 'تصميم جرافيكي' },
      { id: 'packaging', label: 'تغليف' },
    ],
    items: [
      {
        id: 'glass-composition', filterId: 'graphics', title: 'تكوين زجاجي', image: digital,
        alt: 'شكل زجاجي أزرق يظهر على شاشة حاسوب محمول', position: '78% center',
      },
      {
        id: 'packaging-materials', filterId: 'packaging', title: 'خامات التغليف', image: identity,
        alt: 'خامات بنفسجية وفضية متباينة على علب تغليف', position: 'center bottom',
      },
    ],
  },
  {
    id: 'digital-marketing',
    title: services[1],
    filters: [
      { id: 'landing-pages', label: 'صفحات هبوط' },
      { id: 'video-content', label: 'محتوى مرئي' },
    ],
    items: [
      {
        id: 'campaign-page', filterId: 'landing-pages', title: 'تصوّر لواجهة حملة رقمية', image: digital,
        alt: 'واجهة موقع تجريبية على حاسوب محمول في مشهد بإضاءة زرقاء',
      },
      {
        id: 'campaign-production', filterId: 'video-content', title: 'تصوّر لكواليس التصوير', image: film,
        alt: 'كاميرا سينمائية تحت إضاءة الاستوديو الزرقاء والكهرمانية', position: '75% center',
      },
    ],
  },
  {
    id: 'development',
    title: services[2],
    filters: [
      { id: 'websites', label: 'مواقع إلكترونية' },
      { id: 'interfaces', label: 'واجهات المستخدم' },
    ],
    items: [
      {
        id: 'website-preview', filterId: 'websites', title: 'عرض لموقع إلكتروني', image: digital,
        alt: 'حاسوب محمول يعرض واجهة موقع بخلفية زرقاء داكنة', position: '30% center',
      },
      {
        id: 'interface-detail', filterId: 'interfaces', title: 'تفاصيل واجهة رقمية', image: digital,
        alt: 'عناصر واجهة موقع بألوان زرقاء ولمسات خضراء', position: '92% center',
      },
    ],
  },
  {
    id: 'audiovisual',
    title: services[3],
    filters: [
      { id: 'filming', label: 'تصوير' },
      { id: 'lighting', label: 'إضاءة' },
    ],
    items: [
      {
        id: 'camera-rig', filterId: 'filming', title: 'تجهيز كاميرا سينمائية', image: film,
        alt: 'كاميرا سينمائية مع شاشة مراقبة وملحقات تصوير', position: '20% center',
      },
      {
        id: 'studio-lighting', filterId: 'lighting', title: 'معالجة الإضاءة في الاستوديو', image: film,
        alt: 'ضوء كهرماني يبرز عدسة الكاميرا في استوديو بإضاءة زرقاء', position: '95% center',
      },
    ],
  },
  {
    id: 'brand-identity',
    title: services[4],
    filters: [
      { id: 'logos', label: 'شعارات' },
      { id: 'posters', label: 'ملصقات' },
      { id: 'thumbnails', label: 'صور مصغّرة' },
    ],
    items: [
      {
        id: 'foil-mark', filterId: 'logos', title: 'شعار بطباعة فضية', image: identity,
        alt: 'رمز هندسي فضي مطبوع على علبة بنفسجية', position: 'center 28%',
      },
      {
        id: 'identity-poster', filterId: 'posters', title: 'ملصق للهوية البصرية', image: 'work/brand-poster.svg',
        alt: 'ملصق بنفسجي تجريبي يجمع بين رمز هندسي وشبكة تصميم وعبارة من الفكرة إلى الشكل',
      },
      {
        id: 'identity-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة للهوية البصرية', image: 'work/brand-thumbnail.svg',
        alt: 'صورة مصغّرة تجريبية برمز بنفسجي لامع ونص تفاصيل الهوية',
      },
      {
        id: 'orbit-mark', filterId: 'logos', title: 'شعار المدار', image: 'work/brand-logo-orbit.svg',
        alt: 'مداران متقاطعان بلون أخضر داكن حول نقطة برتقالية على شبكة ورقية',
      },
      {
        id: 'echo-poster', filterId: 'posters', title: 'ملصق الصدى', image: 'work/brand-poster-echo.svg',
        alt: 'حلقات خضراء مائلة تتكرر حول كلمة ECHO على خلفية خضراء داكنة',
      },
      {
        id: 'chroma-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لتحوّلات اللون', image: 'work/brand-thumbnail-chroma.svg',
        alt: 'منشور بوجوه صفراء ووردية وبنفسجية بجوار عبارة COLOR SHIFT',
      },
      {
        id: 'terrace-mark', filterId: 'logos', title: 'شعار الأقواس', image: 'work/brand-logo-terrace.svg',
        alt: 'ثلاثة أقواس بلون الطين على بطاقة كريمية مائلة',
      },
      {
        id: 'solar-poster', filterId: 'posters', title: 'ملصق ساعات الشمس', image: 'work/brand-poster-solar.svg',
        alt: 'قرص شمسي ذهبي يطل على تلال داكنة بجوار عبارة Solar hours',
      },
      {
        id: 'grain-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لملمس الطباعة', image: 'work/brand-thumbnail-grain.svg',
        alt: 'مشهد دائري بجبال مثلثة وخطوط محزّزة على خلفية مرجانية',
      },
      {
        id: 'signal-mark', filterId: 'logos', title: 'شعار الإشارة', image: 'work/brand-logo-signal.svg',
        alt: 'ثلاث شرائط مائلة ونقطة في شعار يعرض تنويعاته اللونية',
      },
      {
        id: 'modular-poster', filterId: 'posters', title: 'ملصق الوحدات الهندسية', image: 'work/brand-poster-modular.svg',
        alt: 'ملصق بأرباع دوائر ومساحات هندسية حمراء وصفراء وزرقاء',
      },
      {
        id: 'motion-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لأثر الحركة', image: 'work/brand-thumbnail-motion.svg',
        alt: 'خطوط سماوية متموجة تترك أثرًا متكررًا بجوار عبارة AFTER IMAGE',
      },
      {
        id: 'tide-mark', filterId: 'logos', title: 'شعار المدّ', image: 'work/brand-logo-tide.svg',
        alt: 'شارة دائرية زرقاء تضم موجتين ونقطة ذهبية',
      },
      {
        id: 'contour-poster', filterId: 'posters', title: 'ملصق خطوط التضاريس', image: 'work/brand-poster-contours.svg',
        alt: 'خطوط طبوغرافية متداخلة وعلامات حمراء على خلفية زرقاء فاتحة',
      },
      {
        id: 'type-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لتباين الخطوط', image: 'work/brand-thumbnail-type.svg',
        alt: 'حروف لاتينية كبيرة بخطّين مختلفين فوق دائرة برتقالية',
      },
      {
        id: 'petal-mark', filterId: 'logos', title: 'شعار البتلات', image: 'work/brand-logo-petal.svg',
        alt: 'رمز مستوحى من بتلات زهرة مع أربع عينات لونية وردية وبنفسجية',
      },
      {
        id: 'paper-poster', filterId: 'posters', title: 'ملصق طيّات الورق', image: 'work/brand-poster-paper.svg',
        alt: 'ورقة صفراء مطوية تبرز أسطحها وظلالها على خلفية مسطّرة',
      },
      {
        id: 'nocturne-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة لألوان الليل', image: 'work/brand-thumbnail-nocturne.svg',
        alt: 'هلال وردي ونجوم صغيرة فوق تلال داكنة بجوار عبارة Night colors',
      },
      {
        id: 'weave-mark', filterId: 'logos', title: 'شعار النسيج', image: 'work/brand-logo-weave.svg',
        alt: 'خطّان متشابكان باللونين الذهبي والكريمي فوق خلفية داكنة',
      },
      {
        id: 'letterpress-poster', filterId: 'posters', title: 'ملصق الطباعة البارزة', image: 'work/brand-poster-letterpress.svg',
        alt: 'حرف لاتيني مطبوع بطبقتين حمراوين وخضراوين متداخلتين على ورق كريمي',
      },
      {
        id: 'cut-thumbnail', filterId: 'thumbnails', title: 'صورة مصغّرة للقصاصات الورقية', image: 'work/brand-thumbnail-cut.svg',
        alt: 'قصاصات هندسية وردية وبنفسجية فوق بطاقة مائلة بجانب عبارة CUT OUT',
      },
    ],
  },
  {
    id: 'marketing-consulting',
    title: services[5],
    filters: [
      { id: 'positioning', label: 'تموضع العلامة' },
      { id: 'channels', label: 'القنوات الرقمية' },
    ],
    items: [
      {
        id: 'brand-direction', filterId: 'positioning', title: 'اتجاه بصري لعلامة تجارية', image: identity,
        alt: 'مجموعة علب بتغليف بنفسجي موحّد ورمز فضي', position: 'center 36%',
      },
      {
        id: 'digital-touchpoint', filterId: 'channels', title: 'نقطة تواصل عبر الموقع', image: digital,
        alt: 'واجهة ويب زرقاء معروضة على شاشة حاسوب محمول', position: '55% center',
      },
    ],
  },
  {
    id: 'events',
    title: services[6],
    filters: [
      { id: 'event-identity', label: 'هوية الفعالية' },
      { id: 'coverage', label: 'تغطية مرئية' },
    ],
    items: [
      {
        id: 'event-materials', filterId: 'event-identity', title: 'تصوّر لتغليف مواد الفعالية', image: identity,
        alt: 'علب تغليف بخامات بنفسجية ونقوش هندسية', position: 'center 72%',
      },
      {
        id: 'coverage-setup', filterId: 'coverage', title: 'تجهيز التصوير للتغطية المرئية', image: film,
        alt: 'كاميرا سينمائية مجهّزة بشاشة خارجية وإضاءة للاستوديو', position: '40% center',
      },
    ],
  },
  {
    id: 'technical-support',
    title: services[7],
    filters: [
      { id: 'site-support', label: 'دعم المواقع' },
      { id: 'equipment', label: 'التجهيزات التقنية' },
    ],
    items: [
      {
        id: 'site-review', filterId: 'site-support', title: 'معاينة واجهة الموقع', image: digital,
        alt: 'حاسوب محمول يعرض واجهة موقع تجريبية', position: '60% center',
      },
      {
        id: 'equipment-setup', filterId: 'equipment', title: 'تجهيز معدات الإنتاج', image: film,
        alt: 'هيكل كاميرا سينمائية مع أسلاك وشاشة متابعة', position: '10% center',
      },
    ],
  },
]
