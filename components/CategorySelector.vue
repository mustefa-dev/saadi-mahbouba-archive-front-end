<script setup lang="ts">
import type { Category } from '~/types/reports';
import type { CategoryBreadcrumb } from '~/types/archive';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const apiPaths = useApiPaths();

// State
const isOpen = ref(false);
const searchQuery = ref('');
const categories = ref<Category[]>([]);
const allCategories = ref<Category[]>([]);
const currentCategory = ref<Category | null>(null);
const breadcrumbs = ref<CategoryBreadcrumb[]>([]);
const loading = ref(false);
const selectedCategory = ref<Category | null>(null);

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;

  const query = searchQuery.value.toLowerCase();
  // When searching, search all categories flat
  const searchInTree = (cats: Category[]): Category[] => {
    let results: Category[] = [];
    for (const cat of cats) {
      if (cat.name.toLowerCase().includes(query)) {
        results.push(cat);
      }
      if (cat.children?.length) {
        results = [...results, ...searchInTree(cat.children)];
      }
    }
    return results;
  };
  return searchInTree(allCategories.value);
});

const selectedPath = computed(() => {
  if (!props.modelValue) return null;
  // Find category in flat list
  const findInTree = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children?.length) {
        const found = findInTree(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  return findInTree(allCategories.value, props.modelValue);
});

// Fetch all categories
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await $fetch<any>(apiPaths.categoryTree);
    allCategories.value = Array.isArray(response) ? response : (response?.data || []);
    categories.value = allCategories.value.filter(c => !c.parentId);
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch breadcrumbs
const fetchBreadcrumbs = async (categoryId: string) => {
  try {
    const response = await $fetch<any>(apiPaths.categoryBreadcrumbs(categoryId));
    breadcrumbs.value = response || [];
  } catch (error) {
    breadcrumbs.value = [];
  }
};

// Navigate to category - use children from loaded data
const navigateTo = async (category: Category | null) => {
  currentCategory.value = category;
  searchQuery.value = '';

  if (category) {
    await fetchBreadcrumbs(category.id);
    // Use children from already loaded data
    categories.value = category.children || [];
  } else {
    breadcrumbs.value = [];
    categories.value = allCategories.value.filter(c => !c.parentId);
  }
};

// Navigate via breadcrumb
const navigateToBreadcrumb = async (crumb: CategoryBreadcrumb | null) => {
  if (!crumb) {
    await navigateTo(null);
    return;
  }

  // Find category in tree to get its children
  const findInTree = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children?.length) {
        const found = findInTree(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findInTree(allCategories.value, crumb.id);
  if (category) {
    await navigateTo(category);
  }
};

// Select category
const selectCategory = (category: Category) => {
  selectedCategory.value = category;
  emit('update:modelValue', category.id);
  isOpen.value = false;
};

// Clear selection
const clearSelection = () => {
  selectedCategory.value = null;
  emit('update:modelValue', undefined);
};

// Open modal
const openModal = async () => {
  await fetchCategories();

  // If there's a selected value, find it
  if (props.modelValue) {
    const findInTree = (cats: Category[], id: string): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children?.length) {
          const found = findInTree(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    selectedCategory.value = findInTree(allCategories.value, props.modelValue);
  }

  currentCategory.value = null;
  breadcrumbs.value = [];
  searchQuery.value = '';
  categories.value = allCategories.value.filter(c => !c.parentId);
  isOpen.value = true;
};

// Build full path for a category
const getFullPath = (category: Category): string => {
  const buildPath = (cats: Category[], targetId: string, path: string[] = []): string[] | null => {
    for (const cat of cats) {
      if (cat.id === targetId) {
        return [...path, cat.name];
      }
      if (cat.children?.length) {
        const result = buildPath(cat.children, targetId, [...path, cat.name]);
        if (result) return result;
      }
    }
    return null;
  };

  const pathArray = buildPath(allCategories.value, category.id);
  return pathArray ? pathArray.join(' > ') : category.name;
};
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <div
      class="relative w-full cursor-pointer"
      @click="openModal"
    >
      <div
        class="w-full px-4 py-2 border border-muted-300 dark:border-muted-700 rounded-lg bg-white dark:bg-muted-800 hover:border-primary-500 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <Icon name="ph:folder-duotone" class="w-5 h-5 text-amber-500 flex-shrink-0" />
            <template v-if="selectedPath">
              <span class="text-muted-800 dark:text-muted-200 truncate">
                {{ getFullPath(selectedPath) }}
              </span>
              <span class="text-xs text-muted-500 bg-muted-100 dark:bg-muted-700 px-1.5 py-0.5 rounded flex-shrink-0">
                L{{ selectedPath.level ?? 0 }}
              </span>
            </template>
            <span v-else class="text-muted-400">
              {{ placeholder || 'اختر التصنيف...' }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="modelValue"
              type="button"
              class="p-1 hover:bg-muted-100 dark:hover:bg-muted-700 rounded"
              @click.stop="clearSelection"
            >
              <Icon name="ph:x" class="w-4 h-4 text-muted-400" />
            </button>
            <Icon name="ph:caret-down" class="w-4 h-4 text-muted-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Selection Modal -->
    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div class="flex items-center justify-between p-4" dir="rtl">
          <h3 class="font-medium text-muted-900 dark:text-white">اختر التصنيف</h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 space-y-4" dir="rtl">
        <!-- Search -->
        <BaseInput
          v-model="searchQuery"
          placeholder="البحث في التصنيفات..."
          icon="ph:magnifying-glass"
        />

        <!-- Breadcrumbs (hide when searching) -->
        <div v-if="!searchQuery" class="flex items-center gap-2 p-2 bg-muted-50 dark:bg-muted-900/50 rounded-lg overflow-x-auto">
          <button
            class="flex items-center gap-1 px-2 py-1 rounded text-sm whitespace-nowrap transition-colors"
            :class="!currentCategory ? 'bg-primary-500 text-white' : 'hover:bg-muted-200 dark:hover:bg-muted-700 text-muted-600 dark:text-muted-300'"
            @click="navigateToBreadcrumb(null)"
          >
            <Icon name="ph:house" class="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
            <Icon name="ph:caret-left" class="w-4 h-4 text-muted-400 flex-shrink-0" />
            <button
              class="px-2 py-1 rounded text-sm whitespace-nowrap transition-colors"
              :class="index === breadcrumbs.length - 1 ? 'bg-primary-500 text-white' : 'hover:bg-muted-200 dark:hover:bg-muted-700 text-muted-600 dark:text-muted-300'"
              @click="navigateToBreadcrumb(crumb)"
            >
              {{ crumb.name }}
            </button>
          </template>
        </div>

        <!-- Search Results Label -->
        <div v-if="searchQuery" class="text-sm text-muted-500">
          نتائج البحث: {{ filteredCategories.length }} تصنيف
        </div>

        <!-- Categories List -->
        <div class="max-h-80 overflow-y-auto border border-muted-200 dark:border-muted-700 rounded-lg">
          <!-- Loading -->
          <div v-if="loading" class="p-4 text-center">
            <BasePlaceload class="h-10 w-full rounded mb-2" />
            <BasePlaceload class="h-10 w-full rounded mb-2" />
            <BasePlaceload class="h-10 w-full rounded" />
          </div>

          <!-- Empty -->
          <div v-else-if="filteredCategories.length === 0" class="p-8 text-center">
            <Icon name="ph:folder-dashed" class="w-12 h-12 mx-auto text-muted-300 mb-2" />
            <p class="text-muted-400">{{ searchQuery ? 'لا توجد نتائج' : 'لا توجد تصنيفات' }}</p>
          </div>

          <!-- List -->
          <div v-else class="divide-y divide-muted-200 dark:divide-muted-700">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              class="flex items-center justify-between p-3 hover:bg-muted-50 dark:hover:bg-muted-800 transition-colors"
            >
              <!-- Category Info -->
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <Icon
                  :name="(category.children?.length > 0 || category.childrenCount > 0) ? 'ph:folder-notch-duotone' : 'ph:folder-duotone'"
                  class="w-5 h-5 text-amber-500 flex-shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-muted-800 dark:text-muted-200 truncate">
                      {{ category.name }}
                    </p>
                    <span class="text-xs text-muted-400 bg-muted-100 dark:bg-muted-800 px-1.5 py-0.5 rounded flex-shrink-0">
                      L{{ category.level ?? 0 }}
                    </span>
                  </div>
                  <p v-if="searchQuery" class="text-xs text-muted-400 truncate">
                    {{ getFullPath(category) }}
                  </p>
                  <p v-else class="text-xs text-muted-400">
                    {{ category.children?.length || category.childrenCount || 0 }} فرعي | {{ category.reportsCount || 0 }} ملف
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Navigate into (if has children and not searching) -->
                <BaseButton
                  v-if="(category.children?.length > 0 || Number(category.childrenCount) > 0) && !searchQuery"
                  size="sm"
                  color="warning"
                  @click="navigateTo(category)"
                >
                  <Icon name="ph:folder-open" class="w-4 h-4" />
                  <span>فتح</span>
                </BaseButton>

                <!-- Select Button -->
                <BaseButton
                  size="sm"
                  :color="modelValue === category.id ? 'success' : 'primary'"
                  @click="selectCategory(category)"
                >
                  <Icon name="ph:check" class="w-4 h-4" />
                  <span>{{ modelValue === category.id ? 'محدد' : 'اختيار' }}</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Category Preview -->
        <div v-if="selectedCategory" class="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2 text-success-700 dark:text-success-400">
              <Icon name="ph:check-circle" class="h-4 w-4" />
              <span class="text-sm font-medium">التصنيف المحدد:</span>
            </div>
            <span class="text-xs bg-success-200 dark:bg-success-800 text-success-700 dark:text-success-300 px-2 py-0.5 rounded">
              المستوى {{ selectedCategory.level ?? 0 }}
            </span>
          </div>
          <p class="text-sm text-success-900 dark:text-success-200 mr-6">
            <Icon name="ph:folder" class="h-4 w-4 inline ml-1" />
            {{ getFullPath(selectedCategory) }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between p-4" dir="rtl">
          <BaseButton
            v-if="modelValue"
            color="default"
            variant="outline"
            size="sm"
            @click="clearSelection"
          >
            <Icon name="ph:x" class="h-4 w-4" />
            <span>مسح الاختيار</span>
          </BaseButton>
          <div v-else></div>
          <BaseButton color="default" @click="isOpen = false">
            إغلاق
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
