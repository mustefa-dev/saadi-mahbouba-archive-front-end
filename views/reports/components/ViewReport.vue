<script setup lang="ts">
import type { Report } from '~/types/reports';
import { getReportStatusColor, getReportStatusLabel } from '~/types/reports';
import { formatDate } from '~/utils/helpers';

const props = defineProps<{
  reportId: string;
}>();

const emit = defineEmits(['close']);
const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);
const report = ref<Report | null>(null);

const fetchReport = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch<any>(apiPaths.reportById(props.reportId));
    report.value = response.data;
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to fetch report details', 'فشل جلب بيانات التقرير');
  } finally {
    isLoading.value = false;
  }
};

const openDialog = async () => {
  isOpen.value = true;
  await fetchReport();
};

const downloadFile = () => {
  if (report.value?.fileUrl) {
    window.open(apiPaths.getAsset(report.value.fileUrl), '_blank');
  }
};

defineExpose({ open: openDialog });
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="info"
      variant="pastel"
      @click="openDialog"
    >
      <Icon name="ph:eye" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تفاصيل التقرير
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 md:p-6" dir="rtl">
        <div v-if="isLoading" class="space-y-4">
          <BasePlaceload class="h-8 w-full rounded" />
          <BasePlaceload class="h-24 w-full rounded" />
          <BasePlaceload class="h-8 w-full rounded" />
        </div>

        <div v-else-if="report" class="space-y-6">
          <div>
            <h3 class="text-lg font-bold text-muted-900 dark:text-white mb-2">{{ report.title }}</h3>
            <BaseTag :color="getReportStatusColor(report.status)" flavor="pastel">
              {{ getReportStatusLabel(report.status) }}
            </BaseTag>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-muted-500">الوصف</label>
              <p class="text-muted-900 dark:text-white mt-1">{{ report.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="report.categoryName">
                <label class="text-sm font-medium text-muted-500">التصنيف</label>
                <p class="text-muted-900 dark:text-white mt-1">{{ report.categoryName }}</p>
              </div>

              <div v-if="report.subCategoryName">
                <label class="text-sm font-medium text-muted-500">التصنيف الفرعي</label>
                <p class="text-muted-900 dark:text-white mt-1">{{ report.subCategoryName }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-muted-500">تاريخ الإنشاء</label>
                <p class="text-muted-900 dark:text-white mt-1">{{ formatDate(report.createdAt) }}</p>
              </div>

              <div v-if="report.updatedAt">
                <label class="text-sm font-medium text-muted-500">تاريخ التحديث</label>
                <p class="text-muted-900 dark:text-white mt-1">{{ formatDate(report.updatedAt) }}</p>
              </div>
            </div>

            <div v-if="report.fileName" class="p-4 rounded-lg bg-muted-50 dark:bg-muted-900/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Icon name="ph:file" class="h-8 w-8 text-primary-500" />
                  <div>
                    <p class="font-medium text-muted-900 dark:text-white">{{ report.fileName }}</p>
                    <p v-if="report.fileSize" class="text-sm text-muted-500">{{ report.fileSize }}</p>
                  </div>
                </div>
                <BaseButton @click="downloadFile" color="primary" size="sm">
                  <Icon name="ph:download" class="h-4 w-4" />
                  <span>تحميل</span>
                </BaseButton>
              </div>
            </div>

            <div v-if="report.reviewerNote" class="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <label class="text-sm font-medium text-warning-700 dark:text-warning-400">ملاحظة المراجع</label>
              <p class="text-warning-900 dark:text-warning-200 mt-1">{{ report.reviewerNote }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-4">
            <BaseButton @click="isOpen = false" color="default">
              إغلاق
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
