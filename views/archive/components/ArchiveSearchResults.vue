<script setup lang="ts">
import type { ArchiveSearchResult, SearchResultFile, SearchResultCompany, CompanyArchive } from '~/types/archive';
import { FolderType } from '~/types/archive';

const props = defineProps<{
  results: ArchiveSearchResult | null;
  loading: boolean;
  query: string;
}>();

const emit = defineEmits<{
  selectCompany: [company: CompanyArchive];
  viewFile: [file: SearchResultFile];
  downloadFile: [file: SearchResultFile];
  close: [];
}>();

const apiPaths = useApiPaths();

const getFileIcon = (fileType: string) => {
  switch (fileType?.toUpperCase()) {
    case 'PDF': return 'ph:file-pdf-duotone';
    case 'DOCX':
    case 'DOC': return 'ph:file-doc-duotone';
    case 'XLSX':
    case 'XLS': return 'ph:file-xls-duotone';
    case 'IMG':
    case 'PNG':
    case 'JPG':
    case 'JPEG': return 'ph:file-image-duotone';
    default: return 'ph:file-duotone';
  }
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-SA');
};

const handleSelectCompany = (company: SearchResultCompany) => {
  emit('selectCompany', {
    userId: company.userId,
    companyName: company.companyName,
    fullName: company.fullName || '',
    code: company.code || '',
    subCategoriesCount: 0,
    clientFilesCount: 0,
    managementFilesCount: 0,
    conversationsCount: 0,
    createdAt: ''
  });
};

const handleViewFile = (file: SearchResultFile) => {
  if (file.fileUrl) {
    window.open(apiPaths.getAsset(file.fileUrl), '_blank');
  }
};

const handleDownloadFile = (file: SearchResultFile) => {
  if (file.fileUrl) {
    const link = document.createElement('a');
    link.href = apiPaths.getAsset(file.fileUrl);
    link.download = file.fileName;
    link.click();
  }
};
</script>

<template>
  <div class="space-y-6" dir="rtl">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
      <p class="text-muted-500">جاري البحث...</p>
    </div>

    <!-- No Results -->
    <div v-else-if="results && results.files.length === 0 && results.companies.length === 0" class="flex flex-col items-center justify-center py-12">
      <Icon name="ph:magnifying-glass" class="w-16 h-16 text-muted-300 mb-4" />
      <p class="text-muted-500 text-lg">لا توجد نتائج للبحث "{{ query }}"</p>
      <p class="text-muted-400 text-sm mt-2">جرب كلمات بحث مختلفة</p>
    </div>

    <!-- Results -->
    <template v-else-if="results">
      <!-- Companies Section -->
      <div v-if="results.companies.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-muted-800 dark:text-muted-100 flex items-center gap-2">
            <Icon name="ph:buildings-duotone" class="w-5 h-5 text-primary-500" />
            الشركات ({{ results.totalCompaniesCount }})
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="company in results.companies"
            :key="company.userId"
            class="bg-white dark:bg-muted-800 rounded-lg border border-muted-200 dark:border-muted-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-colors"
            @click="handleSelectCompany(company)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Icon name="ph:building-office-duotone" class="w-5 h-5 text-primary-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ company.companyName }}
                </p>
                <p v-if="company.code" class="text-xs text-muted-400">
                  {{ company.code }}
                </p>
              </div>
              <Icon name="ph:arrow-left" class="w-4 h-4 text-muted-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Files Section -->
      <div v-if="results.files.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-muted-800 dark:text-muted-100 flex items-center gap-2">
            <Icon name="ph:files-duotone" class="w-5 h-5 text-amber-500" />
            الملفات ({{ results.totalFilesCount }})
          </h3>
        </div>

        <div class="bg-white dark:bg-muted-800 rounded-lg border border-muted-200 dark:border-muted-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-muted-50 dark:bg-muted-900/50">
              <tr>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase">الملف</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase">الشركة</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase">التصنيف</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase">المصدر</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase">التاريخ</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-muted-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-muted-200 dark:divide-muted-700">
              <tr
                v-for="file in results.files"
                :key="file.id"
                class="hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <Icon :name="getFileIcon(file.fileType)" class="w-8 h-8 text-amber-500" />
                    <div class="min-w-0">
                      <p class="font-medium text-muted-800 dark:text-muted-100 truncate max-w-xs">
                        {{ file.fileName }}
                      </p>
                      <p class="text-xs text-muted-400">{{ file.fileType }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-muted-600 dark:text-muted-300">{{ file.companyName }}</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="file.categoryPath" class="text-sm text-muted-500">{{ file.categoryPath }}</span>
                  <span v-else class="text-sm text-muted-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <BaseTag
                    :color="file.fileSource === 'client' ? 'info' : 'success'"
                    size="sm"
                    flavor="pastel"
                  >
                    {{ file.fileSource === 'client' ? 'العميل' : 'الإدارة' }}
                  </BaseTag>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-muted-500">{{ formatDate(file.archivedAt) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1">
                    <BaseButtonIcon
                      size="sm"
                      color="info"
                      flavor="pastel"
                      data-nui-tooltip="عرض"
                      @click="handleViewFile(file)"
                    >
                      <Icon name="ph:eye" class="w-4 h-4" />
                    </BaseButtonIcon>
                    <BaseButtonIcon
                      size="sm"
                      color="success"
                      flavor="pastel"
                      data-nui-tooltip="تحميل"
                      @click="handleDownloadFile(file)"
                    >
                      <Icon name="ph:download-simple" class="w-4 h-4" />
                    </BaseButtonIcon>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
