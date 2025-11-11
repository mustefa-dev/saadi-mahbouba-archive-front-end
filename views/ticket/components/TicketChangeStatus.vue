<template>
  <div class="flex items-center gap-2">
    <span>Status: </span>
    <TicketStatusTag :status="item.status" />
    <select v-model="selectedStatus" @change="changeStatus" class="border rounded px-2 py-1">
      <option value="0">جديد</option>
      <option value="1">قيد المعالجة</option>
      <option value="2">مغلق</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import TicketStatusTag from './TicketStatusTag.vue';

const props = defineProps<{ item: { id: string; status: number } }>();

const selectedStatus = ref(props.item.status);

const changeStatus = () => {
  // Here you would typically emit an event or call an API to update the status
  console.log(`Changing status of ticket ${props.item.id} to ${selectedStatus.value}`);
  // For demo purposes, just log
};
</script>
