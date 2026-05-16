/**
 * Edit User Validation Schema
 */

import { z } from 'zod'

// Phone validation: accepts 07xxxxxxxx, 7xxxxxxxx, +9647xxxxxxxx, 9647xxxxxxxx
const phoneValidation = z
  .string()
  .trim()
  .refine(
    (val) => /^[1-9][0-9]{9}$/.test(val),
    'رقم الهاتف يجب أن يتكون من 10 أرقام ولا يبدأ بـ 0'
  )

export const editUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'الاسم الكامل يجب أن يكون على الأقل 3 أحرف'),
  phoneNumber: phoneValidation
})

export type EditUserFormData = z.infer<typeof editUserSchema>
