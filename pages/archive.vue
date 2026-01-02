<script setup lang="ts">
import type { CompanyArchive, CompanyFolders, CompanyDetails, ArchiveFile, ConversationMessage, ArchiveFileFilter, ArchiveSearchResult } from '~/types/archive'
import { FolderType, FOLDER_CONFIG } from '~/types/archive'
import CompaniesList from '~/views/archive/components/CompaniesList.vue'
import FoldersGrid from '~/views/archive/components/FoldersGrid.vue'
import FilesTable from '~/views/archive/components/FilesTable.vue'
import ConversationsView from '~/views/archive/components/ConversationsView.vue'
import CompanyInfoView from '~/views/archive/components/CompanyInfoView.vue'
import ArchiveSidebar from '~/views/archive/components/ArchiveSidebar.vue'
import SendFileModal from '~/views/archive/components/SendFileModal.vue'
import EditCompanyModal from '~/views/archive/components/EditCompanyModal.vue'
import ArchiveSearchResults from '~/views/archive/components/ArchiveSearchResults.vue'

useHead({
  title: "الأرشيف"
})

definePageMeta({
  title: "الأرشيف"
})

const apiPaths = useApiPaths()

// Send file modal state
const showSendFileModal = ref(false)

// Edit company modal state
const showEditCompanyModal = ref(false)

// Search state
const searchQuery = ref('')
const searchResults = ref<ArchiveSearchResult | null>(null)
const isSearching = ref(false)
const showSearchResults = ref(false)

// Navigation state
const currentLevel = ref<'companies' | 'folders' | 'content'>('companies')
const selectedCompany = ref<CompanyArchive | null>(null)
const selectedFolder = ref<FolderType | null>(null)

// View mode
const viewMode = ref<'grid' | 'cards' | 'list'>('grid')

// Data state
const companies = ref<CompanyArchive[]>([])
const folders = ref<CompanyFolders | null>(null)
const files = ref<ArchiveFile[]>([])
const conversations = ref<ConversationMessage[]>([])
const companyDetails = ref<CompanyDetails | null>(null)

// Loading states
const loadingCompanies = ref(false)
const loadingFolders = ref(false)
const loadingContent = ref(false)

// Pagination
const pageNumber = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// Filter state
const fileFilter = ref<ArchiveFileFilter>({
  sortOrder: 'desc'
})

// Normalize company data to handle both PascalCase and camelCase from API
const normalizeCompany = (company: any): CompanyArchive => ({
  userId: company.userId || company.UserId || '',
  companyName: company.companyName || company.CompanyName || '',
  fullName: company.fullName || company.FullName || '',
  code: company.code || company.Code || '',
  subCategoriesCount: company.subCategoriesCount ?? company.SubCategoriesCount ?? 0,
  clientFilesCount: company.clientFilesCount ?? company.ClientFilesCount ?? 0,
  managementFilesCount: company.managementFilesCount ?? company.ManagementFilesCount ?? 0,
  conversationsCount: company.conversationsCount ?? company.ConversationsCount ?? 0,
  createdAt: company.createdAt || company.CreatedAt || ''
})

// Fetch companies
const fetchCompanies = async () => {
  loadingCompanies.value = true
  try {
    const response = await $fetch<any>(apiPaths.archiveCompanies, {
      query: { pageNumber: pageNumber.value, pageSize: pageSize.value }
    })
    const rawCompanies = response.Data || response.data || []
    companies.value = rawCompanies.map(normalizeCompany)
    totalCount.value = response.TotalCount || response.totalCount || 0
  } catch (error) {
    console.error('Error fetching companies:', error)
  } finally {
    loadingCompanies.value = false
  }
}

// Normalize folders data
const normalizeFolders = (data: any): CompanyFolders => ({
  clientFilesCount: data.clientFilesCount ?? data.ClientFilesCount ?? 0,
  managementFilesCount: data.managementFilesCount ?? data.ManagementFilesCount ?? 0,
  conversationsCount: data.conversationsCount ?? data.ConversationsCount ?? 0
})

