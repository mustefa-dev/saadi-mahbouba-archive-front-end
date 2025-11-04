<script setup lang="ts">
import type { Category, Report, ReportsResponse } from '~/types/reports';
import { ReportStatusLabels, ReportStatusColors } from '~/types/reports';
import { formatDate } from '~/utils/helpers';
import ViewReport from '~/views/reports/components/ViewReport.vue';

useHead({
  title: "أرشيف التقارير"
})

definePageMeta({
  title: "الأرشيف"
})

const apiPaths = useApiPaths();

const categories = ref<Category[]>([]);
const selectedCategoryId = ref<string | undefined>(undefined);
const selectedSubCategoryId = ref<string | undefined>(undefined);
const searchQuery = ref('');
const pageNumber = ref(1);
const pageSize = ref(12);

// Computed selected category
const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value);
});

// Computed subcategories
const subCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return selectedCategory.value.subCategories?.filter(sc => sc.isActive) || [];
});

// Fetch categories
const { data: categoriesData, pending: categoriesLoading } = await useFetch<any>(
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
});

// Fetch reports
const { data: reportsData, refresh: refreshReports, pending: reportsLoading } = await useFetch<ReportsResponse>(
  apiPaths.archive,
  {
    key: 'archive-reports',
    lazy: true,
    query: computed(() => ({
      categoryId: selectedCategoryId.value,
      subCategoryId: selectedSubCategoryId.value,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const reports = computed<Report[]>(() => reportsData.value?.data || []);
const totalCount = computed(() => reportsData.value?.totalCount || 0);
const pageCount = computed(() => reportsData.value?.pageCount || 0);

// Watch category change
watch(selectedCategoryId, () => {
  selectedSubCategoryId.value = undefined;
  pageNumber.value = 1;
});

watch(selectedSubCategoryId, () => {
  pageNumber.value = 1;
});

const selectCategory = (categoryId: string) => {
  if (selectedCategoryId.value === categoryId) {
    selectedCategoryId.value = undefined;
  } else {
    selectedCategoryId.value = categoryId;
  }
};

const selectSubCategory = (subCategoryId: string) => {
  if (selectedSubCategoryId.value === subCategoryId) {
    selectedSubCategoryId.value = undefined;
  } else {
    selectedSubCategoryId.value = subCategoryId;
  }
};

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
  };

  return iconMap[ext || ''] || 'ph:file';
};

const downloadFile = (fileUrl?: string) => {
  if (fileUrl) {
    window.open(apiPaths.getAsset(fileUrl), '_blank');
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">أرشيف التقارير</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">تصفح التقارير حسب التصنيفات</BaseParagraph>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div v-if="selectedCategory || selectedSubCategoryId" class="flex items-center gap-2 text-sm">
      <button @click="selectedCategoryId = undefined" class="text-primary-500 hover:text-primary-600 flex items-center gap-1">
        <Icon name="ph:house" class="h-4 w-4" />
        <span>جميع التصنيفات</span>
      </button>
      <Icon v-if="selectedCategory" name="ph:caret-left" class="h-4 w-4 text-muted-400" />
      <button
        v-if="selectedCategory"
        @click="selectedSubCategoryId = undefined"
        class="text-primary-500 hover:text-primary-600"
        :class="{ 'font-semibold': !selectedSubCategoryId }"
      >
        {{ selectedCategory.nameAr }}
      </button>
      <Icon v-if="selectedSubCategoryId && subCategories.length > 0" name="ph:caret-left" class="h-4 w-4 text-muted-400" />
      <span v-if="selectedSubCategoryId" class="font-semibold text-muted-900 dark:text-white">
        {{ subCategories.find(sc => sc.id === selectedSubCategoryId)?.nameAr }}
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar - Categories -->
      <div class="lg:col-span-1">
        <BaseCard class="sticky top-6">
          <div class="p-4 border-b border-muted-200 dark:border-muted-700">
            <BaseHeading size="lg" weight="semibold">التصنيفات</BaseHeading>
          </div>

          <div v-if="categoriesLoading" class="p-4 space-y-2">
            <BasePlaceload class="h-12 w-full rounded" />
            <BasePlaceload class="h-12 w-full rounded" />
            <BasePlaceload class="h-12 w-full rounded" />
          </div>

          <div v-else class="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            <!-- All Categories Option -->
            <button
              @click="selectedCategoryId = undefined"
              class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/20': !selectedCategoryId }"
            >
              <Icon name="ph:folders" class="h-6 w-6" :class="!selectedCategoryId ? 'text-primary-500' : 'text-muted-400'" />
              <div class="text-right flex-1">
                <div class="font-medium" :class="!selectedCategoryId ? 'text-primary-600 dark:text-primary-400' : 'text-muted-700 dark:text-muted-300'">
                  جميع التصنيفات
                </div>
              </div>
            </button>

            <!-- Categories List -->
            <div v-for="category in categories" :key="category.id" class="mb-1">
              <button
                @click="selectCategory(category.id)"
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedCategoryId === category.id && !selectedSubCategoryId }"
              >
                <Icon
                  :name="category.icon || 'ph:folder'"
                  class="h-6 w-6"
                  :class="selectedCategoryId === category.id ? 'text-primary-500' : 'text-muted-400'"
                />
                <div class="text-right flex-1">
                  <div
                    class="font-medium"
                    :class="selectedCategoryId === category.id ? 'text-primary-600 dark:text-primary-400' : 'text-muted-700 dark:text-muted-300'"
                  >
                    {{ category.nameAr }}
                  </div>
                  <div class="text-xs text-muted-400">{{ category.reportsCount }} تقرير</div>
                </div>
                <Icon
                  name="ph:caret-down"
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': selectedCategoryId === category.id }"
                />
              </button>

              <!-- Subcategories -->
              <div
                v-if="selectedCategoryId === category.id && category.subCategories && category.subCategories.length > 0"
                class="mr-6 mt-1 space-y-1"
              >
                <button
                  v-for="subCategory in category.subCategories.filter(sc => sc.isActive)"
                  :key="subCategory.id"
                  @click.stop="selectSubCategory(subCategory.id)"
                  class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors text-sm"
                  :class="{ 'bg-primary-100 dark:bg-primary-900/30': selectedSubCategoryId === subCategory.id }"
                >
                  <Icon name="ph:folder-simple" class="h-4 w-4 text-muted-400" />
                  <div class="text-right flex-1">
                    <div
                      class="font-medium"
                      :class="selectedSubCategoryId === subCategory.id ? 'text-primary-600 dark:text-primary-400' : 'text-muted-600 dark:text-muted-400'"
                    >
                      {{ subCategory.nameAr }}
                    </div>
                    <div class="text-xs text-muted-400">{{ subCategory.reportsCount }} تقرير</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Main Content - Reports Grid -->
      <div class="lg:col-span-3">
        <!-- Reports Count -->
        <div class="mb-4 flex items-center justify-between">
          <BaseParagraph class="text-muted-600">
            <span class="font-semibold">{{ totalCount }}</span> تقرير
            <span v-if="selectedCategory">
              في "{{ selectedCategory.nameAr }}"
              <span v-if="selectedSubCategoryId">
                / "{{ subCategories.find(sc => sc.id === selectedSubCategoryId)?.nameAr }}"
              </span>
            </span>
          </BaseParagraph>
        </div>

        <!-- Loading State -->
        <div v-if="reportsLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <BasePlaceload v-for="i in 6" :key="i" class="h-48 w-full rounded-lg" />
        </div>

        <!-- Empty State -->
        <div v-else-if="reports.length === 0" class="text-center py-16">
          <Icon name="ph:archive-box" class="h-24 w-24 mx-auto text-muted-300 mb-4" />
          <BaseHeading size="xl" weight="semibold" class="mb-2">لا توجد تقارير</BaseHeading>
          <BaseParagraph class="text-muted-400">
            لا توجد تقارير في هذا التصنيف حالياً
          </BaseParagraph>
        </div>

        <!-- Reports Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <BaseCard
            v-for="report in reports"
            :key="report.id"
            class="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div class="p-4 space-y-3">
              <!-- File Icon -->
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex-shrink-0">
                  <Icon :name="getFileIcon(report.fileName)" class="h-6 w-6 text-primary-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-muted-900 dark:text-white line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {{ report.title }}
                  </h3>
                  <p class="text-xs text-muted-500 mt-1">{{ formatDate(report.createdAt) }}</p>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-muted-600 dark:text-muted-400 line-clamp-2">
                {{ report.description }}
              </p>

              <!-- Category Badge -->
              <div v-if="!selectedCategory && report.categoryName" class="flex items-center gap-2">
                <Icon name="ph:folder" class="h-4 w-4 text-muted-400" />
                <span class="text-xs text-muted-500">{{ report.categoryName }}</span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-2 border-t border-muted-200 dark:border-muted-700">
                <BaseTag
                  :color="ReportStatusColors[report.status as any] || 'default'"
                  flavor="pastel"
                  size="sm"
                >
                  {{ ReportStatusLabels[report.status as any] || report.status }}
                </BaseTag>

                <div class="flex items-center gap-2">
                  <ViewReport :report-id="report.id" />
                  <BaseButtonIcon
                    v-if="report.fileUrl"
                    @click="downloadFile(report.fileUrl)"
                    size="sm"
                    color="success"
                  >
                    <Icon name="ph:download" class="h-4 w-4" />
                  </BaseButtonIcon>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Pagination -->
        <div v-if="pageCount > 1" class="mt-6">
          <BasePagination
            :current-page="pageNumber"
            :item-per-page="pageSize"
            :total-items="totalCount"
            @update:current-page="pageNumber = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>
