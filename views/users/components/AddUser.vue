<script setup lang="ts">
import axios from '~/services/app-client/axios';
import { addUserSchema } from '~/CONFIG/addUser';

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive({
  fullName: '',
  phoneNumber: '',
  password: ''
});

const addUser = async () => {
  isLoading.value = true;
  try {
    // Validate
    const validated = addUserSchema.parse(formData);

    const apiPaths = useApiPaths();
    await axios.post(apiPaths.users, validated);

    helpers.setSuccessMessage('ar', 'User added successfully', 'تم إضافة المستخدم بنجاح');
    isOpen.value = false;

    // Reset form
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
      <span>إضافة مستخدم</span>
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إضافة مستخدم جديد
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="addUser" class="p-4 md:p-6 space-y-4">
        <BaseInput
          v-model="formData.fullName"
          label="الاسم الكامل"
          placeholder="أدخل الاسم الكامل"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="formData.phoneNumber"
          type="tel"
          label="رقم الهاتف"
          placeholder="077xxxxxxxx"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="formData.password"
          type="password"
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور"
          :disabled="isLoading"
          required
        />

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