// Fetch folders for a company
const fetchFolders = async (userId: string) => {
  loadingFolders.value = true
  try {
    const response = await $fetch<any>(apiPaths.archiveCompanyFolders(userId))
    folders.value = normalizeFolders(response)
  } catch (error) {
    console.error('Error fetching folders:', error)
  } finally {
    loadingFolders.value = false
  }
}

// Normalize file data
const normalizeFile = (file: any): ArchiveFile => ({
  id: file.id || file.Id || '',
  fileName: file.fileName || file.FileName || '',
  fileType: file.fileType || file.FileType || '',
  categoryName: file.categoryName || file.CategoryName || '',
  categoryPath: file.categoryPath || file.CategoryPath || '',
  archivedAt: file.archivedAt || file.ArchivedAt || '',
  senderName: file.senderName || file.SenderName || '',
  fileUrl: file.fileUrl || file.FileUrl || ''
})

// Fetch files (client or management)
const fetchFiles = async (userId: string, folderType: FolderType, filter: ArchiveFileFilter = {}) => {
  loadingContent.value = true
  try {
    const endpoint = folderType === FolderType.ClientFiles
      ? apiPaths.archiveClientFiles(userId)
      : apiPaths.archiveManagementFiles(userId)

    const response = await $fetch<any>(endpoint, {
      query: {
        ...filter,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value
      }
    })
    const rawFiles = response.Data || response.data || []
    files.value = rawFiles.map(normalizeFile)
    totalCount.value = response.TotalCount || response.totalCount || 0
  } catch (error) {
    console.error('Error fetching files:', error)
  } finally {
    loadingContent.value = false
  }
}

// Fetch conversations
const fetchConversations = async (userId: string) => {
  loadingContent.value = true
  try {
    const response = await $fetch<any>(
      apiPaths.archiveCompanyConversations(userId),
      { query: { pageNumber: 0, pageSize: 100 } }
    )
    conversations.value = response.Data || response.data || []
  } catch (error) {
    console.error('Error fetching conversations:', error)
  } finally {
    loadingContent.value = false
  }
}

// Normalize company details
const normalizeCompanyDetails = (data: any): CompanyDetails => ({
  managerName: data.managerName || data.ManagerName || '',
  email: data.email || data.Email || '',
  phoneNumber: data.phoneNumber || data.PhoneNumber || '',
  address: data.address || data.Address || '',
  lawyerName: data.lawyerName || data.LawyerName || '',
  accountantName: data.accountantName || data.AccountantName || '',
  registrationDate: data.registrationDate || data.RegistrationDate || ''
})

// Fetch company info
const fetchCompanyInfo = async (userId: string) => {
  loadingContent.value = true
  try {
    const response = await $fetch<any>(apiPaths.archiveCompanyInfo(userId))
    companyDetails.value = normalizeCompanyDetails(response)
  } catch (error) {
    console.error('Error fetching company info:', error)
  } finally {
    loadingContent.value = false
  }
}

// Navigation handlers
const navigateToRoot = () => {
  currentLevel.value = 'companies'
  selectedCompany.value = null
  selectedFolder.value = null
  pageNumber.value = 1
  fetchCompanies()
}

const navigateToCompany = (company: CompanyArchive) => {
  currentLevel.value = 'folders'
  selectedCompany.value = company
  selectedFolder.value = null
  fetchFolders(company.userId)
}

const navigateToFolder = (folder: FolderType) => {
  if (!selectedCompany.value) return

  currentLevel.value = 'content'
  selectedFolder.value = folder
  pageNumber.value = 1

  switch (folder) {
    case FolderType.ClientFiles:
    case FolderType.ManagementFiles:
      fetchFiles(selectedCompany.value.userId, folder, fileFilter.value)
      break
    case FolderType.Conversations:
      fetchConversations(selectedCompany.value.userId)
      break
    case FolderType.CompanyInfo:
      fetchCompanyInfo(selectedCompany.value.userId)
      break
  }
}

