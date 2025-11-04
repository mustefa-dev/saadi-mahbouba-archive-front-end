<script setup lang="ts">
import TairoCollapseLayout from '~/layers/tairo-layout-collapse/components/TairoCollapseLayout.vue';

// Initialize SignalR on mount if user is logged in
const userStore = useAppUserStore();

onMounted(async () => {
  console.log('📱 Layout mounted, user:', userStore.user?.fullName || 'Not logged in');

  // Initialize SignalR for real-time messaging if user is logged in
  const token = userStore.getToken();
  if (token) {
    console.log('🔌 Attempting to connect SignalR...');
    const signalR = useSignalR();
    try {
      await signalR.initializeConnection(token);
      console.log('✅ SignalR connected for real-time updates');
    } catch (error) {
      // Just log the error, don't fail the page load
      console.warn('⚠️ SignalR connection failed (non-critical):', error);
      console.log('📄 Page will continue to work, but real-time updates will be disabled');
    }
  }
});
</script>

<template>
  <div style="zoom: 90%;">
    <TairoCollapseLayout>
      <slot />
    </TairoCollapseLayout>
  </div>
</template>
