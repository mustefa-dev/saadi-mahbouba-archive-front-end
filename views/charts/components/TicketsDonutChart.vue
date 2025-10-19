<script setup lang="ts">
import axios from "~/services/app-client/axios.js"
import AddonApexcharts from "vue3-apexcharts";
interface DailyTicketStatistics{
  date: Date,
  open: number,
  inProgress: number,
  doneCount: number,
  canceledCount: number,
  totalCount:number,
}
const chartData = ref<DailyTicketStatistics>(
  {
    date:new Date(),
    open:0,
    inProgress:0,
    doneCount:0,
    canceledCount:0,
    totalCount:0
  }
);
const chart = computed<any>(()=>{
  const type = 'donut'
  const height = 250
  const series = chartData.value.totalCount > 0?
    [chartData.value.open,chartData.value.inProgress,chartData.value.doneCount,chartData.value.canceledCount]:
    [10,20,30,10];
  const labels = ['المفتوحة','قيد العمل','التامة','الملغية']


  const options = {
    chart: {
      type: 'donut',
    },
    stroke:{
      show:false
    },
    dataLabels:{
      enabled:false
    },
    legend:{
      show:false
    },
    labels : ['المفتوحة','قيد العمل','المحلولة','الملغية'],
    colors : ['rgb(201, 205, 209)','rgb(240,140,26)', 'rgb(39, 167, 113)','rgb(167,39,39)']
  };

  return {
    type,
    height,
    options,
    series,
    labels,
  }
})
onMounted(async ()=>{
  const data = (await axios.get<DailyTicketStatistics[]>("dashboard/daily-statistics")).data;
  chartData.value = data[data.length-1];
  chartData.value.totalCount = chartData.value.open 
    + chartData.value.doneCount 
    + chartData.value.canceledCount 
    + chartData.value.inProgress;
})
</script>

<template>
  <div class="h-full">
    <span class="font-bold">احصائيات الشكاوي الكلية ليوم {{new Date(chartData.date).toLocaleDateString('ar')}}</span>
    <br/>
    <div class="grid grid-cols-2 justify-center items-center h-full">
      <AddonApexcharts v-bind="chart"/>
      <div>
        <div class="flex flex-col px-4 gap-2" style="max-width: 300px;">
          <BaseTag color="primary" variant="pastel" class="flex justify-between" style="font-size: 15px">
            <span>الشكاوي الكلية</span> 
            <span> {{chartData.totalCount}} </span>
          </BaseTag>
          <BaseTag color="muted" variant="outline" class="flex justify-between" style="font-size: 15px">
            <span>الشكاوي المفتوحة</span> 
            <span> {{chartData.open}} </span>
          </BaseTag>
          <BaseTag color="warning" variant="pastel" class="flex justify-between" style="font-size: 15px">
            <span>الشكاوي قيد العمل</span> 
            <span> {{chartData.inProgress}} </span>
          </BaseTag>
          <BaseTag color="success" variant="pastel" class="flex justify-between" style="font-size: 15px">
            <span>الشكاوي المحلولة</span> 
            <span> {{chartData.doneCount}} </span>
          </BaseTag>
          <BaseTag color="danger" variant="pastel" class="flex justify-between" style="font-size: 15px">
            <span>الشكاوي الملغية</span> 
            <span> {{chartData.canceledCount}} </span>
          </BaseTag>
        </div>
      </div>
    </div>
  </div>
</template>