// Handle filter changes
const handleFilterChange = (filter: ArchiveFileFilter) => {
  fileFilter.value = filter
  if (selectedCompany.value && selectedFolder.value) {
    if (selectedFolder.value === FolderType.ClientFiles || selectedFolder.value === FolderType.ManagementFiles) {
      fetchFiles(selectedCompany.value.userId, selectedFolder.value, filter)
    }
  }
}

// Handle file actions
const handleViewFile = (file: ArchiveFile) => {
  if (file.fileUrl) {
    window.open(apiPaths.getAsset(file.fileUrl), '_blank')
  }
}

const handleDownloadFile = (file: ArchiveFile) => {
  if (file.fileUrl) {
    const link = document.createElement('a')
    link.href = apiPaths.getAsset(file.fileUrl)
    link.download = file.fileName
    link.click()
  }
}

// Sidebar handlers
const handleSidebarSelectRoot = () => {
  navigateToRoot()
}

const handleSidebarSelectCompany = (company: CompanyArchive) => {
  navigateToCompany(company)
}

const handleSidebarSelectFolder = (company: CompanyArchive, folder: FolderType) => {
  if (selectedCompany.value?.userId !== company.userId) {
    selectedCompany.value = company
  }
  navigateToFolder(folder)
}

// Breadcrumb
const breadcrumbs = computed(() => {
  const items = [{ label: 'الأرشيف', level: 'companies' as const, onClick: navigateToRoot }]

  if (selectedCompany.value) {
    items.push({
      label: selectedCompany.value.companyName || selectedCompany.value.fullName,
      level: 'folders' as const,
      onClick: () => navigateToCompany(selectedCompany.value!)
    })
  }

  if (selectedFolder.value) {
    items.push({
      label: FOLDER_CONFIG[selectedFolder.value].name,
      level: 'content' as const,
      onClick: () => {}
    })
  }

  return items
})

// Content title
const contentTitle = computed(() => {
  if (showSearchResults.value) {
    return `نتائج البحث: "${searchQuery.value}"`
  }
  if (selectedFolder.value) {
    return FOLDER_CONFIG[selectedFolder.value].name
  }
  if (selectedCompany.value) {
    return selectedCompany.value.companyName || selectedCompany.value.fullName
  }
  return 'الأرشيف'
})

// Go back
const goBack = () => {
  if (currentLevel.value === 'content') {
    currentLevel.value = 'folders'
    selectedFolder.value = null
  } else if (currentLevel.value === 'folders') {
    navigateToRoot()
  }
}

// Refresh
const refresh = () => {
  if (currentLevel.value === 'companies') {
    fetchCompanies()
  } else if (currentLevel.value === 'folders' && selectedCompany.value) {
    fetchFolders(selectedCompany.value.userId)
  } else if (currentLevel.value === 'content' && selectedCompany.value && selectedFolder.value) {
    navigateToFolder(selectedFolder.value)
  }
}

// Handle send file success
const handleSendFileSuccess = () => {
  // Refresh folders to update counts
  if (selectedCompany.value) {
    fetchFolders(selectedCompany.value.userId)
  }
  // If currently viewing management files, refresh the list
  if (selectedFolder.value === FolderType.ManagementFiles && selectedCompany.value) {
    fetchFiles(selectedCompany.value.userId, FolderType.ManagementFiles, fileFilter.value)
  }
}

// Handle edit company
const handleEditCompany = () => {
  showEditCompanyModal.value = true
}

// Handle edit company success
const handleEditCompanySuccess = () => {
  // Refresh company info
  if (selectedCompany.value) {
    fetchCompanyInfo(selectedCompany.value.userId)
  }
}

// Search functions
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    clearSearch()
    return
  }

  isSearching.value = true
  showSearchResults.value = true
  try {
    const response = await $fetch<ArchiveSearchResult>(apiPaths.archiveSearch, {
      query: { query: searchQuery.value, pageNumber: 1, pageSize: 20 }
    })
    searchResults.value = response
  } catch (error) {
    console.error('Error searching:', error)
    searchResults.value = null
  } finally {
    isSearching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = null
  showSearchResults.value = false
}

