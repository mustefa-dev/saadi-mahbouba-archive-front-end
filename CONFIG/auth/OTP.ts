/**
 * OTP Verification Schema
 */

import { z } from 'zod'

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d+$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط')
})

export type OTPFormData = z.infer<typeof otpSchema>
