import { z } from 'zod'

// Phone validation: accepts 07xxxxxxxx, 7xxxxxxxx, +9647xxxxxxxx, 9647xxxxxxxx
const phoneValidation = z
  .string()
  .trim()
  .refine(
    (val) => /^[1-9][0-9]{9}$/.test(val),
    'رقم الهاتف يجب أن يتكون من 10 أرقام ولا يبدأ بـ 0'
  )

export const loginSchema = z.object({
  phoneNumber: phoneValidation,
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
})

export type LoginFormData = z.infer<typeof loginSchema>
