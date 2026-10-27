export type Panel = 'services' | 'work' | 'about' | 'contact'

export const navigation: { label: string; panel: Panel | null }[] = [
  { label: 'الرئيسية', panel: null },
  { label: 'خدماتنا', panel: 'services' },
  { label: 'أعمالنا', panel: 'work' },
  { label: 'تواصل معنا', panel: 'contact' },
  { label: 'من نحن', panel: 'about' },
]

export const services = [
  'التصميم الإبداعي', 'التسويق الرقمي', 'التطوير التقني', 'الإنتاج السمعي البصري',
  'الهوية والعلامة التجارية', 'الاستشارات التسويقية', 'إدارة الفعاليات', 'الدعم والحلول التقنية',
]

export const workAreas = [
  { title: 'هوية بصرية متكاملة', description: 'حضور مميز يعبّر عن جوهر العلامة.' },
  { title: 'تجارب رقمية تفاعلية', description: 'تجارب سهلة، مصممة لتترك أثرًا.' },
  { title: 'قصص تُروى بالصورة', description: 'محتوى يحوّل الرسالة إلى تجربة.' },
]
