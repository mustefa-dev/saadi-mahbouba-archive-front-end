const statistics = [
  {
    header:"الاحصائيات",
    role: ['Admin','SuperAdmin']
  },
  {
    name:"اللوحة الرئيسية",
    icon: { name: 'ph:chart-pie-slice-duotone', class: 'w-5 h-5' },
    to:"/",
    role: ['Admin','SuperAdmin']
  },
]

const settings = [
  {
    header:"الاعدادات",
    role: ['Admin','SuperAdmin']
  },
  {
    name:"المستخدمون",
    icon: { name: 'ph:user-duotone', class: 'w-5 h-5' },
    to:"/users",
    role: ['Admin','SuperAdmin']
  },
]

export default [
  ...statistics,
  ...settings,
]