const handleSearchSelectCompany = (company: CompanyArchive) => {
  clearSearch()
  navigateToCompany(company)
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    clearSearch()
    return
  }
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

// Initial load
onMounted(() => {
  fetchCompanies()
})
</script>

<template>
  <div class="h-[calc(100vh-120px)] flex flex-col" dir="rtl">
    <!-- Toolbar -->
    <div class="bg-white dark:bg-muted-900 border-b border-muted-200 dark:border-muted-700 px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Navigation Buttons -->
        <div class="flex items-center gap-2">
          <BaseButtonIcon
            size="sm"
            rounded="lg"
            :disabled="currentLevel === 'companies'"
            data-nui-tooltip="رجوع"
            @click="goBack"
          >
            <Icon name="ph:arrow-right" class="w-4 h-4" />
          </BaseButtonIcon>
          <BaseButtonIcon
            size="sm"
            rounded="lg"
            data-nui-tooltip="الرئيسية"
            @click="navigateToRoot"
          >
            <Icon name="ph:house" class="w-4 h-4" />
          </BaseButtonIcon>
          <BaseButtonIcon
            size="sm"
            rounded="lg"
            data-nui-tooltip="تحديث"
            :class="{ 'animate-spin': loadingCompanies || loadingFolders || loadingContent }"
            @click="refresh"
          >
            <Icon name="ph:arrows-clockwise" class="w-4 h-4" />
          </BaseButtonIcon>

          <!-- Send File Button (only when company is selected) -->
          <BaseButton
            v-if="selectedCompany"
            size="sm"
            color="primary"
            rounded="lg"
            @click="showSendFileModal = true"
          >
            <Icon name="ph:file-arrow-up" class="w-4 h-4 ml-2" />
            إرسال ملف
          </BaseButton>
        </div>

        <!-- Search Input -->
        <div class="relative w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث في الأرشيف..."
            class="w-full px-4 py-2 pr-10 bg-muted-100 dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-lg text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-colors"
            @input="onSearchInput"
            @keyup.enter="performSearch"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon v-if="isSearching" name="ph:spinner" class="w-4 h-4 text-muted-400 animate-spin" />
            <Icon v-else-if="searchQuery" name="ph:x" class="w-4 h-4 text-muted-400 cursor-pointer hover:text-muted-600" @click="clearSearch" />
            <Icon v-else name="ph:magnifying-glass" class="w-4 h-4 text-muted-400" />
          </div>
        </div>

        <!-- Breadcrumb -->
        <div class="flex-1 flex items-center bg-muted-100 dark:bg-muted-800 rounded-lg px-4 py-2 border border-muted-200 dark:border-muted-700">
          <Icon name="ph:folder-open-duotone" class="w-5 h-5 text-amber-500 ml-3" />
          <div class="flex items-center gap-2 text-sm overflow-x-auto">
            <template v-for="(item, index) in breadcrumbs" :key="index">
              <button
                class="hover:text-primary-500 transition-colors whitespace-nowrap"
                :class="index === breadcrumbs.length - 1 ? 'font-semibold text-muted-900 dark:text-white' : 'text-muted-500'"
                @click="item.onClick"
              >
                {{ item.label }}
              </button>
              <Icon v-if="index < breadcrumbs.length - 1" name="ph:caret-left" class="w-3 h-3 text-muted-400" />
            </template>
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="flex items-center bg-muted-100 dark:bg-muted-800 rounded-lg p-1 border border-muted-200 dark:border-muted-700">
          <button
            class="p-2 rounded-md transition-colors"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400 hover:text-muted-600'"
            data-nui-tooltip="عرض شبكي"
            @click="viewMode = 'grid'"
          >
            <Icon name="ph:squares-four" class="w-4 h-4" />
          </button>
          <button
            class="p-2 rounded-md transition-colors"
            :class="viewMode === 'cards' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400 hover:text-muted-600'"
            data-nui-tooltip="عرض بطاقات"
            @click="viewMode = 'cards'"
          >
            <Icon name="ph:grid-four" class="w-4 h-4" />
          </button>
          <button
            class="p-2 rounded-md transition-colors"
            :class="viewMode === 'list' ? 'bg-white dark:bg-muted-700 shadow-sm text-primary-500' : 'text-muted-400 hover:text-muted-600'"
            data-nui-tooltip="عرض قائمة"
            @click="viewMode = 'list'"
          >
            <Icon name="ph:list" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="w-72 border-l border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 overflow-hidden">
        <ArchiveSidebar
          :companies="companies"
          :selected-company-id="selectedCompany?.userId"
          :selected-folder="selectedFolder"
          :loading="loadingCompanies"
          @select-root="handleSidebarSelectRoot"
          @select-company="handleSidebarSelectCompany"
          @select-folder="handleSidebarSelectFolder"
        />
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex flex-col bg-muted-50 dark:bg-muted-950 overflow-hidden">
        <!-- Title Bar -->
        <div class="px-6 py-3 border-b border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900">
          <h1 class="text-lg font-semibold text-muted-800 dark:text-muted-100">{{ contentTitle }}</h1>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Search Results -->
          <ArchiveSearchResults
            v-if="showSearchResults"
            :results="searchResults"
            :loading="isSearching"
            :query="searchQuery"
            @select-company="handleSearchSelectCompany"
            @close="clearSearch"
          />

          <!-- Companies List -->
          <CompaniesList
            v-else-if="currentLevel === 'companies'"
            :companies="companies"
            :loading="loadingCompanies"
            @select="navigateToCompany"
          />

          <!-- Folders Grid -->
          <FoldersGrid
            v-else-if="currentLevel === 'folders'"
            :folders="folders"
            :loading="loadingFolders"
            @select="navigateToFolder"
          />

          <!-- Content Views -->
          <template v-else-if="currentLevel === 'content'">
            <!-- Files Table -->
            <FilesTable
              v-if="selectedFolder === FolderType.ClientFiles || selectedFolder === FolderType.ManagementFiles"
              :files="files"
              :loading="loadingContent"
              :total-count="totalCount"
              :folder-title="selectedFolder ? FOLDER_CONFIG[selectedFolder].name : ''"
              @filter="handleFilterChange"
              @view="handleViewFile"
              @download="handleDownloadFile"
            />

            <!-- Conversations -->
            <ConversationsView
              v-else-if="selectedFolder === FolderType.Conversations"
              :messages="conversations"
              :loading="loadingContent"
            />

            <!-- Company Info -->
            <CompanyInfoView
              v-else-if="selectedFolder === FolderType.CompanyInfo"
              :details="companyDetails"
              :loading="loadingContent"
              @edit="handleEditCompany"
            />
          </template>
        </div>

        <!-- Pagination (for companies and files) -->
        <div
          v-if="(currentLevel === 'companies' || (currentLevel === 'content' && (selectedFolder === FolderType.ClientFiles || selectedFolder === FolderType.ManagementFiles))) && totalCount > pageSize"
          class="px-6 py-3 border-t border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900"
        >
          <BasePagination
            :current-page="pageNumber"
            :item-per-page="pageSize"
            :total-items="totalCount"
            @update:current-page="pageNumber = $event"
          />
        </div>
      </div>
    </div>

    <!-- Send File Modal -->
    <SendFileModal
      :open="showSendFileModal"
      :company="selectedCompany"
      @close="showSendFileModal = false"
      @success="handleSendFileSuccess"
    />

    <!-- Edit Company Modal -->
    <EditCompanyModal
      :open="showEditCompanyModal"
      :company="selectedCompany"
      @close="showEditCompanyModal = false"
      @success="handleEditCompanySuccess"
    />
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
