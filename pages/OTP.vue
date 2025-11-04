<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useAppUserStore();
const helpers = useHelpers();

const otpInputs = ref<string[]>(['', '', '', '', '', '']);
const inputRefs = ref<HTMLInputElement[]>([]);
const isLoading = ref(false);
const countdown = ref(60);
const canResend = ref(false);
const phoneNumber = ref('');

let countdownInterval: NodeJS.Timeout | null = null;

definePageMeta({
  layout: 'empty',
  title: 'OTP Verification',
})

useHead({
  title: 'التحقق من الرمز'
})

onMounted(() => {
  // Get phone number from session storage
  const pendingPhone = sessionStorage.getItem('pendingPhoneNumber');
  if (!pendingPhone) {
    router.push('/login');
    return;
  }
  phoneNumber.value = pendingPhone;

  // Focus first input
  if (inputRefs.value[0]) {
    inputRefs.value[0].focus();
  }

  // Start countdown
  startCountdown();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

const startCountdown = () => {
  countdown.value = 60;
  canResend.value = false;

  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      canResend.value = true;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    }
  }, 1000);
};

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    target.value = otpInputs.value[index];
    return;
  }

  otpInputs.value[index] = value.slice(-1); // Only take last digit

  // Auto-focus next input
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }

  // Auto-submit when all filled
  if (index === 5 && value && otpInputs.value.every(v => v !== '')) {
    verifyOTP();
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text');

  if (pastedData && /^\d{6}$/.test(pastedData)) {
    const digits = pastedData.split('');
    otpInputs.value = digits;
    inputRefs.value[5]?.focus();

    // Auto-verify after paste
    setTimeout(() => verifyOTP(), 100);
  }
};

const verifyOTP = async () => {
  const code = otpInputs.value.join('');

  if (code.length !== 6) {
    helpers.setErrorMessage(
      { message: 'يجب إدخال جميع الأرقام' },
      'ar',
      'Please enter all digits',
      'يجب إدخال جميع الأرقام'
    );
    return;
  }

  isLoading.value = true;

  try {
    await userStore.verifyOTP(phoneNumber.value, code);

    helpers.setSuccessMessage('ar', 'تم التحقق بنجاح', 'تم التحقق بنجاح');

    // Clear session storage
    sessionStorage.removeItem('pendingPhoneNumber');

    // Reload to trigger auth initialization
    window.location.href = '/';
  } catch (error: any) {
    helpers.setErrorMessage(
      error,
      'ar',
      'Verification failed',
      'رمز التحقق غير صحيح'
    );
    // Clear inputs on error
    otpInputs.value = ['', '', '', '', '', ''];
    inputRefs.value[0]?.focus();
  } finally {
    isLoading.value = false;
  }
};

const resendOTP = async () => {
  if (!canResend.value) return;

  isLoading.value = true;

  try {
    await userStore.sendOTP(phoneNumber.value);
    helpers.setSuccessMessage('ar', 'تم إعادة إرسال الرمز', 'تم إعادة إرسال الرمز');
    startCountdown();
  } catch (error: any) {
    helpers.setErrorMessage(
      error,
      'ar',
      'Failed to resend OTP',
      'فشل إعادة إرسال الرمز'
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex h-screen w-full items-center justify-center bg-white dark:bg-muted-800">
    <div class="mx-auto w-full max-w-md px-6">
      <div class="text-center mb-8">
        <BaseParagraph size="2xl" class="font-bold mb-2">
          التحقق من رقم الهاتف
        </BaseParagraph>
        <BaseParagraph size="sm" class="text-muted-400">
          أدخل الرمز المرسل إلى رقم هاتفك
        </BaseParagraph>
      </div>

      <div class="flex justify-center gap-3 mb-6" dir="ltr">
        <input
          v-for="(digit, index) in otpInputs"
          :key="index"
          :ref="el => { if (el) inputRefs[index] = el as HTMLInputElement }"
          v-model="otpInputs[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          :disabled="isLoading"
          class="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-muted-900 border-muted-300 dark:border-muted-700"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="index === 0 ? handlePaste($event) : null"
        />
      </div>

      <div class="space-y-4">
        <BaseButton
          :disabled="isLoading || otpInputs.some(v => v === '')"
          :loading="isLoading"
          type="button"
          color="primary"
          class="!h-11 w-full"
          @click="verifyOTP"
        >
          تحقق
        </BaseButton>

        <div class="text-center">
          <BaseParagraph size="sm" class="text-muted-400 mb-2">
            لم يصلك الرمز؟
          </BaseParagraph>
          <BaseButton
            v-if="canResend"
            :disabled="isLoading"
            type="button"
            color="default"
            variant="plain"
            @click="resendOTP"
          >
            إعادة الإرسال
          </BaseButton>
          <BaseParagraph v-else size="sm" class="text-primary-500">
            إعادة الإرسال خلال {{ countdown }} ثانية
          </BaseParagraph>
        </div>

        <div class="text-center">
          <BaseButton
            type="button"
            color="default"
            variant="plain"
            @click="router.push('/login')"
          >
            العودة لتسجيل الدخول
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
