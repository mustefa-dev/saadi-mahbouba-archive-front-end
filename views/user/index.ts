import type { TableHeader } from "@/components/app-table/types";
import { UserRoles } from "~/utils/constants/enum";
import type { FilterField } from "~/utils/types/filters";

export const tableHeader: TableHeader[] = [
    {
        key: "fullName",
        label: 'الاسم'
    },
    {
        key: "email",
        label: 'البريد الالكتروني'
    },
    {
        key: "role",
        label: 'الدور'
    },
    {
        key: "project",
        label: 'المشروع'
    },
    {
        key: "location",
        label: 'الموقع'
    },
    {
        key: "isActive",
        label: 'الحضور'
    },
    {
        key: "actions",
        label: 'الإجراءات'
    },

]

export const filters : FilterField[] = [
  {
    key:"fullName",
    label:"الاسم",
    type:"text",
    icon:"ph:user",
  },
  {
    key:"email",
    label:"البريد الاكتروني",
    type:"text",
    icon:"ph:user",
  },
  {
    key:"role",
    label:"الدور",
    type:"select",
    icon:"ph:user",
    options:{
      items:UserRoles,
      itemLabel:'arName',
      itemValue:'value',
    }
  },
  {
    key:"isActive",
    label:"الحضور",
    type:"select",
    icon:"ph:user",
    options:{
      items:[
        {
          name:'حاضر',
          value:true,
        },
        {
          name:'غائب',
          value:false,
        },
      ],
      itemLabel:'name',
      itemValue:'value',
    }
  },
]
