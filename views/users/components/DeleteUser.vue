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
const hasFiles = ref(false);
const filesMessage = ref('');

const deleteUser = async () => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    await axios.delete(apiPaths.userById(props.userId));

    helpers.setSuccessMessage('ar', 'User deleted successfully', 'تم حذف العميل بنجاح');
    isOpen.value = false;
    emit('deleted');
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.response?.data?.Error || '';
    // Check if the error is about associated files
    if (errorMessage.includes('ملف') || errorMessage.includes('ملفات')) {
      hasFiles.value = true;
      filesMessage.value = errorMessage;
    } else {
      helpers.setErrorMessage(error, 'ar', 'Failed to delete user', 'فشل حذف العميل');
    }
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  isOpen.value = false;
  hasFiles.value = false;
  filesMessage.value = '';
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

    <TairoModal :open="isOpen" size="sm" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            حذف العميل
          </h3>
          <BaseButtonClose @click="closeModal" />
        </div>
      </template>

      <div class="p-4 md:p-6" dir="rtl">
        <div class="mx-auto w-full text-center">
          <!-- Warning: Has files -->
          <template v-if="hasFiles">
            <div class="mb-4 p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl border border-danger-200 dark:border-danger-800">
              <Icon name="ph:warning-duotone" class="size-12 text-danger-500 mx-auto mb-3" />
              <p class="text-danger-600 dark:text-danger-400 font-semibold mb-2">
                لا يمكن حذف هذا العميل
              </p>
              <p class="text-sm text-muted-600 dark:text-muted-300">
                {{ filesMessage }}
              </p>
            </div>

            <BaseButton
              color="default"
              class="w-full"
              @click="closeModal"
            >
              حسناً، فهمت
            </BaseButton>
          </template>

          <!-- Normal confirm delete -->
          <template v-else>
            <p class="text-muted-500 dark:text-muted-400 mb-2">
              هل أنت متأكد من حذف العميل
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
                @click="closeModal"
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
          </template>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
