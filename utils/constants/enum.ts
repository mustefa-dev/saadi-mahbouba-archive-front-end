type AppEnumColor = 
"default" | "primary" | "dark" | "black" |
"default-contrast" | "muted" | "muted-contrast" | "info" |
"success" | "warning" | "danger" | "light";

type AppEnumValue = number|string|unknown;
interface AppEnum {
  name:string,
  arName?:string,
  value:AppEnumValue
  color?:AppEnumColor,
  icon?: string
}
type AppEnumGroup = Array<AppEnum>

const UserRoles : AppEnumGroup = [
  {
    arName: "المسؤل",
    name: "Admin",
    value: 1
  },
  {
    arName: "المستخدم",
    name: "User",
    value: 2
  }
]
const TicketStatus : AppEnumGroup = [
  {
    arName: "مفتوحة",
    name: "Open",
    color:'muted',
    value: 0
  },
  {
    arName: "قيد العمل",
    name: "InProgress",
    color:'warning',
    value: 1
  },
  {
    arName: "تامة",
    name: "Done",
    color:'success',
    value: 2
  },
  {
    arName: "ملغية",
    name: "Cancelled",
    color:'danger',
    value: 3
  }
]
const getEnumByValue = (enumGroup:AppEnumGroup,value:AppEnumValue)=>
{
  const appEnum = enumGroup.find((e)=>e.value===value);
  return appEnum??enumGroup[0];
}

const getEnumByKey = (enumGroup:AppEnumGroup, key:keyof typeof enumGroup[0],value:unknown)=>
{
  const appEnum = enumGroup.find((e)=>e[key]===value);
  return appEnum??enumGroup[0];
}

export{
  UserRoles,
  TicketStatus,
  getEnumByKey,
  getEnumByValue,
}
