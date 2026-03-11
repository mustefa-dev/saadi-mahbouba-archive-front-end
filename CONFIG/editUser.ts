/**
 * Edit User Validation Schema
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

export const editUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'الاسم الكامل يجب أن يكون على الأقل 3 أحرف'),
  phoneNumber: phoneValidation
})

export type EditUserFormData = z.infer<typeof editUserSchema>
