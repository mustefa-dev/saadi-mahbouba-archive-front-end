<script setup lang="ts">
import axios from '~/services/app-client/axios';

const props = defineProps<{
  bannerId: string;
  bannerTitle: string;
}>();

const emit = defineEmits<{
  deleted: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const deleteBanner = async () => {
  isLoading.value = true;
  try {
    await axios.delete(apiPaths.bannerById(props.bannerId));

    helpers.setSuccessMessage('ar', 'Banner deleted successfully', 'تم حذف البانر بنجاح');
    isOpen.value = false;
    emit('deleted');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to delete banner', 'فشل حذف البانر');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton size="sm" color="danger" variant="pastel" @click="isOpen = true">
      <Icon name="ph:trash" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="sm" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            حذف البانر
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="text-center">
          <Icon name="ph:warning-circle-duotone" class="size-16 text-danger-500 mx-auto mb-4" />
          <p class="text-muted-600 dark:text-muted-300">
            هل أنت متأكد من حذف البانر
            <strong class="text-muted-900 dark:text-white">"{{ bannerTitle }}"</strong>؟
          </p>
          <p class="text-sm text-muted-400 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
        </div>

        <div class="flex gap-x-2 justify-end pt-6 mt-6 border-t">
          <BaseButton type="button" color="default" @click="isOpen = false">
            إلغاء
          </BaseButton>
          <BaseButton
            color="danger"
            :loading="isLoading"
            :disabled="isLoading"
            @click="deleteBanner"
          >
            حذف
          </BaseButton>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
