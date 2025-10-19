<script setup lang="ts">
import { useAppCrudStore } from '../store/AppCrudStore';
const appCrudStore = useAppCrudStore()
const isFormModalOpen = computed({
  get: () => appCrudStore.isFormModalOpen,
  set: (value) => appCrudStore.isFormModalOpen = value
})
const isLoading = ref(false)
</script>
<template>
  <AppDialog size="lg" title="تأكيد الحذف" v-model="isFormModalOpen" :loading="isLoading" color="none">
    <slot/>
  </AppDialog>
</template>
