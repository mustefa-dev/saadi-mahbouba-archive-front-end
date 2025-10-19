<template>
  <span :class="statusClass">{{ statusText }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: number }>();

const statusText = computed(() => {
  switch (props.status) {
    case 0:
      return 'جديد';
    case 1:
      return 'قيد المعالجة';
    case 2:
      return 'مغلق';
    default:
      return 'غير معروف';
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case 0:
      return 'text-blue-500';
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
});
</script>
