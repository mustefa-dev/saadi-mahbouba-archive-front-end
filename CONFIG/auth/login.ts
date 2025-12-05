import { z } from 'zod'
import { phoneNumberOTP } from '~/utils/helpers'

const phoneValidation = z
  .string()
  .trim()
  .refine(
    (val) => /^(077|078|079)\d{8}$/.test(val),
    'رقم الهاتف يجب أن يبدأ بـ 077 أو 078 أو 079 ويتكون من 11 رقم (مثال: 07712345678)'
  )
  .transform(phoneNumberOTP)

export const loginSchema = z.object({
  phoneNumber: phoneValidation,
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
})

export type LoginFormData = z.infer<typeof loginSchema>
