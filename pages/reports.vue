<script setup lang="ts">
import type { Report, ReportsResponse, Category, ReportStatus, ReportStatistics } from '~/types/reports';
import type { CategoryListItem } from '~/types/archive';
import { getReportStatusColor, getReportStatusLabel } from '~/types/reports';
import { formatDate } from '~/utils/helpers';
import AddReport from '~/views/reports/components/AddReport.vue';
import ViewReport from '~/views/reports/components/ViewReport.vue';
import DeleteReport from '~/views/reports/components/DeleteReport.vue';
import AssignCategory from '~/views/reports/components/AssignCategory.vue';

useHead({
  title: "إدارة التقارير"
})

definePageMeta({
  title: "التقارير"
})

const apiPaths = useApiPaths();
const userStore = useAppUserStore();

const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedCategoryId = ref<string | undefined>(undefined);
const selectedStatus = ref<ReportStatus | undefined>(undefined);

const categoriesFlat = ref<CategoryListItem[]>([]);
const statistics = ref<ReportStatistics | null>(null);

// Determine if user is admin
const isAdmin = computed(() => userStore.isInRole('Admin'));

// Fetch categories (flat list for dropdown)
const fetchCategories = async () => {
  try {
    const response = await $fetch<any>(apiPaths.categoryFlat);
    categoriesFlat.value = response || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Fetch statistics
const fetchStatistics = async () => {
  try {
    const response = await $fetch<any>(apiPaths.reportStatistics);
    statistics.value = response.data || response;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

// Fetch reports based on role
const { data: reportsData, refresh: refreshReports, pending: isLoading } = await useFetch<ReportsResponse>(
  computed(() => isAdmin.value ? apiPaths.allReports : apiPaths.reports),
  {
    key: 'reports-list',
    lazy: true,
    query: computed(() => ({
      search: searchQuery.value,
      categoryId: selectedCategoryId.value,
      status: selectedStatus.value,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const reports = computed<Report[]>(() => reportsData.value?.data || []);
const totalCount = computed(() => reportsData.value?.totalCount || 0);
const pageCount = computed(() => reportsData.value?.pageCount || 0);

watch([searchQuery, selectedCategoryId, selectedStatus], () => {
  pageNumber.value = 1;
});

onMounted(() => {
  fetchCategories();
  fetchStatistics();
});

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategoryId.value = undefined;
  selectedStatus.value = undefined;
};

// Format category option with indentation based on level
const formatCategoryOption = (category: CategoryListItem) => {
  const indent = '—'.repeat(category.level);
  return indent ? `${indent} ${category.name}` : category.name;
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

// Get status icon
const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'pending':
      return 'ph:clock-duotone';
    case 'under_review':
      return 'ph:eye-duotone';
    case 'approved':
      return 'ph:check-circle-duotone';
    case 'rejected':
      return 'ph:x-circle-duotone';
    default:
      return 'ph:question-duotone';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة التقارير</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">
          {{ isAdmin ? 'إدارة جميع التقارير المقدمة من المستخدمين' : 'إدارة تقاريرك الشخصية' }}
        </BaseParagraph>
      </div>
    </div>

    <BaseCard class="p-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <BaseInput
            v-model="searchQuery"
            placeholder="البحث في التقارير..."
            icon="ph:magnifying-glass-duotone"
            class="w-full max-w-xs"
          />
          <AddReport @added="refreshReports" />
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseSelect v-model="selectedCategoryId" placeholder="التصنيف">
            <option :value="undefined">جميع التصنيفات</option>
            <option v-for="category in categoriesFlat" :key="category.id" :value="category.id">
              {{ formatCategoryOption(category) }}
            </option>
          </BaseSelect>

          <BaseSelect v-model="selectedStatus" placeholder="الحالة">
            <option :value="undefined">جميع الحالات</option>
            <option :value="0">قيد الانتظار</option>
            <option :value="1">قيد المراجعة</option>
            <option :value="2">مقبول</option>
            <option :value="3">مرفوض</option>
          </BaseSelect>

          <BaseButton @click="clearFilters" color="default">
            <Icon name="ph:x" class="h-4 w-4" />
            <span>مسح الفلاتر</span>
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <BasePlaceload class="h-12 w-full rounded" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
      </div>

      <div v-else-if="reports.length === 0" class="p-12 text-center">
        <Icon name="ph:file-x" class="h-16 w-16 mx-auto text-muted-400 mb-4" />
        <BaseParagraph class="text-muted-400">لا توجد تقارير</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">العنوان</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التصنيف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الملف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="report in reports" :key="report.id" class="hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors">
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <div class="text-sm font-medium text-muted-900 dark:text-white truncate">{{ report.title }}</div>
                  <div class="text-xs text-muted-500 truncate">{{ report.description }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">
                  <template v-if="report.categoryPath">
                    {{ report.categoryPath }}
                  </template>
                  <template v-else-if="report.categoryName">
                    {{ report.categoryName }}
                  </template>
                  <template v-else>-</template>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="report.fileName" class="flex items-center gap-2">
                  <Icon :name="getFileIcon(report.fileName)" class="h-5 w-5 text-primary-500" />
                  <div class="text-sm text-muted-600 dark:text-muted-300 max-w-[150px] truncate">
                    {{ report.fileName }}
                  </div>
                </div>
                <span v-else class="text-sm text-muted-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseTag
                  :color="getReportStatusColor(report.status)"
                  flavor="pastel"
                  size="sm"
                >
                  {{ getReportStatusLabel(report.status) }}
                </BaseTag>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ formatDate(report.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <ViewReport :report-id="report.id" />
                  <AssignCategory :report="report" @assigned="refreshReports" />
                  <DeleteReport
                    :report-id="report.id"
                    :report-title="report.title"
                    @deleted="refreshReports"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pageCount > 1" class="p-6 border-t border-muted-200 dark:border-muted-700">
        <BasePagination
          :current-page="pageNumber"
          :item-per-page="pageSize"
          :total-items="totalCount"
          @update:current-page="pageNumber = $event"
        />
      </div>
    </BaseCard>
  </div>
</template>
