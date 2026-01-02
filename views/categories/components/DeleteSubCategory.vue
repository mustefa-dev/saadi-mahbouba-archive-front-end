<script setup lang="ts">
const props = defineProps<{
  subCategoryId: string;
  subCategoryName: string;
}>();

const emit = defineEmits(['deleted']);
const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const handleDelete = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.categoryById(props.subCategoryId), {
      method: 'DELETE'
    });

    helpers.setSuccessMessage('ar', 'Subcategory deleted successfully', 'تم حذف التصنيف الفرعي بنجاح');
    isOpen.value = false;
    emit('deleted');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to delete subcategory', 'حدث خطأ أثناء حذف التصنيف الفرعي');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButtonIcon @click="isOpen = true" size="sm" color="danger">
      <Icon name="ph:trash" class="h-4 w-4" />
    </BaseButtonIcon>

    <BaseModal :open="isOpen" @close="isOpen = false" size="sm">
      <template #header>
        <div class="flex items-center gap-2 text-danger-500">
          <Icon name="ph:warning-circle" class="h-5 w-5" />
          <span>تأكيد الحذف</span>
        </div>
      </template>

      <div class="space-y-4">
        <BaseParagraph>
          هل أنت متأكد من حذف التصنيف الفرعي
          <span class="font-bold">{{ subCategoryName }}</span>؟
        </BaseParagraph>
        <BaseParagraph class="text-danger-500 text-sm">
          تحذير: سيتم حذف جميع التقارير المرتبطة بهذا التصنيف الفرعي.
        </BaseParagraph>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton @click="isOpen = false" color="default" :disabled="isLoading">
            إلغاء
          </BaseButton>
          <BaseButton @click="handleDelete" color="danger" :loading="isLoading">
            حذف
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
