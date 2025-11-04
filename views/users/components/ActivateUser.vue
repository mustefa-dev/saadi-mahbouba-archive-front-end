<script setup lang="ts">
import axios from '~/services/app-client/axios';

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  activated: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);

const activateUser = async () => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    await axios.put(apiPaths.approveUser(props.userId));

    helpers.setSuccessMessage('ar', 'User activated successfully', 'تم تفعيل المستخدم بنجاح');
    isOpen.value = false;
    emit('activated');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to activate user', 'فشل تفعيل المستخدم');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="success"
      variant="pastel"
      @click="isOpen = true"
    >
      تفعيل الحساب
    </BaseButton>

    <TairoModal :open="isOpen" size="sm" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تفعيل الحساب
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <p class="text-muted-500 dark:text-muted-400 mb-6">
            هل أنت متأكد من تفعيل هذا الحساب؟
          </p>

          <div class="flex gap-x-2 justify-center">
            <BaseButton
              color="default"
              @click="isOpen = false"
            >
              إلغاء
            </BaseButton>
            <BaseButton
              color="success"
              :loading="isLoading"
              :disabled="isLoading"
              @click="activateUser"
            >
              تفعيل
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
