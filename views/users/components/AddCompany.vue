<script setup lang="ts">
import AddCompanyModal from '~/views/archive/components/AddCompanyModal.vue';

const emit = defineEmits<{
  added: [];
}>();

const isOpen = ref(false);

const openModal = () => {
  isOpen.value = true;
};

const handleSuccess = () => {
  emit('added');
};
</script>

<template>
  <div>
    <BaseButton
      color="primary"
      @click="openModal"
    >
      <Icon name="ph:plus" class="size-4" />
      <span>إضافة شركة</span>
    </BaseButton>

    <AddCompanyModal
      :open="isOpen"
      @close="isOpen = false"
      @success="handleSuccess"
    />
  </div>
</template>
