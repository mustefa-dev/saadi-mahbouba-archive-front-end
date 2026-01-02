<script setup lang="ts">
import type { Category, CategoryUpdate } from '~/types/reports';

const props = defineProps<{
  category: Category;
}>();

const emit = defineEmits<{
  edited: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive<CategoryUpdate>({
  name: '',
  description: '',
  icon: '',
  displayOrder: 0,
  isActive: true
});

// Load category data when modal opens
watch(isOpen, (newVal) => {
  if (newVal && props.category) {
    formData.name = props.category.name;
    formData.description = props.category.description;
    formData.icon = props.category.icon;
    formData.displayOrder = props.category.displayOrder;
    formData.isActive = props.category.isActive;
  }
});

const editCategory = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.categoryById(props.category.id), {
      method: 'PUT',
      body: formData
    });

    helpers.setSuccessMessage('ar', 'Category updated successfully', 'تم تحديث التصنيف بنجاح');
    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to update category', 'فشل تحديث التصنيف');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click="isOpen = true"
    >
      <Icon name="ph:pencil" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعديل التصنيف
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="editCategory" class="p-4 md:p-6 space-y-4" dir="rtl">
        <BaseInput
          v-model="formData.name"
          label="اسم التصنيف"
          placeholder="أدخل اسم التصنيف"
          :disabled="isLoading"
          required
        />

        <BaseTextarea
          v-model="formData.description"
          label="الوصف"
          placeholder="أدخل وصف التصنيف (اختياري)"
          rows="3"
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.icon"
          label="الأيقونة"
          placeholder="ph:folder (اختياري)"
          :disabled="isLoading"
        />

        <BaseInput
          v-model.number="formData.displayOrder"
          type="number"
          label="ترتيب العرض"
          placeholder="0"
          :disabled="isLoading"
        />

        <div class="flex gap-x-2 justify-end pt-4">
          <BaseButton
            type="button"
            color="default"
            @click="isOpen = false"
            :disabled="isLoading"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            حفظ التغييرات
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
