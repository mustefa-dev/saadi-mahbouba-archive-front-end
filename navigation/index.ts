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
  ...users,
  ...settings,
]
