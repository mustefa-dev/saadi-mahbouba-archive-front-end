<script setup lang="ts">
const { isOpen } = useCollapse()
</script>

<template>
  <div 
    class="h-24 w-full items-center gap-4 transition-all duration-150 flex"
    v-if="isOpen"
    >
    <DemoAccountMenu />
  </div>
</template>
