<script setup lang="ts">
import axios from '~/services/app-client/axios';

const props = defineProps<{
  userId: string;
  userName: string;
}>();

const emit = defineEmits<{
  deleted: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);

const deleteUser = async () => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    await axios.delete(apiPaths.userById(props.userId));

    helpers.setSuccessMessage('ar', 'User deleted successfully', 'تم حذف المستخدم بنجاح');
    isOpen.value = false;
    emit('deleted');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to delete user', 'فشل حذف المستخدم');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="danger"
      variant="pastel"
      @click="isOpen = true"
    >
      <Icon name="ph:trash" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="sm" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            حذف المستخدم
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 md:p-6" dir="rtl">
        <div class="mx-auto w-full text-center">
          <p class="text-muted-500 dark:text-muted-400 mb-2">
            هل أنت متأكد من حذف المستخدم
          </p>
          <p class="text-muted-900 dark:text-white font-semibold mb-6">
            {{ userName }}؟
          </p>
          <p class="text-muted-400 text-sm mb-6">
            لا يمكن التراجع عن هذا الإجراء
          </p>

          <div class="flex gap-x-2 justify-center">
            <BaseButton
              color="default"
              @click="isOpen = false"
            >
              إلغاء
            </BaseButton>
            <BaseButton
              color="danger"
              :loading="isLoading"
              :disabled="isLoading"
              @click="deleteUser"
            >
              حذف
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
