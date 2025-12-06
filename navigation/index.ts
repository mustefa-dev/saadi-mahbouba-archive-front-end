const main = [
  {
    header: "القائمة الرئيسية",
  },
  {
    name: "اللوحة الرئيسية",
    icon: { name: 'ph:chart-pie-slice-duotone', class: 'w-5 h-5' },
    to: "/",
  },
  {
    name: "المحادثات",
    icon: { name: 'ph:chats-duotone', class: 'w-5 h-5' },
    to: "/chats",
  },
]

const reports = [
  {
    header: "إدارة التقارير",
  },
  {
    name: "الأرشيف",
    icon: { name: 'ph:archive-box-duotone', class: 'w-5 h-5' },
    to: "/archive",
  },
  {
    name: "التقارير",
    icon: { name: 'ph:file-text-duotone', class: 'w-5 h-5' },
    to: "/reports",
  },
  {
    name: "التصنيفات",
    icon: { name: 'ph:folders-duotone', class: 'w-5 h-5' },
    to: "/categories",
  },
]

const users = [
  {
    header: "إدارة المستخدمين",
  },
  {
    name: "المستخدمون",
    icon: { name: 'ph:users-duotone', class: 'w-5 h-5' },
    to: "/users",
  },
  {
    name: "المشرفين",
    icon: { name: 'ph:shield-check-duotone', class: 'w-5 h-5' },
    to: "/systemUsers",
  },
]

const content = [
  {
    header: "إدارة المحتوى",
  },
  {
    name: "البانرات",
    icon: { name: 'ph:image-duotone', class: 'w-5 h-5' },
    to: "/banners",
  },
]

const settings = [
  {
    header: "الإعدادات",
  },
  {
    name: "الإشعارات",
    icon: { name: 'ph:bell-duotone', class: 'w-5 h-5' },
    to: "/notifications",
  },
]

export default [
  ...main,
  ...reports,
  ...users,
  ...content,
  ...settings,
]
