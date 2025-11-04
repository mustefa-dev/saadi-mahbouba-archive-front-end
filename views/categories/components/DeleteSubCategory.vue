<script setup lang="ts">
const props = defineProps<{
  subCategoryId: string;
  subCategoryName: string;
}>();

const emit = defineEmits(['deleted']);
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const handleDelete = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.subCategoryById(props.subCategoryId), {
      method: 'DELETE'
    });

    useToast().add({
      title: 'تم بنجاح',
      description: 'تم حذف التصنيف الفرعي بنجاح',
      color: 'success'
    });

    isOpen.value = false;
    emit('deleted');
  } catch (error: any) {
    useToast().add({
      title: 'خطأ',
      description: error.data?.message || 'حدث خطأ أثناء حذف التصنيف الفرعي',
      color: 'danger'
    });
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
