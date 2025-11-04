/**
 * Edit User Validation Schema
 */

import { z } from 'zod'
import { phoneNumberOTP } from '~/utils/helpers'

// Phone validation: Must be exactly 11 digits starting with 077, 078, or 079
const phoneValidation = z
  .string()
  .trim()
  .refine(
    (val) => /^(077|078|079)\d{8}$/.test(val),
    'رقم الهاتف يجب أن يبدأ بـ 077 أو 078 أو 079 ويتكون من 11 رقم (مثال: 07712345678)'
  )
  .transform(phoneNumberOTP)

export const editUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'الاسم الكامل يجب أن يكون على الأقل 3 أحرف'),
  phoneNumber: phoneValidation
})

export type EditUserFormData = z.infer<typeof editUserSchema>
