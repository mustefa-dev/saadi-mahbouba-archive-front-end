<script setup lang="ts">
import type { Report, ReportsGroupedByCompany, ReportStatus } from '~/types/reports';
import type { User } from '~/types/users';
import { getReportStatusColor, getReportStatusLabel } from '~/types/reports';
import { formatDate } from '~/utils/helpers';
import ArchiveReport from '~/views/reports/components/ArchiveReport.vue';
import ChangeStatus from '~/views/reports/components/ChangeStatus.vue';

useHead({
  title: "التقارير حسب الشركات"
});

definePageMeta({
  title: "التقارير حسب الشركات"
});

const apiPaths = useApiPaths();
const helpers = useHelpers();
const userStore = useAppUserStore();

const searchQuery = ref('');
const selectedStatus = ref<ReportStatus | undefined>(undefined);
const expandedCompanies = ref<Set<string>>(new Set());

// For Add Report modal
const showAddReportModal = ref(false);
const allCompanies = ref<User[]>([]);
const loadingCompanies = ref(false);
const isSubmitting = ref(false);

const reportForm = reactive({
  title: '',
  description: '',
  categoryId: undefined as string | undefined,
  file: null as File | null
});
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');

// Fetch all companies for dropdown
const fetchCompanies = async () => {
  loadingCompanies.value = true;
  try {
    const response = await $fetch<any>(apiPaths.users);
    allCompanies.value = response.data || response || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
  } finally {
    loadingCompanies.value = false;
  }
};

// Selected company object
const selectedCompany = ref<User | null>(null);
const companySearchQuery = ref('');
const showCompanyDropdown = ref(false);

// Get selected company name
const selectedCompanyName = computed(() => {
  return selectedCompany.value?.companyName || selectedCompany.value?.fullName || '';
});

// Filter companies based on search
const filteredCompanies = computed(() => {
  if (!companySearchQuery.value) return allCompanies.value;
  const q = companySearchQuery.value.toLowerCase();
  return allCompanies.value.filter(company =>
    company.companyName?.toLowerCase().includes(q) ||
    company.fullName?.toLowerCase().includes(q) ||
    company.code?.toLowerCase().includes(q)
  );
});

const selectCompany = (company: User) => {
  selectedCompany.value = company;
  showCompanyDropdown.value = false;
  companySearchQuery.value = '';
};

const clearSelectedCompany = () => {
  selectedCompany.value = null;
  companySearchQuery.value = '';
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    reportForm.file = target.files[0];
    selectedFileName.value = target.files[0].name;
  }
};

const resetReportForm = () => {
  reportForm.title = '';
  reportForm.description = '';
  reportForm.categoryId = undefined;
  reportForm.file = null;
  selectedFileName.value = '';
  selectedCompany.value = null;
  companySearchQuery.value = '';
  showCompanyDropdown.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const openAddReportModal = () => {
  resetReportForm();
  fetchCompanies();
  showAddReportModal.value = true;
};

const submitReport = async () => {
  console.log('submitReport called', {
    selectedCompany: selectedCompany.value,
    title: reportForm.title,
    file: reportForm.file
  });

  if (!selectedCompany.value) {
    helpers.setErrorMessage(null, 'ar', 'Please select a company', 'يرجى اختيار الشركة');
    return;
  }
  if (!reportForm.title.trim()) {
    helpers.setErrorMessage(null, 'ar', 'Please enter report title', 'يرجى إدخال عنوان التقرير');
    return;
  }
  if (!reportForm.file) {
    helpers.setErrorMessage(null, 'ar', 'Please select a file', 'يرجى اختيار ملف');
    return;
  }

  isSubmitting.value = true;
  try {
    // Send FormData with File directly
    const formData = new FormData();
    formData.append('UserId', selectedCompany.value.id);
    formData.append('Title', reportForm.title);
    formData.append('File', reportForm.file);
    formData.append('AutoApprove', 'false'); // Don't auto-archive, start as Pending
    if (reportForm.description) {
      formData.append('Description', reportForm.description);
    }
    if (reportForm.categoryId) {
      formData.append('CategoryId', reportForm.categoryId);
    }

    const token = userStore.getToken();
    console.log('Token available:', !!token);
    console.log('Token prefix:', token?.substring(0, 30));
    console.log('Current user:', userStore.user);
    console.log('FormData UserId:', selectedCompany.value.id);
    console.log('Endpoint:', apiPaths.archiveSendFile);

    if (!token) {
      helpers.setErrorMessage(null, 'ar', 'Not authenticated', 'يرجى تسجيل الدخول');
      return;
    }

    await $fetch(apiPaths.archiveSendFile, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    helpers.setSuccessMessage('ar', 'Report added successfully', 'تم إضافة التقرير بنجاح');
    showAddReportModal.value = false;
    resetReportForm();
    refreshReports();
  } catch (error: any) {
    console.error('Error submitting report:', error);
    console.error('Error data:', error.data);
    console.error('Error response:', error.response);
    helpers.setErrorMessage(error, 'ar', 'Failed to add report', 'فشل إضافة التقرير');
  } finally {
    isSubmitting.value = false;
  }
};

// Fetch grouped reports
const { data: groupedData, refresh: refreshReports, pending: isLoading, error: fetchError } = useLazyFetch<ReportsGroupedByCompany[]>(
  apiPaths.reportsGrouped,
  {
    key: 'reports-grouped',
    query: computed(() => ({
      search: searchQuery.value,
      status: selectedStatus.value,
    })),
    transform: (response: any) => response.data || response || [],
    default: () => [],
    onResponseError({ response }) {
      console.error('Error fetching grouped reports:', response.status, response._data);
    }
  }
);

const groupedReports = computed<ReportsGroupedByCompany[]>(() => groupedData.value || []);

// Filter groups by search query
const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupedReports.value;

  const query = searchQuery.value.toLowerCase();
  return groupedReports.value.filter(group =>
    group.companyName?.toLowerCase().includes(query) ||
    group.fullName?.toLowerCase().includes(query) ||
    group.code?.toLowerCase().includes(query)
  );
});

