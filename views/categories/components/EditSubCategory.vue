<script setup lang="ts">
import type { Category, CategoryUpdate } from '~/types/reports';

const props = defineProps<{
  subCategory: Category;
}>();

const emit = defineEmits(['edited']);
const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const form = ref<CategoryUpdate>({
  name: props.subCategory.name,
  description: props.subCategory.description,
  displayOrder: props.subCategory.displayOrder,
  isActive: props.subCategory.isActive
});

watch(() => props.subCategory, (newSubCategory) => {
  form.value = {
    name: newSubCategory.name,
    description: newSubCategory.description,
    displayOrder: newSubCategory.displayOrder,
    isActive: newSubCategory.isActive
  };
});

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.categoryById(props.subCategory.id), {
      method: 'PUT',
      body: form.value
    });

    helpers.setSuccessMessage('ar', 'Subcategory updated successfully', 'تم تحديث التصنيف الفرعي بنجاح');
    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to update subcategory', 'حدث خطأ أثناء تحديث التصنيف الفرعي');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButtonIcon @click="isOpen = true" size="sm" color="warning">
      <Icon name="ph:pencil-simple" class="h-4 w-4" />
    </BaseButtonIcon>

    <BaseModal :open="isOpen" @close="isOpen = false">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="ph:pencil-simple" class="h-5 w-5" />
          <span>تعديل التصنيف الفرعي</span>
        </div>
      </template>

      <div class="space-y-4">
        <BaseInput
          v-model="form.name"
          label="اسم التصنيف"
          placeholder="أدخل اسم التصنيف الفرعي"
          :required="true"
        />

        <BaseTextarea
          v-model="form.description"
          label="الوصف"
          placeholder="أدخل وصف التصنيف الفرعي (اختياري)"
          rows="3"
        />

        <BaseInput
          v-model.number="form.displayOrder"
          type="number"
          label="ترتيب العرض"
          placeholder="0"
        />

        <BaseSwitchBall
          v-model="form.isActive"
          label="نشط"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton @click="isOpen = false" color="default" :disabled="isLoading">
            إلغاء
          </BaseButton>
          <BaseButton @click="handleSubmit" color="primary" :loading="isLoading">
            حفظ التغييرات
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
