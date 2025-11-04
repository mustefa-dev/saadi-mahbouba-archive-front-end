<script setup lang="ts">
const props = defineProps<{
  categoryId: string;
  categoryName: string;
  isActive: boolean;
}>();

const emit = defineEmits<{
  toggled: [];
}>();

const apiPaths = useApiPaths();
const helpers = useHelpers();
const isLoading = ref(false);

const toggleStatus = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.categoryById(props.categoryId), {
      method: 'PUT',
      body: {
        isActive: !props.isActive
      }
    });

    helpers.setSuccessMessage(
      'ar',
      props.isActive ? 'Category deactivated successfully' : 'Category activated successfully',
      props.isActive ? 'تم تعطيل التصنيف بنجاح' : 'تم تفعيل التصنيف بنجاح'
    );

    emit('toggled');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to change category status', 'فشل تغيير حالة التصنيف');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="success"
      variant="pastel"
      :loading="isLoading"
      :disabled="isLoading"
      @click="toggleStatus"
    >
      تفعيل
    </BaseButton>
  </div>
</template>

