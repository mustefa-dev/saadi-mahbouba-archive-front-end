<script setup lang="ts">
import type { Category, Report, ReportsResponse, SubCategory } from '~/types/reports';
import { getReportStatusColor, getReportStatusLabel } from '~/types/reports';
import { formatDate } from '~/utils/helpers';

useHead({
  title: "أرشيف الملفات"
})

definePageMeta({
  title: "الأرشيف"
})

const apiPaths = useApiPaths();


// State
const categories = ref<Category[]>([]);
const selectedCategoryId = ref<string | null>(null);
const selectedSubCategoryId = ref<string | null>(null);
const selectedReport = ref<Report | null>(null);
const searchQuery = ref('');
const pageNumber = ref(1);
const pageSize = ref(20);

// Tree expansion state
const expandedCategories = ref<Set<string>>(new Set());
const expandedSubCategories = ref<Set<string>>(new Set());

const viewMode = ref<'details' | 'tiles' | 'list'>('details');

const previewOpen = ref(false);
const previewReport = ref<Report | null>(null);

const currentPath = computed(() => {
  const path: { id: string | null; name: string; type: 'root' | 'category' | 'subcategory' }[] = [
    { id: null, name: 'الأرشيف', type: 'root' }
  ];

  if (selectedCategoryId.value) {
    const category = categories.value.find(c => c.id === selectedCategoryId.value);
    if (category) {
      path.push({ id: category.id, name: category.nameAr, type: 'category' });
    }
  }

  if (selectedSubCategoryId.value && selectedCategory.value) {
    const subCategory = selectedCategory.value.subCategories?.find(sc => sc.id === selectedSubCategoryId.value);
    if (subCategory) {
      path.push({ id: subCategory.id, name: subCategory.nameAr, type: 'subcategory' });
    }
  }

  return path;
});

// Computed selected category
const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value);
});

// Computed subcategories for selected category
const subCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return selectedCategory.value.subCategories?.filter(sc => sc.isActive) || [];
});

// Filtered categories based on search
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const search = searchQuery.value.toLowerCase();
  return categories.value.filter(c =>
    c.nameAr.toLowerCase().includes(search) ||
    c.name?.toLowerCase().includes(search)
  );
});

// Fetch categories
const { data: categoriesData, pending: categoriesLoading, refresh: refreshCategories } = await useFetch<any>(
  apiPaths.categories,
  {
    key: 'archive-categories',
    lazy: true,
    query: { pageSize: 100, isActive: true }
  }
);

watch(categoriesData, (data) => {
  if (data?.data) {
    categories.value = data.data;
  }
}, { immediate: true });

