<script setup lang="ts">
// Placeholder component for Reports Daily Chart
// TODO: Implement actual chart based on daily report statistics
const apiPaths = useApiPaths();

const todayReports = ref(0);

onMounted(async () => {
  try {
    const response = await $fetch<any>(apiPaths.reportStatistics);
    todayReports.value = response.data.reportsToday;
  } catch (error) {
    console.error('Error fetching report statistics:', error);
  }
});
</script>

<template>
  <div class="p-6">
    <BaseHeading size="lg" weight="semibold" class="mb-4">التقارير اليوم</BaseHeading>
    <div class="text-center p-8 rounded-lg bg-primary-50 dark:bg-primary-900/20">
      <div class="text-6xl font-bold text-primary-500 mb-2">{{ todayReports }}</div>
      <div class="text-lg text-muted-600">تقرير جديد اليوم</div>
    </div>
    <BaseParagraph class="text-muted-400 text-sm mt-4 text-center">
      إجمالي التقارير المقدمة خلال اليوم الحالي
    </BaseParagraph>
  </div>
</template>
