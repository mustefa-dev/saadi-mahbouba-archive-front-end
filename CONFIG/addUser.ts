/**
 * Add User Validation Schema
 */

import { z } from 'zod'

// Phone validation: accepts 07xxxxxxxx, 7xxxxxxxx, +9647xxxxxxxx, 9647xxxxxxxx
const phoneValidation = z
  .string()
  .trim()
  .refine(
    (val) => /^(\+?964|0)?7[0-9]{9}$/.test(val),
    'رقم الهاتف غير صحيح (مثال: 07712345678)'
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
