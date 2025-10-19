<script setup lang="ts">
import axiosIns from '~/services/app-client/axios';
import HomePageCard from './HomePageCard.vue';
import TicketsDonutChart from './TicketsDonutChart.vue';
import TicketsDailyChart from './TicketsDailyChart.vue';
import UsersTable from './UsersTable.vue';
import ManagersTable from './ManagersTable.vue';
interface Statistics {
  totalProjects:number;
  totalUsers:number;
  totalTickets:number;
  totalSolvedTickets:number;
  totalTicketsToday:number;
}
const statistics = ref<Statistics>({
  totalProjects:0,
  totalUsers:0,
  totalTickets:0,
  totalTicketsToday:0,
  totalSolvedTickets:0
});

onMounted(async ()=>{
  const res = await axiosIns.get("/dashboard/statistics");
  statistics.value = res.data;
})
</script>
<template>
  <div>
    <div class="grid gap-2 grid-flow-col">
      <HomePageCard :data="statistics.totalUsers" color="info" icon="ph:users" title="مجموع المستخدمين"/>
      <HomePageCard v-if="useAppUserStore().isInRole('SuperAdmin')" :data="statistics.totalProjects" color="success" icon="ph:grid-four-bold" title="مجموع المشاريع"/>
      <HomePageCard :data="statistics.totalTickets" color="danger" icon="ph:ticket-duotone" title="مجموع الشكاوي"/>
      <HomePageCard :data="statistics.totalSolvedTickets" color="success" icon="ph:ticket-duotone" title="مجموع الشكاوي المحلولة"/>
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
        <TicketsDailyChart/>
        <TicketsDonutChart/>
    </div>
  </BaseCard>
  </div>
</template>
