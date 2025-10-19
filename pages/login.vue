<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppInputField from '~/components/app-field/AppInputField.vue';
const email = ref();
const isLoading = ref(false);
const password = ref();
const router = useRouter();

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
const onSubmit = async ()=>{
  isLoading.value = true;
  try{
    await useAppUserStore().login(email.value,password.value);
    router.push('/tickets')
  }catch{
    useToast({message:'حدث خطا في تسجيل الدخول',isError:true})
    isLoading.value = false;
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
                  v-model="email"
                  type="email"
                  label="البريد الالكتروني"
                  :disabled="isLoading"
                  :loading="isLoading"
                  placeholder="البريد الالكتروني"
                  icon="ph:user-duotone"
                />
                <AppInputField
                  v-model="password"
                  type="password"
                  label="رمز السر"
                  :loading="isLoading"
                  :disabled="isLoading"
                  placeholder="رمز السر"
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
