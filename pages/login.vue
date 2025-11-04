<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppInputField from '~/components/app-field/AppInputField.vue';
import { loginSchema } from '~/CONFIG/auth/login';
import { phoneNumberOTP } from '~/utils/helpers';

const phoneNumber = ref('');
const isLoading = ref(false);
const password = ref('');
const router = useRouter();
const helpers = useHelpers();
const userStore = useAppUserStore();

definePageMeta({
  layout: 'empty',
  title: 'Login',
  preview: {
    title: 'Login',
    description: 'For authentication and sign in',
    categories: ['layouts', 'authentication'],
  },
})

useHead({
  title:'تسجيل الدخول'
})

const onSubmit = async () => {
  console.log('🔑 Starting login process...');
  console.log('Phone:', phoneNumber.value);
  console.log('Password length:', password.value?.length || 0);

  isLoading.value = true;
  try {
    // Validate input
    console.log('📋 Validating input...');
    const validatedData = loginSchema.parse({
      phoneNumber: phoneNumber.value,
      password: password.value
    });
    console.log('✅ Validation passed');
    console.log('Validated phone:', validatedData.phoneNumber);

    // Step 1: Login with credentials
    console.log('🌐 Calling login API...');
    const loginResponse = await userStore.login(validatedData.phoneNumber, validatedData.password);
    console.log('📥 Login response received:', loginResponse);

    // Check if token is returned directly (no OTP required)
    if (loginResponse && loginResponse.token) {
      // Token received directly - save it and login
      console.log('✅ Token received! Saving...');

      const userData = {
        id: loginResponse.id,
        fullName: loginResponse.fullName,
        token: loginResponse.token,
        role: loginResponse.role,
        phoneNumber: loginResponse.phoneNumber,
        isVerified: loginResponse.isActive || true
      };

      console.log('👤 User data:', userData);

      // Store in localStorage
      console.log('💾 Saving to localStorage...');
      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      console.log('✅ Saved to localStorage');

      // Verify it was saved
      const savedToken = localStorage.getItem('authToken');
      console.log('🔍 Verification - Token in localStorage:', savedToken ? 'YES' : 'NO');

      userStore.user = userData;
      console.log('✅ User store updated');

      helpers.setSuccessMessage('ar', 'Login successful', 'تم تسجيل الدخول بنجاح');

      // Small delay to ensure storage is written
      console.log('⏱️ Waiting 500ms before redirect...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force reload to ensure middleware picks up the token
      console.log('🔄 Redirecting to home...');
      window.location.href = '/';
    } else {
      console.log('❌ No token in response - OTP required');
      // OTP required - proceed with OTP flow
      await userStore.sendOTP(validatedData.phoneNumber);
      sessionStorage.setItem('pendingPhoneNumber', validatedData.phoneNumber);
      router.push('/OTP');
      helpers.setSuccessMessage('ar', 'تم إرسال رمز التحقق', 'تم إرسال رمز التحقق');
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    if (error.errors) {
      // Zod validation error
      console.error('Validation error:', error.errors);
      helpers.setErrorMessage(
        { message: error.errors[0].message },
        'ar',
        'Invalid input',
        error.errors[0].message
      );
    } else {
      console.error('API error:', error.response?.data || error.message);
      helpers.setErrorMessage(
        error,
        'ar',
        'Login failed',
        'فشل تسجيل الدخول، تحقق من بياناتك'
      );
    }
  } finally {
    isLoading.value = false;
    console.log('🏁 Login process finished');
  }
}
</script>

<template>
  <div class="flex h-screen w-full flex-col items-center md:flex-row">
    <div
      class="bg-muted-100 dark:bg-muted-900 hidden h-screen w-full md:w-1/2 lg:block xl:w-2/3"
    >
      <div
        class="mx-auto flex size-full max-w-4xl items-center justify-center"
      >
        <!--Media image-->
        <img
          class="mx-auto max-w-xl"
          src="~public/logo.png"
          width="1200"
          height="996"
        >
      </div>
    </div>

    <div
      class="dark:bg-muted-800 flex h-screen w-full items-center justify-center bg-white px-6 md:mx-auto md:w-1/2 md:max-w-md lg:max-w-full lg:px-16 xl:w-1/3 xl:px-12"
    >
      <div
        class="mx-auto flex size-full max-w-xs flex-col items-center justify-start gap-10 py-8"
      >
        <div class="w-full flex-grow flex flex-col justify-center">
          <div class="w-full overflow-hidden">
            <BaseParagraph size="lg" class="text-muted-400 mb-6">
              تسجيل الدخول
            </BaseParagraph>

            <form
              method="POST"
              action=""
              class="mt-6"
              @submit.prevent="onSubmit"
            >
              <div class="space-y-4">
                <BaseInput
                  v-model="phoneNumber"
                  type="tel"
                  label="رقم الهاتف"
                  :disabled="isLoading"
                  :loading="isLoading"
                  placeholder="077xxxxxxxx"
                  icon="ph:phone-duotone"
                />
                <AppInputField
                  v-model="password"
                  type="password"
                  label="كلمة المرور"
                  :loading="isLoading"
                  :disabled="isLoading"
                  placeholder="كلمة المرور"
                  icon="ph:lock-duotone"
                />
              </div>
              <!--Submit-->
              <div class="mt-6">
                <div class="block w-full rounded-md shadow-sm">
                  <BaseButton
                    :disabled="false"
                    :loading="isLoading"
                    type="submit"
                    color="primary"
                    class="!h-11 w-full"
                  >
                    سجل الدخول
                  </BaseButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 1.0s ease, opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  position: absolute;
  transform: translate(100%,0);
  opacity: 0;
}
</style>
