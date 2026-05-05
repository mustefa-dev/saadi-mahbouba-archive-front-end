/**
 * Add User Validation Schema
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

export const addUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'الاسم الكامل يجب أن يكون على الأقل 3 أحرف'),
  phoneNumber: phoneValidation,
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف')
})

export type AddUserFormData = z.infer<typeof addUserSchema>