// Fetch ONLY archived reports
const { data: reportsData, refresh: refreshReports, pending: reportsLoading } = await useFetch<ReportsResponse>(
  apiPaths.archive,
  {
    key: 'archive-reports',
    lazy: true,
    query: computed(() => ({
      categoryId: selectedCategoryId.value || undefined,
      subCategoryId: selectedSubCategoryId.value || undefined,
      search: searchQuery.value || undefined,
      status: 2, // Only Approved/Archived reports
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const reports = computed<Report[]>(() => reportsData.value?.data || []);
const totalCount = computed(() => reportsData.value?.totalCount || 0);
const pageCount = computed(() => reportsData.value?.pageCount || 0);

// Items to display in the main content area
const displayItems = computed(() => {
  // If no category selected, show categories
  if (!selectedCategoryId.value) {
    return {
      type: 'categories' as const,
      items: filteredCategories.value
    };
  }

  // If category selected but no subcategory, show subcategories
  if (!selectedSubCategoryId.value) {
    return {
      type: 'subcategories' as const,
      items: subCategories.value
    };
  }

  // If subcategory selected, show reports
  return {
    type: 'reports' as const,
    items: reports.value
  };
});

// Tree toggle functions
const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
};

const toggleSubCategory = (subCategoryId: string) => {
  if (expandedSubCategories.value.has(subCategoryId)) {
    expandedSubCategories.value.delete(subCategoryId);
  } else {
    expandedSubCategories.value.add(subCategoryId);
  }
};

// Navigation functions
const navigateToRoot = () => {
  selectedCategoryId.value = null;
  selectedSubCategoryId.value = null;
  selectedReport.value = null;
  pageNumber.value = 1;
};

const navigateToCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
  selectedSubCategoryId.value = null;
  selectedReport.value = null;
  pageNumber.value = 1;
  expandedCategories.value.add(categoryId);
};

const navigateToSubCategory = (subCategoryId: string) => {
  selectedSubCategoryId.value = subCategoryId;
  selectedReport.value = null;
  pageNumber.value = 1;
  expandedSubCategories.value.add(subCategoryId);
};

const selectReport = (report: Report) => {
  selectedReport.value = report;
};

const openPreview = (report: Report) => {
  previewReport.value = report;
  previewOpen.value = true;
};

// File utilities
const getFileIcon = (fileName?: string) => {
  if (!fileName) return 'ph:file';
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    'pdf': 'ph:file-pdf',
    'doc': 'ph:file-doc',
    'docx': 'ph:file-doc',
    'xls': 'ph:file-xls',
    'xlsx': 'ph:file-xls',
    'jpg': 'ph:file-image',
    'jpeg': 'ph:file-image',
    'png': 'ph:file-image',
    'gif': 'ph:file-image',
    'webp': 'ph:file-image',
  };
  return iconMap[ext || ''] || 'ph:file';
};

const getFileIconColor = (fileName?: string) => {
  if (!fileName) return 'text-muted-500';
  const ext = fileName.split('.').pop()?.toLowerCase();
  const colorMap: Record<string, string> = {
    'pdf': 'text-red-500',
    'doc': 'text-blue-500',
    'docx': 'text-blue-500',
    'xls': 'text-green-500',
    'xlsx': 'text-green-500',
    'jpg': 'text-purple-500',
    'jpeg': 'text-purple-500',
    'png': 'text-purple-500',
  };
  return colorMap[ext || ''] || 'text-primary-500';
};

const isImage = (fileName?: string) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
};

const downloadFile = (fileUrl?: string, event?: Event) => {
  event?.stopPropagation();
  if (fileUrl) {
    window.open(apiPaths.getAsset(fileUrl), '_blank');
  }
};

const copyFileLink = async (fileUrl?: string, event?: Event) => {
  event?.stopPropagation();
  if (fileUrl) {
    try {
      await navigator.clipboard.writeText(apiPaths.getAsset(fileUrl));
      useToast({
        title: 'تم النسخ',
        message: 'تم نسخ رابط الملف بنجاح',
        icon: 'ph:check-circle'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
};

// Go back one level
const goBack = () => {
  if (selectedSubCategoryId.value) {
    selectedSubCategoryId.value = null;
    selectedReport.value = null;
  } else if (selectedCategoryId.value) {
    selectedCategoryId.value = null;
  }
  pageNumber.value = 1;
};

// Expand/Collapse all
const expandAll = () => {
  categories.value.forEach(c => {
    expandedCategories.value.add(c.id);
    c.subCategories?.forEach(sc => {
      expandedSubCategories.value.add(sc.id);
    });
  });
};

const collapseAll = () => {
  expandedCategories.value.clear();
  expandedSubCategories.value.clear();
};

// Refresh all data
const refreshAll = () => {
  refreshCategories();
  refreshReports();
};

// Statistics
const stats = computed(() => ({
  categories: categories.value.length,
  subCategories: categories.value.reduce((acc, c) => acc + (c.subCategoriesCount || 0), 0),
  totalFiles: categories.value.reduce((acc, c) => acc + (c.reportsCount || 0), 0),
  currentFiles: totalCount.value
}));
</script>

<template>
  <div class="h-[calc(100vh-120px)] flex flex-col">
    <!-- Toolbar - Windows Explorer Style -->
    <div class="bg-white dark:bg-muted-900 border-b border-muted-200 dark:border-muted-700 px-4 py-2">
      <div class="flex items-center justify-between gap-4">
        <!-- Navigation Buttons -->
        <div class="flex items-center gap-1">
          <BaseButtonIcon
            size="sm"
            color="default"
            :disabled="!selectedCategoryId && !selectedSubCategoryId"
            @click="goBack"
            data-nui-tooltip="رجوع"
          >
            <Icon name="ph:arrow-right" class="h-4 w-4" />
          </BaseButtonIcon>
          <BaseButtonIcon
            size="sm"
            color="default"
            @click="navigateToRoot"
            data-nui-tooltip="الأرشيف الرئيسي"
          >
            <Icon name="ph:house" class="h-4 w-4" />
          </BaseButtonIcon>
          <BaseButtonIcon
            size="sm"
            color="default"
            @click="refreshAll"
            :class="{ 'animate-spin': reportsLoading || categoriesLoading }"
            data-nui-tooltip="تحديث"
          >
            <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
          </BaseButtonIcon>
        </div>

        <!-- Breadcrumb / Address Bar -->
        <div class="flex-1 flex items-center bg-muted-100 dark:bg-muted-800 rounded-lg px-3 py-1.5 border border-muted-200 dark:border-muted-700">
          <Icon name="ph:folder-open" class="h-4 w-4 text-yellow-500 ml-2" />
          <div class="flex items-center gap-1 text-sm overflow-x-auto">
            <template v-for="(item, index) in currentPath" :key="item.id || 'root'">
              <button
                @click="item.type === 'root' ? navigateToRoot() : item.type === 'category' ? navigateToCategory(item.id!) : navigateToSubCategory(item.id!)"
                class="hover:text-primary-500 hover:underline whitespace-nowrap"
                :class="index === currentPath.length - 1 ? 'font-semibold text-muted-900 dark:text-white' : 'text-muted-600 dark:text-muted-400'"
              >
                {{ item.name }}
              </button>
              <Icon v-if="index < currentPath.length - 1" name="ph:caret-left" class="h-3 w-3 text-muted-400" />
            </template>
          </div>
        </div>

        <!-- Search -->
        <div class="relative w-64">
          <Icon name="ph:magnifying-glass" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث..."
            class="w-full pr-9 pl-3 py-1.5 text-sm rounded-lg border border-muted-200 dark:border-muted-700 bg-muted-100 dark:bg-muted-800 focus:border-primary-500 focus:ring-0"
          />
        </div>

        <!-- View Mode Toggle -->
        <div class="flex items-center bg-muted-100 dark:bg-muted-800 rounded-lg p-0.5 border border-muted-200 dark:border-muted-700">
          <button
            @click="viewMode = 'tiles'"
            class="p-1.5 rounded transition-colors"
            :class="viewMode === 'tiles' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400'"
            data-nui-tooltip="عرض مصغرات"
          >
            <Icon name="ph:squares-four" class="h-4 w-4" />
          </button>
          <button
            @click="viewMode = 'details'"
            class="p-1.5 rounded transition-colors"
            :class="viewMode === 'details' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400'"
            data-nui-tooltip="عرض تفاصيل"
          >
            <Icon name="ph:list" class="h-4 w-4" />
          </button>
          <button
            @click="viewMode = 'list'"
            class="p-1.5 rounded transition-colors"
            :class="viewMode === 'list' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400'"
            data-nui-tooltip="عرض قائمة"
          >
            <Icon name="ph:list-bullets" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar - Tree View (Windows Explorer Style) -->
      <div class="w-64 border-l border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 overflow-y-auto">
        <!-- Tree Header -->
        <div class="sticky top-0 bg-white dark:bg-muted-900 border-b border-muted-200 dark:border-muted-700 px-3 py-2 flex items-center justify-between z-10">
          <span class="text-xs font-semibold text-muted-500 uppercase">التصنيفات</span>
          <div class="flex items-center gap-1">
            <button @click="expandAll" class="p-1 hover:bg-muted-100 dark:hover:bg-muted-800 rounded" data-nui-tooltip="توسيع الكل">
              <Icon name="ph:arrows-out" class="h-3.5 w-3.5 text-muted-400" />
            </button>
            <button @click="collapseAll" class="p-1 hover:bg-muted-100 dark:hover:bg-muted-800 rounded" data-nui-tooltip="طي الكل">
              <Icon name="ph:arrows-in" class="h-3.5 w-3.5 text-muted-400" />
            </button>
          </div>
        </div>

        <!-- Tree Content -->
        <div class="p-2">
          <!-- Root Item -->
          <button
            @click="navigateToRoot"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600': !selectedCategoryId }"
          >
            <Icon name="ph:archive-box" class="h-4 w-4 text-yellow-500" />
            <span class="truncate">الأرشيف</span>
            <span class="mr-auto text-xs text-muted-400">({{ stats.totalFiles }})</span>
          </button>

          <!-- Loading -->
          <div v-if="categoriesLoading" class="space-y-2 mt-2">
            <BasePlaceload v-for="i in 5" :key="i" class="h-6 w-full rounded" />
          </div>

          <!-- Categories Tree -->
          <div v-else class="mt-1">
            <div v-for="category in categories" :key="category.id" class="select-none">
              <!-- Category Item -->
              <div
                class="flex items-center gap-1 px-1 py-1 rounded text-sm hover:bg-muted-100 dark:hover:bg-muted-800 cursor-pointer transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedCategoryId === category.id && !selectedSubCategoryId }"
              >
                <!-- Expand/Collapse Arrow -->
                <button
                  v-if="category.subCategories && category.subCategories.length > 0"
                  @click.stop="toggleCategory(category.id)"
                  class="p-0.5 hover:bg-muted-200 dark:hover:bg-muted-700 rounded"
                >
                  <Icon
                    :name="expandedCategories.has(category.id) ? 'ph:caret-down' : 'ph:caret-left'"
                    class="h-3 w-3 text-muted-400"
                  />
                </button>
                <div v-else class="w-4"></div>

                <!-- Category Icon & Name -->
                <button
                  @click="navigateToCategory(category.id)"
                  class="flex-1 flex items-center gap-2 text-right min-w-0"
                >
                  <Icon
                    :name="expandedCategories.has(category.id) ? 'ph:folder-open' : 'ph:folder'"
                    class="h-4 w-4 text-yellow-500 flex-shrink-0"
                  />
                  <span class="truncate" :class="selectedCategoryId === category.id ? 'text-primary-600 dark:text-primary-400 font-medium' : ''">
                    {{ category.nameAr }}
                  </span>
                  <span class="mr-auto text-xs text-muted-400">({{ category.reportsCount }})</span>
                </button>
              </div>

              <!-- SubCategories -->
              <div
                v-if="expandedCategories.has(category.id) && category.subCategories && category.subCategories.length > 0"
                class="mr-4 border-r border-muted-200 dark:border-muted-700"
              >
                <div v-for="subCategory in category.subCategories.filter(sc => sc.isActive)" :key="subCategory.id">
                  <button
                    @click="navigateToCategory(category.id); navigateToSubCategory(subCategory.id)"
                    class="w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors"
                    :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedSubCategoryId === subCategory.id }"
                  >
                    <Icon name="ph:folder-simple" class="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span class="truncate" :class="selectedSubCategoryId === subCategory.id ? 'text-primary-600 dark:text-primary-400 font-medium' : ''">
                      {{ subCategory.nameAr }}
                    </span>
                    <span class="mr-auto text-xs text-muted-400">({{ subCategory.reportsCount }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="flex-1 flex flex-col bg-muted-50 dark:bg-muted-950 overflow-hidden">
        <!-- Status Bar -->
        <div class="px-4 py-2 border-b border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 text-xs text-muted-500 flex items-center justify-between">
          <span>
            <template v-if="displayItems.type === 'categories'">{{ filteredCategories.length }} تصنيف</template>
            <template v-else-if="displayItems.type === 'subcategories'">{{ subCategories.length }} تصنيف فرعي</template>
            <template v-else>{{ totalCount }} ملف مؤرشف</template>
          </span>
          <span v-if="selectedReport">
            الملف المحدد: {{ selectedReport.title }}
          </span>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Loading -->
          <div v-if="reportsLoading && displayItems.type === 'reports'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BasePlaceload v-for="i in 8" :key="i" class="h-24 w-full rounded-lg" />
          </div>

          <!-- Empty State -->
          <div v-else-if="displayItems.items.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <Icon name="ph:folder-simple-dashed" class="h-20 w-20 text-muted-300 mb-4" />
            <p class="text-muted-500 text-lg">هذا المجلد فارغ</p>
            <p class="text-muted-400 text-sm mt-1">لا توجد ملفات مؤرشفة في هذا التصنيف</p>
          </div>

          <!-- Categories View -->
          <template v-else-if="displayItems.type === 'categories'">
            <!-- Tiles View -->
            <div v-if="viewMode === 'tiles'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="category in displayItems.items"
                :key="category.id"
                @click="navigateToCategory(category.id)"
                @dblclick="navigateToCategory(category.id)"
                class="flex flex-col items-center p-4 rounded-xl hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-all hover:shadow-lg group"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500': selectedCategoryId === category.id }"
              >
                <Icon name="ph:folder" class="h-16 w-16 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span class="mt-2 text-sm font-medium text-center line-clamp-2">{{ category.nameAr }}</span>
                <span class="text-xs text-muted-400 mt-1">{{ category.reportsCount }} ملف</span>
              </div>
            </div>

            <!-- Details View -->
            <div v-else-if="viewMode === 'details'" class="bg-white dark:bg-muted-900 rounded-lg border border-muted-200 dark:border-muted-700 overflow-hidden">
              <table class="w-full">
                <thead class="bg-muted-50 dark:bg-muted-800 border-b border-muted-200 dark:border-muted-700">
                  <tr>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">الاسم</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">التصنيفات الفرعية</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">عدد الملفات</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-muted-100 dark:divide-muted-800">
                  <tr
                    v-for="category in displayItems.items"
                    :key="category.id"
                    @click="selectReport(null); selectedCategoryId = category.id"
                    @dblclick="navigateToCategory(category.id)"
                    class="hover:bg-muted-50 dark:hover:bg-muted-800/50 cursor-pointer transition-colors"
                    :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedCategoryId === category.id }"
                  >
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-3">
                        <Icon name="ph:folder" class="h-5 w-5 text-yellow-500" />
                        <span class="font-medium">{{ category.nameAr }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ category.subCategoriesCount }}</td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ category.reportsCount }}</td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ formatDate(category.creationDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- List View -->
            <div v-else class="space-y-1">
              <div
                v-for="category in displayItems.items"
                :key="category.id"
                @click="selectedCategoryId = category.id"
                @dblclick="navigateToCategory(category.id)"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedCategoryId === category.id }"
              >
                <Icon name="ph:folder" class="h-5 w-5 text-yellow-500" />
                <span class="font-medium">{{ category.nameAr }}</span>
                <span class="text-xs text-muted-400 mr-auto">{{ category.reportsCount }} ملف</span>
              </div>
            </div>
          </template>

          <!-- SubCategories View -->
          <template v-else-if="displayItems.type === 'subcategories'">
            <!-- Tiles View -->
            <div v-if="viewMode === 'tiles'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="subCategory in displayItems.items"
                :key="subCategory.id"
                @click="navigateToSubCategory(subCategory.id)"
                @dblclick="navigateToSubCategory(subCategory.id)"
                class="flex flex-col items-center p-4 rounded-xl hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-all hover:shadow-lg group"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500': selectedSubCategoryId === subCategory.id }"
              >
                <Icon name="ph:folder-simple" class="h-16 w-16 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span class="mt-2 text-sm font-medium text-center line-clamp-2">{{ subCategory.nameAr }}</span>
                <span class="text-xs text-muted-400 mt-1">{{ subCategory.reportsCount }} ملف</span>
              </div>
            </div>

            <!-- Details View -->
            <div v-else-if="viewMode === 'details'" class="bg-white dark:bg-muted-900 rounded-lg border border-muted-200 dark:border-muted-700 overflow-hidden">
              <table class="w-full">
                <thead class="bg-muted-50 dark:bg-muted-800 border-b border-muted-200 dark:border-muted-700">
                  <tr>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">الاسم</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">عدد الملفات</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-muted-100 dark:divide-muted-800">
                  <tr
                    v-for="subCategory in displayItems.items"
                    :key="subCategory.id"
                    @click="selectedSubCategoryId = subCategory.id"
                    @dblclick="navigateToSubCategory(subCategory.id)"
                    class="hover:bg-muted-50 dark:hover:bg-muted-800/50 cursor-pointer transition-colors"
                    :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedSubCategoryId === subCategory.id }"
                  >
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-3">
                        <Icon name="ph:folder-simple" class="h-5 w-5 text-yellow-400" />
                        <span class="font-medium">{{ subCategory.nameAr }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ subCategory.reportsCount }}</td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ formatDate(subCategory.creationDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- List View -->
            <div v-else class="space-y-1">
              <div
                v-for="subCategory in displayItems.items"
                :key="subCategory.id"
                @click="selectedSubCategoryId = subCategory.id"
                @dblclick="navigateToSubCategory(subCategory.id)"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedSubCategoryId === subCategory.id }"
              >
                <Icon name="ph:folder-simple" class="h-5 w-5 text-yellow-400" />
                <span class="font-medium">{{ subCategory.nameAr }}</span>
                <span class="text-xs text-muted-400 mr-auto">{{ subCategory.reportsCount }} ملف</span>
              </div>
            </div>
          </template>

          <!-- Reports View -->
          <template v-else>
            <!-- Tiles View -->
            <div v-if="viewMode === 'tiles'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="report in displayItems.items"
                :key="report.id"
                @click="selectReport(report)"
                @dblclick="openPreview(report)"
                class="flex flex-col items-center p-4 rounded-xl hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-all hover:shadow-lg group"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500': selectedReport?.id === report.id }"
              >
                <Icon :name="getFileIcon(report.fileName)" class="h-16 w-16 group-hover:scale-110 transition-transform" :class="getFileIconColor(report.fileName)" />
                <span class="mt-2 text-sm font-medium text-center line-clamp-2">{{ report.title }}</span>
                <span class="text-xs text-muted-400 mt-1">{{ formatDate(report.createdAt) }}</span>
              </div>
            </div>

            <!-- Details View -->
            <div v-else-if="viewMode === 'details'" class="bg-white dark:bg-muted-900 rounded-lg border border-muted-200 dark:border-muted-700 overflow-hidden">
              <table class="w-full">
                <thead class="bg-muted-50 dark:bg-muted-800 border-b border-muted-200 dark:border-muted-700">
                  <tr>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">الاسم</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">الوصف</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">سنة الملف</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">تاريخ الأرشفة</th>
                    <th class="text-right px-4 py-2 text-xs font-semibold text-muted-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-muted-100 dark:divide-muted-800">
                  <tr
                    v-for="report in displayItems.items"
                    :key="report.id"
                    @click="selectReport(report)"
                    @dblclick="openPreview(report)"
                    class="hover:bg-muted-50 dark:hover:bg-muted-800/50 cursor-pointer transition-colors"
                    :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedReport?.id === report.id }"
                  >
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-3">
                        <Icon :name="getFileIcon(report.fileName)" class="h-5 w-5" :class="getFileIconColor(report.fileName)" />
                        <div class="min-w-0">
                          <p class="font-medium truncate max-w-[200px]">{{ report.title }}</p>
                          <p class="text-xs text-muted-400 truncate max-w-[200px]">{{ report.fileName }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-muted-600 max-w-[200px] truncate">{{ report.description || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ report.fileYear || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-muted-600">{{ formatDate(report.archivedAt || report.createdAt) }}</td>
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-1">
                        <BaseButtonIcon size="xs" color="info" variant="pastel" @click.stop="openPreview(report)">
                          <Icon name="ph:eye" class="h-3.5 w-3.5" />
                        </BaseButtonIcon>
                        <BaseButtonIcon size="xs" color="success" variant="pastel" @click.stop="downloadFile(report.fileUrl, $event)">
                          <Icon name="ph:download" class="h-3.5 w-3.5" />
                        </BaseButtonIcon>
                        <BaseButtonIcon size="xs" color="warning" variant="pastel" @click.stop="copyFileLink(report.fileUrl, $event)">
                          <Icon name="ph:link" class="h-3.5 w-3.5" />
                        </BaseButtonIcon>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- List View -->
            <div v-else class="space-y-1">
              <div
                v-for="report in displayItems.items"
                :key="report.id"
                @click="selectReport(report)"
                @dblclick="openPreview(report)"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-muted-800 cursor-pointer transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedReport?.id === report.id }"
              >
                <Icon :name="getFileIcon(report.fileName)" class="h-5 w-5" :class="getFileIconColor(report.fileName)" />
                <span class="font-medium flex-1 truncate">{{ report.title }}</span>
                <span class="text-xs text-muted-400">{{ report.fileYear || '-' }}</span>
                <span class="text-xs text-muted-400">{{ formatDate(report.createdAt) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div v-if="displayItems.type === 'reports' && pageCount > 1" class="px-4 py-2 border-t border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900">
          <BasePagination
            :current-page="pageNumber"
            :item-per-page="pageSize"
            :total-items="totalCount"
            @update:current-page="pageNumber = $event"
          />
        </div>
      </div>

      <!-- Right Preview Panel (when report selected) -->
      <Transition
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-if="selectedReport"
          class="w-80 border-r border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 overflow-y-auto"
        >
          <div class="sticky top-0 bg-white dark:bg-muted-900 border-b border-muted-200 dark:border-muted-700 px-4 py-3 flex items-center justify-between">
            <span class="text-sm font-semibold">معاينة</span>
            <button @click="selectedReport = null" class="p-1 hover:bg-muted-100 dark:hover:bg-muted-800 rounded">
              <Icon name="ph:x" class="h-4 w-4 text-muted-400" />
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- File Icon -->
            <div class="flex flex-col items-center py-4">
              <Icon :name="getFileIcon(selectedReport.fileName)" class="h-20 w-20" :class="getFileIconColor(selectedReport.fileName)" />
              <h3 class="mt-3 font-semibold text-center">{{ selectedReport.title }}</h3>
              <p class="text-xs text-muted-400">{{ selectedReport.fileName }}</p>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center justify-center gap-2">
              <BaseButton size="sm" color="info" @click="openPreview(selectedReport)">
                <Icon name="ph:eye" class="h-4 w-4" />
                <span>معاينة</span>
              </BaseButton>
              <BaseButton size="sm" color="success" @click="downloadFile(selectedReport.fileUrl)">
                <Icon name="ph:download" class="h-4 w-4" />
                <span>تحميل</span>
              </BaseButton>
            </div>

            <!-- Details -->
            <div class="space-y-3 pt-4 border-t border-muted-200 dark:border-muted-700">
              <div>
                <label class="text-xs text-muted-400">الوصف</label>
                <p class="text-sm">{{ selectedReport.description || 'لا يوجد' }}</p>
              </div>
              <div>
                <label class="text-xs text-muted-400">التصنيف</label>
                <p class="text-sm">{{ selectedReport.categoryName }} / {{ selectedReport.subCategoryName }}</p>
              </div>
              <div>
                <label class="text-xs text-muted-400">سنة الملف</label>
                <p class="text-sm">{{ selectedReport.fileYear || '-' }}</p>
              </div>
              <div>
                <label class="text-xs text-muted-400">تاريخ الأرشفة</label>
                <p class="text-sm">{{ formatDate(selectedReport.archivedAt || selectedReport.createdAt) }}</p>
              </div>
              <div v-if="selectedReport.archiveNotes">
                <label class="text-xs text-muted-400">ملاحظات</label>
                <p class="text-sm">{{ selectedReport.archiveNotes }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- File Preview Modal -->
    <TairoModal :open="previewOpen" size="2xl" @close="previewOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 border-b border-muted-200 dark:border-muted-700">
          <div class="flex items-center gap-3">
            <Icon :name="getFileIcon(previewReport?.fileName)" class="h-6 w-6" :class="getFileIconColor(previewReport?.fileName)" />
            <div>
              <h3 class="font-bold">{{ previewReport?.title }}</h3>
              <p class="text-xs text-muted-400">{{ previewReport?.fileName }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <BaseButtonIcon v-if="previewReport?.fileUrl" @click="downloadFile(previewReport.fileUrl)" color="success" size="sm">
              <Icon name="ph:download" class="h-4 w-4" />
            </BaseButtonIcon>
            <BaseButtonClose @click="previewOpen = false" />
          </div>
        </div>
      </template>

      <div class="p-4">
        <div v-if="previewReport?.fileUrl" class="rounded-lg overflow-hidden bg-muted-100 dark:bg-muted-800">
          <!-- PDF Preview -->
          <iframe
            v-if="previewReport.fileName?.toLowerCase().endsWith('.pdf')"
            :src="apiPaths.getAsset(previewReport.fileUrl)"
            class="w-full h-[600px] border-0"
          ></iframe>
          <!-- Image Preview -->
          <div v-else-if="isImage(previewReport.fileName)" class="flex items-center justify-center p-4">
            <img
              :src="apiPaths.getAsset(previewReport.fileUrl)"
              :alt="previewReport.title"
              class="max-w-full max-h-[600px] object-contain"
            />
          </div>
          <!-- Other files -->
          <div v-else class="p-8 text-center">
            <Icon :name="getFileIcon(previewReport.fileName)" class="h-20 w-20 mx-auto mb-4" :class="getFileIconColor(previewReport.fileName)" />
            <p class="text-muted-500 mb-4">لا يمكن معاينة هذا النوع من الملفات</p>
            <BaseButton @click="downloadFile(previewReport.fileUrl)" color="primary">
              <Icon name="ph:download" class="h-4 w-4" />
              <span>تحميل الملف</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
