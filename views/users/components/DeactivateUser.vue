<script setup lang="ts">
import axios from '~/services/app-client/axios';

const props = defineProps<{
  userId: string;
  userName?: string;
}>();

const emit = defineEmits<{
  deactivated: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const deactivateUser = async () => {
  isLoading.value = true;
  try {
    await axios.put(apiPaths.deactivateUser(props.userId));

    helpers.setSuccessMessage('ar', 'User deactivated successfully', 'تم إلغاء تفعيل المستخدم بنجاح');
    isOpen.value = false;
    emit('deactivated');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to deactivate user', 'فشل إلغاء تفعيل المستخدم');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="warning"
      variant="pastel"
      data-nui-tooltip="إلغاء التفعيل"
      @click="isOpen = true"
    >
      <Icon name="ph:user-minus" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="sm" @close="isOpen = false">
      <template #header>
        <div dir="rtl" class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إلغاء تفعيل الحساب
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div dir="rtl" class="p-4 md:p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="ph:warning-circle-duotone" class="size-8 text-warning-500" />
          </div>
          <p class="text-muted-600 dark:text-muted-300">
            هل أنت متأكد من إلغاء تفعيل حساب
            <span v-if="userName" class="font-semibold text-muted-900 dark:text-white">{{ userName }}</span>؟
          </p>
          <p class="text-sm text-muted-400 mt-2">
            سيتم تغيير حالة الحساب إلى "بانتظار الموافقة" ولن يتمكن المستخدم من تسجيل الدخول
          </p>
        </div>

        <div class="flex items-center justify-center gap-3">
          <BaseButton
            type="button"
            color="default"
            @click="isOpen = false"
          >
            إلغاء
          </BaseButton>

          <BaseButton
            type="button"
            color="warning"
            :loading="isLoading"
            :disabled="isLoading"
            @click="deactivateUser"
          >
            <Icon name="ph:user-minus" class="size-4 me-1" />
            إلغاء التفعيل
          </BaseButton>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
