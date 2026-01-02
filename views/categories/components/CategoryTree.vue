<script setup lang="ts">
import type { Category, CategoryForm, CategoryUpdate } from '~/types/reports';
import type { CategoryBreadcrumb } from '~/types/archive';

const helpers = useHelpers();
const apiPaths = useApiPaths();

// State
const categories = ref<Category[]>([]);
const currentCategory = ref<Category | null>(null);
const breadcrumbs = ref<CategoryBreadcrumb[]>([]);
const loading = ref(false);

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const modalLoading = ref(false);

// Selected category for actions
const selectedParent = ref<Category | null>(null);
const selectedCategory = ref<Category | null>(null);
const deleteError = ref<string | null>(null);

// Forms
const addForm = ref<CategoryForm>({
  name: '',
  description: '',
  parentId: undefined
});

const editForm = ref<CategoryUpdate>({
  name: '',
  description: '',
  displayOrder: 0,
  isActive: true
});

// Fetch categories for current level
const fetchCategories = async (parentId?: string) => {
  loading.value = true;
  try {
    if (parentId) {
      // Fetch children of specific category
      const response = await $fetch<any>(apiPaths.categoryChildren(parentId));
      categories.value = response?.children || response || [];
    } else {
      // Fetch root categories
      const response = await $fetch<any>(apiPaths.categoryTree);
      const allCategories = Array.isArray(response) ? response : (response?.data || []);
      // Filter only root level (parentId === null)
      categories.value = allCategories.filter((c: Category) => !c.parentId);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch breadcrumbs for a category
const fetchBreadcrumbs = async (categoryId: string) => {
  try {
    const response = await $fetch<any>(apiPaths.categoryBreadcrumbs(categoryId));
    breadcrumbs.value = response || [];
  } catch (error) {
    console.error('Error fetching breadcrumbs:', error);
    breadcrumbs.value = [];
  }
};

// Navigate to a category (show its children)
const navigateTo = async (category: Category | null) => {
  currentCategory.value = category;

  if (category) {
    await fetchBreadcrumbs(category.id);
    await fetchCategories(category.id);
  } else {
    breadcrumbs.value = [];
    await fetchCategories();
  }
};

// Navigate using breadcrumb
const navigateToBreadcrumb = async (crumb: CategoryBreadcrumb | null) => {
  if (!crumb) {
    await navigateTo(null);
    return;
  }

  // Fetch the category and navigate
  try {
    const response = await $fetch<any>(apiPaths.categoryById(crumb.id));
    const category = response?.data || response;
    await navigateTo(category);
  } catch (error) {
    console.error('Error navigating to breadcrumb:', error);
  }
};

// Open add modal
const openAddModal = (parent: Category | null = null) => {
  selectedParent.value = parent || currentCategory.value;
  addForm.value = {
    name: '',
    description: '',
    parentId: selectedParent.value?.id
  };
  showAddModal.value = true;
};

// Save new category
const saveCategory = async () => {
  if (!addForm.value.name) return;

  modalLoading.value = true;
  try {
    await $fetch(apiPaths.categories, {
      method: 'POST',
      body: addForm.value
    });
    helpers.setSuccessMessage('ar', 'Category added', 'تم إضافة التصنيف بنجاح');
    showAddModal.value = false;

    // Refresh current view
    await fetchCategories(currentCategory.value?.id);
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to add category', 'فشل إضافة التصنيف');
  } finally {
    modalLoading.value = false;
  }
};

// Open edit modal
const openEditModal = (category: Category) => {
  selectedCategory.value = category;
  editForm.value = {
    name: category.name,
    description: category.description,
    displayOrder: category.displayOrder,
    isActive: category.isActive
  };
  showEditModal.value = true;
};

// Update category
const updateCategory = async () => {
  if (!selectedCategory.value || !editForm.value.name) return;

  modalLoading.value = true;
  try {
    await $fetch(apiPaths.categoryById(selectedCategory.value.id), {
      method: 'PUT',
      body: editForm.value
    });
    helpers.setSuccessMessage('ar', 'Category updated', 'تم تحديث التصنيف بنجاح');
    showEditModal.value = false;
    await fetchCategories(currentCategory.value?.id);
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to update category', 'فشل تحديث التصنيف');
  } finally {
    modalLoading.value = false;
  }
};

// Open delete modal
const openDeleteModal = (category: Category) => {
  selectedCategory.value = category;
  deleteError.value = null;
  showDeleteModal.value = true;
};

// Delete category
const deleteCategory = async () => {
  if (!selectedCategory.value) return;

  modalLoading.value = true;
  deleteError.value = null;

  try {
    await $fetch(apiPaths.categoryById(selectedCategory.value.id), {
      method: 'DELETE'
    });
    helpers.setSuccessMessage('ar', 'Category deleted', 'تم حذف التصنيف بنجاح');
    showDeleteModal.value = false;
    await fetchCategories(currentCategory.value?.id);
  } catch (error: any) {
    // Extract error message from API response
    const errorMessage = error?.data?.message || error?.data?.Message || error?.message || 'فشل حذف التصنيف';
    deleteError.value = errorMessage;
    helpers.setErrorMessage(error, 'ar', 'Failed to delete category', errorMessage);
  } finally {
    modalLoading.value = false;
  }
};

// Initial load
onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 p-3 bg-muted-50 dark:bg-muted-900/50 rounded-lg" dir="rtl">
      <button
        class="flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors"
        :class="!currentCategory ? 'bg-primary-500 text-white' : 'hover:bg-muted-200 dark:hover:bg-muted-800 text-muted-600 dark:text-muted-300'"
        @click="navigateToBreadcrumb(null)"
      >
        <Icon name="ph:house" class="w-4 h-4" />
        <span>الرئيسية</span>
      </button>

      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
        <Icon name="ph:caret-left" class="w-4 h-4 text-muted-400" />
        <button
          class="px-2 py-1 rounded text-sm transition-colors"
          :class="index === breadcrumbs.length - 1 ? 'bg-primary-500 text-white' : 'hover:bg-muted-200 dark:hover:bg-muted-800 text-muted-600 dark:text-muted-300'"
          @click="navigateToBreadcrumb(crumb)"
        >
          {{ crumb.name }}
        </button>
      </template>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <BaseButton color="primary" @click="openAddModal()">
        <Icon name="ph:plus" class="h-4 w-4" />
        <span>{{ currentCategory ? 'إضافة تصنيف فرعي' : 'إضافة تصنيف رئيسي' }}</span>
      </BaseButton>

      <BaseButton size="sm" color="default" @click="fetchCategories(currentCategory?.id)">
        <Icon name="ph:arrow-clockwise" class="h-4 w-4" />
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <BasePlaceload class="h-16 w-full rounded-lg" />
      <BasePlaceload class="h-16 w-full rounded-lg" />
      <BasePlaceload class="h-16 w-full rounded-lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="categories.length === 0" class="p-12 text-center border-2 border-dashed border-muted-200 dark:border-muted-700 rounded-lg">
      <Icon name="ph:folder-dashed" class="h-16 w-16 mx-auto text-muted-300 mb-4" />
      <BaseParagraph class="text-muted-400 mb-4">
        {{ currentCategory ? 'لا توجد تصنيفات فرعية' : 'لا توجد تصنيفات' }}
      </BaseParagraph>
      <BaseButton color="primary" @click="openAddModal()">
        <Icon name="ph:plus" class="h-4 w-4" />
        <span>إضافة تصنيف</span>
      </BaseButton>
    </div>

    <!-- Categories Table -->
    <BaseCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
        <thead class="bg-muted-50 dark:bg-muted-900/50">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الوصف</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الفرعية</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الملفات</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
          <tr
            v-for="category in categories"
            :key="category.id"
            class="hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
          >
            <!-- Name - Clickable to navigate -->
            <td class="px-6 py-4">
              <button
                class="flex items-center gap-3 hover:text-primary-500 transition-colors"
                @click="navigateTo(category)"
              >
                <Icon
                  :name="category.childrenCount > 0 ? 'ph:folder-notch-duotone' : 'ph:folder-duotone'"
                  class="w-5 h-5 text-amber-500"
                />
                <span class="font-medium text-muted-900 dark:text-white">{{ category.name }}</span>
                <Icon
                  v-if="category.childrenCount > 0"
                  name="ph:caret-left"
                  class="w-4 h-4 text-muted-400"
                />
              </button>
            </td>

            <!-- Description -->
            <td class="px-6 py-4">
              <span class="text-sm text-muted-600 dark:text-muted-300 max-w-xs truncate block">
                {{ category.description || '-' }}
              </span>
            </td>

            <!-- Children Count -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-primary-500">{{ category.childrenCount || 0 }}</span>
            </td>

            <!-- Reports Count -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-success-500">{{ category.reportsCount || 0 }}</span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <BaseTag
                :color="category.isActive ? 'success' : 'danger'"
                size="sm"
                flavor="pastel"
              >
                {{ category.isActive ? 'نشط' : 'غير نشط' }}
              </BaseTag>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <BaseButton
                  size="sm"
                  color="primary"
                  variant="pastel"
                  @click="navigateTo(category)"
                >
                  <Icon name="ph:eye" class="h-4 w-4" />
                </BaseButton>
                <BaseButton
                  size="sm"
                  color="success"
                  variant="pastel"
                  @click="openAddModal(category)"
                >
                  <Icon name="ph:plus" class="h-4 w-4" />
                </BaseButton>
                <BaseButton
                  size="sm"
                  color="warning"
                  variant="pastel"
                  @click="openEditModal(category)"
                >
                  <Icon name="ph:pencil-simple" class="h-4 w-4" />
                </BaseButton>
                <BaseButton
                  size="sm"
                  color="danger"
                  variant="pastel"
                  @click="openDeleteModal(category)"
                >
                  <Icon name="ph:trash" class="h-4 w-4" />
                </BaseButton>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Add Modal -->
    <TairoModal :open="showAddModal" size="md" @close="showAddModal = false">
      <template #header>
        <div class="flex items-center gap-2 p-4" dir="rtl">
          <Icon name="ph:folder-plus" class="h-5 w-5 text-primary-500" />
          <span class="font-medium">إضافة تصنيف جديد</span>
        </div>
      </template>

      <div class="p-4 space-y-4" dir="rtl">
        <div v-if="selectedParent" class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <p class="text-sm text-primary-700 dark:text-primary-300">
            <Icon name="ph:folder" class="h-4 w-4 inline ml-1" />
            سيتم إضافة التصنيف داخل: <strong>{{ selectedParent.name }}</strong>
          </p>
        </div>
        <div v-else class="p-3 rounded-lg bg-muted-50 dark:bg-muted-900/50">
          <p class="text-sm text-muted-600 dark:text-muted-400">
            سيتم إضافة التصنيف في المستوى الرئيسي
          </p>
        </div>

        <BaseInput
          v-model="addForm.name"
          label="اسم التصنيف"
          placeholder="مثال: إلكترونيات"
          :disabled="modalLoading"
        />

        <BaseTextarea
          v-model="addForm.description"
          label="الوصف (اختياري)"
          placeholder="وصف التصنيف"
          rows="2"
          :disabled="modalLoading"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2 p-4" dir="rtl">
          <BaseButton color="muted" @click="showAddModal = false" :disabled="modalLoading">
            إلغاء
          </BaseButton>
          <BaseButton
            color="primary"
            :loading="modalLoading"
            :disabled="!addForm.name || modalLoading"
            @click="saveCategory"
          >
            <Icon name="ph:check" class="h-4 w-4" />
            <span>إضافة</span>
          </BaseButton>
        </div>
      </template>
    </TairoModal>

    <!-- Edit Modal -->
    <TairoModal :open="showEditModal" size="md" @close="showEditModal = false">
      <template #header>
        <div class="flex items-center gap-2 p-4" dir="rtl">
          <Icon name="ph:pencil-simple" class="h-5 w-5 text-warning-500" />
          <span class="font-medium">تعديل التصنيف</span>
        </div>
      </template>

      <div class="p-4 space-y-4" dir="rtl">
        <BaseInput
          v-model="editForm.name"
          label="اسم التصنيف"
          placeholder="اسم التصنيف"
          :disabled="modalLoading"
        />

        <BaseTextarea
          v-model="editForm.description"
          label="الوصف (اختياري)"
          placeholder="وصف التصنيف"
          rows="2"
          :disabled="modalLoading"
        />

        <BaseInput
          v-model.number="editForm.displayOrder"
          type="number"
          label="ترتيب العرض"
          :disabled="modalLoading"
        />

        <div class="flex items-center gap-2">
          <BaseSwitchBall v-model="editForm.isActive" :disabled="modalLoading" />
          <span class="text-sm text-muted-600 dark:text-muted-300">نشط</span>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2 p-4" dir="rtl">
          <BaseButton color="muted" @click="showEditModal = false" :disabled="modalLoading">
            إلغاء
          </BaseButton>
          <BaseButton
            color="warning"
            :loading="modalLoading"
            :disabled="!editForm.name || modalLoading"
            @click="updateCategory"
          >
            <Icon name="ph:check" class="h-4 w-4" />
            <span>حفظ</span>
          </BaseButton>
        </div>
      </template>
    </TairoModal>

    <!-- Delete Modal -->
    <TairoModal :open="showDeleteModal" size="sm" @close="showDeleteModal = false">
      <template #header>
        <div class="flex items-center gap-2 p-4 text-danger-500" dir="rtl">
          <Icon name="ph:warning-circle" class="h-5 w-5" />
          <span class="font-medium">تأكيد الحذف</span>
        </div>
      </template>

      <div class="p-4 space-y-4" dir="rtl">
        <p class="text-muted-600 dark:text-muted-300">
          هل أنت متأكد من حذف التصنيف
          <strong class="text-muted-900 dark:text-white">{{ selectedCategory?.name }}</strong>؟
        </p>
        <p v-if="selectedCategory?.childrenCount" class="text-sm text-warning-600 dark:text-warning-400">
          <Icon name="ph:warning" class="h-4 w-4 inline" />
          تحذير: يحتوي على {{ selectedCategory.childrenCount }} تصنيف فرعي
        </p>
        <p v-if="selectedCategory?.reportsCount" class="text-sm text-warning-600 dark:text-warning-400">
          <Icon name="ph:file" class="h-4 w-4 inline" />
          تحذير: يحتوي على {{ selectedCategory.reportsCount }} ملف
        </p>

        <!-- Error Message -->
        <div v-if="deleteError" class="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
          <div class="flex items-start gap-2">
            <Icon name="ph:x-circle" class="h-5 w-5 text-danger-500 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-danger-700 dark:text-danger-300">{{ deleteError }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2 p-4" dir="rtl">
          <BaseButton color="muted" @click="showDeleteModal = false" :disabled="modalLoading">
            إلغاء
          </BaseButton>
          <BaseButton
            color="danger"
            :loading="modalLoading"
            @click="deleteCategory"
          >
            <Icon name="ph:trash" class="h-4 w-4" />
            <span>حذف</span>
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
