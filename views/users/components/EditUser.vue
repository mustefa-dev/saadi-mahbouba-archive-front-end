<script setup lang="ts">
import axios from '~/services/app-client/axios';
import { editUserSchema } from '~/CONFIG/editUser';
import type { User } from '~/types/users';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  edited: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive({
  fullName: '',
  phoneNumber: ''
});

// Load user data when modal opens
watch(isOpen, (newVal) => {
  if (newVal && props.user) {
    formData.fullName = props.user.fullName;
    formData.phoneNumber = props.user.phoneNumber;
  }
});

const editUser = async () => {
  isLoading.value = true;
  try {
    // Validate
    const validated = editUserSchema.parse(formData);

    const apiPaths = useApiPaths();
    await axios.put(apiPaths.userById(props.user.id), validated);

    helpers.setSuccessMessage('ar', 'User updated successfully', 'تم تحديث المستخدم بنجاح');
    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    if (error.errors) {
      helpers.setErrorMessage(
        { message: error.errors[0].message },
        'ar',
        'Validation error',
        error.errors[0].message
      );
    } else {
      helpers.setErrorMessage(error, 'ar', 'Failed to update user', 'فشل تحديث المستخدم');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click="isOpen = true"
    >
      <Icon name="ph:pencil" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعديل المستخدم
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="editUser" class="p-4 md:p-6 space-y-4">
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
            حفظ
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
