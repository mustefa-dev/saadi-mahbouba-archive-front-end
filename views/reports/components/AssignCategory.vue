<script setup lang="ts">
import type { Report } from '~/types/reports';

const props = defineProps<{
  report: Report;
}>();

const emit = defineEmits<{
  assigned: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const selectedCategoryId = ref<string | undefined>(props.report.categoryId);

const assignCategory = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.assignReportCategory(props.report.id), {
      method: 'PUT',
      body: {
        categoryId: selectedCategoryId.value || null
      }
    });

    helpers.setSuccessMessage('ar', 'Category assigned successfully', 'تم تعيين التصنيف للتقرير بنجاح');
    isOpen.value = false;
    emit('assigned');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to assign category', 'فشل تعيين التصنيف');
  } finally {
    isLoading.value = false;
  }
};

const openDialog = () => {
  selectedCategoryId.value = props.report.categoryId;
  isOpen.value = true;
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click="openDialog"
    >
      <Icon name="ph:folder-notch-open" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعيين التصنيف للتقرير
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="assignCategory" class="p-4 md:p-6 space-y-4" dir="rtl">
        <!-- Report Info -->
        <div class="p-4 rounded-lg bg-muted-50 dark:bg-muted-900/50">
          <div class="flex items-center gap-3">
            <Icon name="ph:file-text" class="h-8 w-8 text-primary-500" />
            <div>
              <h4 class="font-semibold text-muted-900 dark:text-white">{{ report.title }}</h4>
              <p class="text-sm text-muted-500 line-clamp-1">{{ report.description }}</p>
            </div>
          </div>
        </div>

        <!-- Current Assignment -->
        <div v-if="report.categoryName || report.categoryPath" class="p-3 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
          <div class="flex items-center gap-2 text-info-700 dark:text-info-400 mb-2">
            <Icon name="ph:info" class="h-4 w-4" />
            <span class="text-sm font-medium">التصنيف الحالي:</span>
          </div>
          <div class="mr-6 text-sm text-info-900 dark:text-info-200">
            <Icon name="ph:folder" class="h-4 w-4 inline ml-1" />
            {{ report.categoryPath || report.categoryName }}
          </div>
        </div>

        <!-- Category Selection -->
        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            اختر التصنيف
          </label>
          <CategorySelector
            v-model="selectedCategoryId"
            placeholder="اختر التصنيف..."
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-4">
          <BaseButton @click="isOpen = false" color="default" type="button" :disabled="isLoading">
            إلغاء
          </BaseButton>
          <BaseButton type="submit" color="primary" :loading="isLoading" :disabled="isLoading">
            <Icon name="ph:check" class="h-4 w-4" />
            <span>حفظ</span>
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
