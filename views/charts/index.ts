import type { TableHeader } from "~/components/app-table/types";

export const usersTableHeaders = [
  {
    key:"userName",
    label:"المستخدم"
  },
  {
    key:"numberOfTickets",
    label:"عدد الشكاوي المرفوعة"
  }
] as TableHeader[];
export const managersTableHeaders = [
  {
    key:"userName",
    label:"المستخدم"
  },
  {
    key:"done",
    label:"عدد الشكاوي التامة"
  },
  {
    key:"inProgress",
    label:"عدد الشكاوي قيد التنفيذ"
  },
  {
    key:"cancelled",
    label:"عدد الشكاوي الملغية"
  },
  {
    key:"open",
    label:"عدد الشكاوي المفتوحة"
  },
] as TableHeader[];
