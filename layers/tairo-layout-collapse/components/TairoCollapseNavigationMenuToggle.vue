<script setup lang="ts">
  const {isMobileOpen,isOpen} = useCollapse();
  const click = ()=>{
    isOpen.value = !isOpen.value;
  }
</script>
<template>
  <template v-if="isMobileOpen">
    <div class="w-full flex justify-end" >
    <div @click="click" class="text-white bg-primary-500 rounded-lg" style="z-index: 100;translate: left 1s ease;" >
      <Icon :name="isOpen?'ph:caret-circle-left-thin':'ph:caret-circle-right-thin'"
          class="size-6"
        />
    </div>
    </div>
  </template>
</template>
