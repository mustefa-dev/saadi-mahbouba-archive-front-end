<script setup lang="ts">
import type { Report, Category, SubCategory } from '~/types/reports';

const props = defineProps<{
  report: Report;
}>();

const emit = defineEmits<{
  assigned: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);
const categories = ref<Category[]>([]);
const subCategories = ref<SubCategory[]>([]);

const selectedCategoryId = ref<string | undefined>(props.report.categoryId);
const selectedSubCategoryId = ref<string | undefined>(props.report.subCategoryId);

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await $fetch<any>(apiPaths.categories, {
      query: { pageSize: 100, isActive: true }
    });
    categories.value = response.data || [];

    // Load subcategories if category is already selected
    if (selectedCategoryId.value) {
      loadSubCategories(selectedCategoryId.value);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const loadSubCategories = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId);
  if (category && category.subCategories) {
    subCategories.value = category.subCategories.filter(sc => sc.isActive);
  } else {
    subCategories.value = [];
  }
};

// Watch category selection to load subcategories
watch(selectedCategoryId, (categoryId) => {
  selectedSubCategoryId.value = undefined;
  subCategories.value = [];

  if (categoryId) {
    loadSubCategories(categoryId);
  }
});

const assignCategory = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.assignReportCategory(props.report.id), {
      method: 'PUT',
      body: {
        categoryId: selectedCategoryId.value || null,
        subCategoryId: selectedSubCategoryId.value || null
      }
    });

    helpers.setSuccessMessage('ar', 'Category assigned successfully', 'تم تعيين التصنيف للتقرير بنجاح');
    isOpen.value = false;
    emit('assigned');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to assign category', 'فشل تعيين التصنيف');
  } finally {
    isLoading.value = false;
  }
};

const openDialog = async () => {
  selectedCategoryId.value = props.report.categoryId;
  selectedSubCategoryId.value = props.report.subCategoryId;
  await fetchCategories();
  isOpen.value = true;
};

const clearSelection = () => {
  selectedCategoryId.value = undefined;
  selectedSubCategoryId.value = undefined;
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click="openDialog"
    >
      <Icon name="ph:folder-notch-open" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعيين التصنيف للتقرير
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="assignCategory" class="p-4 md:p-6 space-y-4">
        <!-- Report Info -->
        <div class="p-4 rounded-lg bg-muted-50 dark:bg-muted-900/50">
          <div class="flex items-center gap-3">
            <Icon name="ph:file-text" class="h-8 w-8 text-primary-500" />
            <div>
              <h4 class="font-semibold text-muted-900 dark:text-white">{{ report.title }}</h4>
              <p class="text-sm text-muted-500 line-clamp-1">{{ report.description }}</p>
            </div>
          </div>
        </div>

        <!-- Current Assignment -->
        <div v-if="report.categoryName || report.subCategoryName" class="p-3 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
          <div class="flex items-center gap-2 text-info-700 dark:text-info-400 mb-2">
            <Icon name="ph:info" class="h-4 w-4" />
            <span class="text-sm font-medium">التصنيف الحالي:</span>
          </div>
          <div class="mr-6 text-sm">
            <div v-if="report.categoryName" class="text-info-900 dark:text-info-200">
              <Icon name="ph:folder" class="h-4 w-4 inline ml-1" />
              {{ report.categoryName }}
            </div>
            <div v-if="report.subCategoryName" class="text-info-800 dark:text-info-300 mr-4 mt-1">
              <Icon name="ph:folder-simple" class="h-4 w-4 inline ml-1" />
              {{ report.subCategoryName }}
            </div>
          </div>
        </div>

        <!-- Category Selection -->
        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            اختر التصنيف
          </label>
          <BaseSelect v-model="selectedCategoryId" placeholder="اختر التصنيف" :disabled="isLoading">
            <option :value="undefined">-- بدون تصنيف --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.nameAr }}
            </option>
          </BaseSelect>
        </div>

        <!-- SubCategory Selection -->
        <div v-if="selectedCategoryId && subCategories.length > 0">
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            اختر التصنيف الفرعي (اختياري)
          </label>
          <BaseSelect v-model="selectedSubCategoryId" placeholder="اختر التصنيف الفرعي" :disabled="isLoading">
            <option :value="undefined">-- بدون تصنيف فرعي --</option>
            <option v-for="subCategory in subCategories" :key="subCategory.id" :value="subCategory.id">
              {{ subCategory.nameAr }}
            </option>
          </BaseSelect>
        </div>

        <!-- Preview of Selection -->
        <div v-if="selectedCategoryId" class="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
          <div class="flex items-center gap-2 text-success-700 dark:text-success-400 mb-2">
            <Icon name="ph:check-circle" class="h-4 w-4" />
            <span class="text-sm font-medium">التصنيف الجديد:</span>
          </div>
          <div class="mr-6 text-sm">
            <div class="text-success-900 dark:text-success-200">
              <Icon name="ph:folder" class="h-4 w-4 inline ml-1" />
              {{ categories.find(c => c.id === selectedCategoryId)?.nameAr }}
            </div>
            <div v-if="selectedSubCategoryId" class="text-success-800 dark:text-success-300 mr-4 mt-1">
              <Icon name="ph:folder-simple" class="h-4 w-4 inline ml-1" />
              {{ subCategories.find(sc => sc.id === selectedSubCategoryId)?.nameAr }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4">
          <BaseButton @click="clearSelection" color="default" variant="outline" size="sm" type="button" :disabled="isLoading">
            <Icon name="ph:x" class="h-4 w-4" />
            <span>مسح الاختيار</span>
          </BaseButton>
          <div class="flex items-center gap-2">
            <BaseButton @click="isOpen = false" color="default" type="button" :disabled="isLoading">
              إلغاء
            </BaseButton>
            <BaseButton type="submit" color="primary" :loading="isLoading" :disabled="isLoading">
              <Icon name="ph:check" class="h-4 w-4" />
              <span>حفظ</span>
            </BaseButton>
          </div>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