const toggleCompany = (userId: string) => {
  if (expandedCompanies.value.has(userId)) {
    expandedCompanies.value.delete(userId);
  } else {
    expandedCompanies.value.add(userId);
  }
};

const isExpanded = (userId: string) => expandedCompanies.value.has(userId);

const expandAll = () => {
  groupedReports.value.forEach(group => {
    expandedCompanies.value.add(group.userId);
  });
};

const collapseAll = () => {
  expandedCompanies.value.clear();
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

const clearFilters = () => {
  searchQuery.value = '';
  selectedStatus.value = undefined;
};

// Check if report can be archived (under review status)
const canArchive = (report: Report) => {
  const status = report.status?.toLowerCase();
  return status === 'under_review' || status === 'pending';
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">التقارير حسب الشركات</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">
          عرض جميع التقارير مجمّعة حسب اسم الشركة
        </BaseParagraph>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton color="primary" @click="openAddReportModal">
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>إضافة تقرير</span>
        </BaseButton>
        <BaseButton size="sm" color="default" @click="expandAll">
          <Icon name="ph:arrows-out-simple" class="h-4 w-4" />
          <span>توسيع الكل</span>
        </BaseButton>
        <BaseButton size="sm" color="default" @click="collapseAll">
          <Icon name="ph:arrows-in-simple" class="h-4 w-4" />
          <span>طي الكل</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <BaseCard class="p-6">
      <div class="flex flex-wrap items-center gap-4">
        <BaseInput
          v-model="searchQuery"
          placeholder="البحث بالشركة أو الاسم..."
          icon="ph:magnifying-glass-duotone"
          class="w-full max-w-xs"
        />

        <BaseSelect v-model="selectedStatus" class="w-48">
          <option :value="undefined">جميع الحالات</option>
          <option :value="0">قيد الانتظار</option>
          <option :value="1">قيد المراجعة</option>
          <option :value="2">مقبول</option>
          <option :value="3">مرفوض</option>
        </BaseSelect>

        <BaseButton color="default" @click="clearFilters">
          <Icon name="ph:x" class="h-4 w-4" />
          <span>مسح الفلاتر</span>
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <BaseCard v-for="i in 3" :key="i" class="p-4">
        <BasePlaceload class="h-16 w-full rounded" />
      </BaseCard>
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="fetchError" class="p-12 text-center">
      <Icon name="ph:warning-circle" class="h-16 w-16 mx-auto text-danger-500 mb-4" />
      <BaseHeading size="lg" weight="semibold" class="mb-2">حدث خطأ</BaseHeading>
      <BaseParagraph class="text-muted-400 mb-4">
        حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
      </BaseParagraph>
      <BaseButton color="primary" @click="refreshReports">
        <Icon name="ph:arrow-clockwise" class="h-4 w-4" />
        <span>إعادة المحاولة</span>
      </BaseButton>
    </BaseCard>

    <!-- Empty State -->
    <BaseCard v-else-if="filteredGroups.length === 0" class="p-12 text-center">
      <Icon name="ph:buildings" class="h-16 w-16 mx-auto text-muted-400 mb-4" />
      <BaseParagraph class="text-muted-400">لا توجد تقارير</BaseParagraph>
    </BaseCard>

    <!-- Grouped Reports -->
    <div v-else class="space-y-4">
      <BaseCard
        v-for="group in filteredGroups"
        :key="group.userId"
        class="overflow-hidden"
      >
        <!-- Company Header -->
        <div
          class="flex items-center justify-between p-4 cursor-pointer hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
          @click="toggleCompany(group.userId)"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20">
              <Icon name="ph:buildings-duotone" class="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <BaseHeading size="md" weight="semibold">{{ group.companyName || 'غير محدد' }}</BaseHeading>
              <div class="flex items-center gap-2 text-sm text-muted-400">
                <span>{{ group.fullName }}</span>
                <span v-if="group.code" class="text-xs bg-muted-100 dark:bg-muted-800 px-2 py-0.5 rounded">
                  {{ group.code }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Status Summary -->
            <div class="hidden md:flex items-center gap-2">
              <BaseTag v-if="group.pendingCount > 0" color="warning" flavor="pastel" size="sm">
                {{ group.pendingCount }} قيد الانتظار
              </BaseTag>
              <BaseTag v-if="group.underReviewCount > 0" color="info" flavor="pastel" size="sm">
                {{ group.underReviewCount }} قيد المراجعة
              </BaseTag>
              <BaseTag v-if="group.archivedCount > 0" color="success" flavor="pastel" size="sm">
                {{ group.archivedCount }} مؤرشف
              </BaseTag>
              <BaseTag v-if="group.rejectedCount > 0" color="danger" flavor="pastel" size="sm">
                {{ group.rejectedCount }} مرفوض
              </BaseTag>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-muted-600 dark:text-muted-300">
                {{ group.totalReports }} تقرير
              </span>
              <Icon
                :name="isExpanded(group.userId) ? 'ph:caret-up' : 'ph:caret-down'"
                class="h-5 w-5 text-muted-400 transition-transform"
              />
            </div>
          </div>
        </div>

        <!-- Reports Table (Expandable) -->
        <div
          v-show="isExpanded(group.userId)"
          class="border-t border-muted-200 dark:border-muted-700"
        >
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted-50 dark:bg-muted-900/50">
                <tr>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">العنوان</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التصنيف</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الملف</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التاريخ</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
                <tr
                  v-for="report in group.reports"
                  :key="report.id"
                  class="hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="max-w-xs">
                      <div class="text-sm font-medium text-muted-900 dark:text-white truncate">{{ report.title }}</div>
                      <div class="text-xs text-muted-500 truncate">{{ report.description }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-muted-600 dark:text-muted-300">
                      {{ report.categoryPath || report.categoryName || '-' }}
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
                      <ChangeStatus :report="report" @status-changed="refreshReports" />
                      <ArchiveReport
                        v-if="canArchive(report)"
                        :report="report"
                        @archived="refreshReports"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Add Report Modal -->
    <TairoModal :open="showAddReportModal" size="lg" @close="showAddReportModal = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <div>
            <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
              إضافة تقرير جديد
            </h3>
            <p v-if="selectedCompanyName" class="text-sm text-muted-400 mt-1">
              للشركة: {{ selectedCompanyName }}
            </p>
          </div>
          <BaseButtonClose @click="showAddReportModal = false" />
        </div>
      </template>

      <div class="p-4 md:p-6 space-y-4" dir="rtl">
        <!-- Company Selection with Search Dropdown -->
        <div class="relative">
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            الشركة <span class="text-danger-500">*</span>
          </label>

          <!-- Selected Company Display / Dropdown Trigger -->
          <div
            class="relative w-full cursor-pointer"
            @click="showCompanyDropdown = !showCompanyDropdown"
          >
            <div
              class="flex items-center justify-between w-full px-4 py-3 border rounded-lg transition-colors"
              :class="[
                showCompanyDropdown
                  ? 'border-primary-500 ring-1 ring-primary-500'
                  : 'border-muted-300 dark:border-muted-700 hover:border-muted-400',
                'bg-white dark:bg-muted-800'
              ]"
            >
              <div class="flex items-center gap-3">
                <Icon name="ph:buildings" class="h-5 w-5 text-muted-400" />
                <span v-if="selectedCompany" class="text-muted-800 dark:text-muted-100">
                  {{ selectedCompany.companyName || selectedCompany.fullName }}
                  <span v-if="selectedCompany.code" class="text-muted-400 text-sm">({{ selectedCompany.code }})</span>
                </span>
                <span v-else class="text-muted-400">اختر الشركة...</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="selectedCompany"
                  type="button"
                  class="p-1 hover:bg-muted-100 dark:hover:bg-muted-700 rounded"
                  @click.stop="clearSelectedCompany"
                >
                  <Icon name="ph:x" class="h-4 w-4 text-muted-400" />
                </button>
                <Icon
                  :name="showCompanyDropdown ? 'ph:caret-up' : 'ph:caret-down'"
                  class="h-4 w-4 text-muted-400"
                />
              </div>
            </div>
          </div>

          <!-- Dropdown -->
          <div
            v-if="showCompanyDropdown"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-lg shadow-lg overflow-hidden"
          >
            <!-- Search Input -->
            <div class="p-3 border-b border-muted-200 dark:border-muted-700">
              <div class="relative">
                <Icon name="ph:magnifying-glass" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-400" />
                <input
                  v-model="companySearchQuery"
                  type="text"
                  placeholder="ابحث بالاسم أو الكود..."
                  class="w-full pr-10 pl-4 py-2 text-sm border border-muted-200 dark:border-muted-600 rounded-lg bg-muted-50 dark:bg-muted-900 text-muted-800 dark:text-muted-100 placeholder-muted-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  @click.stop
                />
              </div>
            </div>

            <!-- Companies List -->
            <div class="max-h-60 overflow-y-auto">
              <div v-if="loadingCompanies" class="p-4 text-center">
                <Icon name="ph:spinner" class="h-6 w-6 text-primary-500 animate-spin mx-auto" />
                <p class="text-sm text-muted-400 mt-2">جاري التحميل...</p>
              </div>
              <div v-else-if="filteredCompanies.length === 0" class="p-4 text-center">
                <Icon name="ph:magnifying-glass" class="h-8 w-8 text-muted-300 mx-auto" />
                <p class="text-sm text-muted-400 mt-2">لا توجد نتائج</p>
              </div>
              <div
                v-else
                v-for="company in filteredCompanies"
                :key="company.id"
                class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted-50 dark:hover:bg-muted-700/50 transition-colors"
                :class="selectedCompany?.id === company.id ? 'bg-primary-50 dark:bg-primary-500/10' : ''"
                @click="selectCompany(company)"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex-shrink-0">
                  <Icon name="ph:buildings" class="h-5 w-5 text-primary-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-muted-800 dark:text-muted-100 truncate">
                    {{ company.companyName || company.fullName }}
                  </div>
                  <div class="text-xs text-muted-400">
                    {{ company.code || 'بدون كود' }} • {{ company.phoneNumber || 'بدون هاتف' }}
                  </div>
                </div>
                <Icon
                  v-if="selectedCompany?.id === company.id"
                  name="ph:check"
                  class="h-5 w-5 text-primary-500 flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <!-- Backdrop to close dropdown -->
          <div
            v-if="showCompanyDropdown"
            class="fixed inset-0 z-40"
            @click="showCompanyDropdown = false"
          />
        </div>

        <BaseInput
          v-model="reportForm.title"
          label="عنوان التقرير *"
          placeholder="أدخل عنوان التقرير"
          :disabled="isSubmitting"
          required
        />

        <BaseTextarea
          v-model="reportForm.description"
          label="وصف التقرير"
          placeholder="أدخل وصف التقرير (اختياري)"
          :disabled="isSubmitting"
          rows="3"
        />

        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            التصنيف
          </label>
          <CategorySelector
            v-model="reportForm.categoryId"
            placeholder="اختر التصنيف..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            الملف <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              @change="handleFileChange"
              class="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              :disabled="isSubmitting"
            />
            <BaseButton
              @click="fileInput?.click()"
              :color="reportForm.file ? 'success' : 'default'"
              class="w-full"
              type="button"
              :disabled="isSubmitting"
            >
              <Icon v-if="reportForm.file" name="ph:check-circle" class="h-4 w-4" />
              <Icon v-else name="ph:paperclip" class="h-4 w-4" />
              <span>{{ selectedFileName || 'اختر ملف' }}</span>
            </BaseButton>
          </div>
          <p class="text-xs text-muted-400 mt-1">
            الملفات المدعومة: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
        </div>

        <div class="flex gap-x-2 justify-end pt-4">
          <BaseButton
            type="button"
            color="default"
            @click="showAddReportModal = false"
            :disabled="isSubmitting"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            color="primary"
            :loading="isSubmitting"
            @click="submitReport"
          >
            <Icon name="ph:plus" class="size-4 me-1" />
            إضافة
          </BaseButton>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
