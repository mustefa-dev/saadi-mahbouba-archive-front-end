<script setup lang="ts">
// Placeholder component for Reports Donut Chart
// TODO: Implement actual chart based on report statistics
const apiPaths = useApiPaths();

const chartData = ref({
  pending: 0,
  underReview: 0,
  approved: 0,
  rejected: 0
});

onMounted(async () => {
  try {
    const response = await $fetch<any>(apiPaths.reportStatistics);
    const data = response.data;
    chartData.value = {
      pending: data.pendingReports,
      underReview: data.underReviewReports,
      approved: data.approvedReports,
      rejected: data.rejectedReports
    };
  } catch (error) {
    console.error('Error fetching report statistics:', error);
  }
});
</script>

<template>
  <div class="p-6">
    <BaseHeading size="lg" weight="semibold" class="mb-4">توزيع التقارير حسب الحالة</BaseHeading>
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20">
        <div class="text-3xl font-bold text-warning-500">{{ chartData.pending }}</div>
        <div class="text-sm text-muted-600">قيد الانتظار</div>
      </div>
      <div class="text-center p-4 rounded-lg bg-info-50 dark:bg-info-900/20">
        <div class="text-3xl font-bold text-info-500">{{ chartData.underReview }}</div>
        <div class="text-sm text-muted-600">قيد المراجعة</div>
      </div>
      <div class="text-center p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
        <div class="text-3xl font-bold text-success-500">{{ chartData.approved }}</div>
        <div class="text-sm text-muted-600">مقبول</div>
      </div>
      <div class="text-center p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20">
        <div class="text-3xl font-bold text-danger-500">{{ chartData.rejected }}</div>
        <div class="text-sm text-muted-600">مرفوض</div>
      </div>
    </div>
  </div>
</template>
