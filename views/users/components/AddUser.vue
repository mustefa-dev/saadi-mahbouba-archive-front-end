<script setup lang="ts">
import axios from '~/services/app-client/axios';
import { addUserSchema } from '~/CONFIG/addUser';
import { validatePhoneNumber } from '~/utils/helpers';

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);
const isPasswordVisible = ref(false);

const formData = reactive({
  fullName: '',
  phoneNumber: '',
  password: ''
});

const phoneError = ref('');

watch(() => formData.phoneNumber, (val) => {
  if (!val) phoneError.value = '';
  else if (!validatePhoneNumber(val)) phoneError.value = 'رقم الهاتف يجب أن يتكون من 10 أرقام ولا يبدأ بـ 0';
  else phoneError.value = '';
});

const addUser = async () => {
  isLoading.value = true;
  try {
    const validated = addUserSchema.parse(formData);

    const apiPaths = useApiPaths();
    await axios.post(apiPaths.admins, validated);

    helpers.setSuccessMessage('ar', 'User added successfully', 'تم إضافة المستخدم بنجاح');
    isOpen.value = false;

    formData.fullName = '';
    formData.phoneNumber = '';
    formData.password = '';

    emit('added');
  } catch (error: any) {
    if (error.errors) {
      helpers.setErrorMessage(
        { message: error.errors[0].message },
        'ar',
        'Validation error',
        error.errors[0].message
      );
    } else {
      helpers.setErrorMessage(error, 'ar', 'Failed to add user', 'فشل إضافة المستخدم');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      color="primary"
      @click="isOpen = true"
    >
      <Icon name="ph:plus" class="size-4" />
      <span>إضافة مشرف</span>
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إضافة مشرف جديد
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="addUser" class="p-4 md:p-6 space-y-4" dir="rtl">
        <BaseInput
          v-model="formData.fullName"
          label="الاسم الكامل"
          placeholder="أدخل الاسم الكامل"
          :disabled="isLoading"
          required
        />

        <div>
          <BaseInput
            v-model="formData.phoneNumber"
            type="tel"
            label="رقم الهاتف (10 أرقام)"
            placeholder="77XXXXXXXX"
            :disabled="isLoading"
            :classes="{ input: phoneError ? 'border-danger-500' : '' }"
            required
          />
          <p v-if="phoneError" class="text-danger-500 text-[10px] mt-1">{{ phoneError }}</p>
        </div>

        <BaseInput
          v-model="formData.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور"
          :disabled="isLoading"
          required
        >
          <template #action>
            <button
              type="button"
              class="m-auto h-full text-muted-400 hover:text-primary-500 absolute end-0 top-0 z-[1] flex size-10 items-center justify-center transition-colors duration-300"
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <Icon :name="isPasswordVisible ? 'ph:eye-slash' : 'ph:eye'" class="size-5" />
            </button>
          </template>
        </BaseInput>

        <div class="flex gap-x-2 justify-end pt-4">
          <BaseButton
            type="button"
            color="default"
            @click="isOpen = false"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            إضافة
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
