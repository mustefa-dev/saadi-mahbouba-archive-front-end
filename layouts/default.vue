<script setup lang="ts">
import TairoCollapseLayout from '~/layers/tairo-layout-collapse/components/TairoCollapseLayout.vue';

// Initialize SignalR on mount if user is logged in
const userStore = useAppUserStore();

onMounted(async () => {
  console.log('📱 Layout mounted, user:', userStore.user?.fullName || 'Not logged in');
});
</script>

<template>
  <div style="zoom: 90%;">
    <TairoCollapseLayout>
      <slot />
    </TairoCollapseLayout>
  </div>
</template>
