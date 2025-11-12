<script setup lang="ts">
import type { ReportStatistics } from '~/types/reports';
import HomePageCard from './HomePageCard.vue';
import ReportsDonutChart from './ReportsDonutChart.vue';
import ReportsDailyChart from './ReportsDailyChart.vue';
import UsersTable from './UsersTable.vue';
import ManagersTable from './ManagersTable.vue';

const apiPaths = useApiPaths();

const statistics = ref<ReportStatistics>({
  totalReports: 0,
  pendingReports: 0,
  underReviewReports: 0,
  approvedReports: 0,
  rejectedReports: 0,
  reportsToday: 0
});

onMounted(async () => {
  try {
    const response = await $fetch<any>(apiPaths.reportStatistics);
    if (response && response.data) {
      statistics.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching report statistics:', error);
  }
})
</script>
<template>
  <div>
    <div class="grid gap-2 grid-flow-col auto-cols-fr">
      <HomePageCard :data="statistics.totalReports" color="primary" icon="ph:file-text" title="مجموع التقارير"/>
      <HomePageCard :data="statistics.pendingReports" color="warning" icon="ph:clock" title="قيد الانتظار"/>
      <HomePageCard :data="statistics.underReviewReports" color="info" icon="ph:eye" title="قيد المراجعة"/>
      <HomePageCard :data="statistics.approvedReports" color="success" icon="ph:check-circle" title="التقارير المقبولة"/>
      <HomePageCard :data="statistics.rejectedReports" color="danger" icon="ph:x-circle" title="التقارير المرفوضة"/>
    </div>
    <br/>
  <BaseCard color="muted" class="p-6 mb-3">
    <div class="grid bg-accent p-2" style="gap: 1rem;grid-template-columns: 1fr 2fr;">
        <UsersTable/>
        <ManagersTable/>
    </div>
  </BaseCard>
  <BaseCard color="muted" class="p-6">
    <div class="grid bg-accent p-2" style="gap: 1rem;">
        <ReportsDailyChart/>
        <ReportsDonutChart/>
    </div>
  </BaseCard>
  </div>
</template>
