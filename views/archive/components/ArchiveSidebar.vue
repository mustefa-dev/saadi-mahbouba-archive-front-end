<script setup lang="ts">
import { FolderType, FOLDER_CONFIG, type CompanyArchive } from '~/types/archive'

const props = defineProps<{
  companies: CompanyArchive[]
  selectedCompanyId?: string
  selectedFolder?: FolderType
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'select-root'): void
  (e: 'select-company', company: CompanyArchive): void
  (e: 'select-folder', company: CompanyArchive, folder: FolderType): void
}>()

const expandedCompanies = ref<Set<string>>(new Set())

const toggleCompany = (companyId: string) => {
  if (expandedCompanies.value.has(companyId)) {
    expandedCompanies.value.delete(companyId)
  } else {
    expandedCompanies.value.add(companyId)
  }
  expandedCompanies.value = new Set(expandedCompanies.value)
}

const expandAll = () => {
  props.companies.forEach(c => expandedCompanies.value.add(c.userId))
  expandedCompanies.value = new Set(expandedCompanies.value)
}

const collapseAll = () => {
  expandedCompanies.value.clear()
  expandedCompanies.value = new Set()
}

// Auto-expand selected company
watch(() => props.selectedCompanyId, (newId) => {
  if (newId) {
    expandedCompanies.value.add(newId)
    expandedCompanies.value = new Set(expandedCompanies.value)
  }
}, { immediate: true })

const getFolderCount = (company: CompanyArchive, folder: FolderType) => {
  switch (folder) {
    case FolderType.ClientFiles:
      return company.clientFilesCount
    case FolderType.ManagementFiles:
      return company.managementFilesCount
    case FolderType.Conversations:
      return company.conversationsCount
    default:
      return null
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-muted-200 dark:border-muted-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-muted-800 dark:text-muted-100">التصنيفات</h3>
        <div class="flex items-center gap-1">
          <BaseButtonIcon
            size="xs"
            rounded="lg"
            data-nui-tooltip="توسيع الكل"
            @click="expandAll"
          >
            <Icon name="ph:arrows-out-simple" class="w-3.5 h-3.5" />
          </BaseButtonIcon>
          <BaseButtonIcon
            size="xs"
            rounded="lg"
            data-nui-tooltip="طي الكل"
            @click="collapseAll"
          >
            <Icon name="ph:arrows-in-simple" class="w-3.5 h-3.5" />
          </BaseButtonIcon>
        </div>
      </div>
    </div>

    <!-- Tree Content -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-2 p-2">
        <div v-for="i in 5" :key="i" class="h-8 bg-muted-100 dark:bg-muted-800 rounded animate-pulse"></div>
      </div>

      <template v-else>
        <!-- Root: Archive -->
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
          :class="!selectedCompanyId ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-muted-100 dark:hover:bg-muted-800'"
          @click="emit('select-root')"
        >
          <Icon name="ph:folder-duotone" class="w-5 h-5 text-amber-500" />
          <span class="font-medium">الأرشيف</span>
        </div>

        <!-- Companies -->
        <div class="mr-4 mt-1 space-y-1">
          <div v-for="company in companies" :key="company.userId">
            <!-- Company Row -->
            <div
              class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
              :class="selectedCompanyId === company.userId && !selectedFolder ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-muted-100 dark:hover:bg-muted-800'"
              @click="emit('select-company', company)"
            >
              <button
                class="w-4 h-4 flex items-center justify-center text-muted-400 hover:text-muted-600"
                @click.stop="toggleCompany(company.userId)"
              >
                <Icon
                  :name="expandedCompanies.has(company.userId) ? 'ph:caret-down' : 'ph:caret-left'"
                  class="w-3 h-3"
                />
              </button>
              <Icon name="ph:folder-duotone" class="w-5 h-5 text-amber-500" />
              <span class="flex-1 truncate text-sm">{{ company.companyName || company.fullName }}</span>
              <span class="text-xs text-muted-400">({{ company.clientFilesCount + company.managementFilesCount }})</span>
            </div>

            <!-- Folders -->
            <div
              v-if="expandedCompanies.has(company.userId)"
              class="mr-6 mt-1 space-y-1"
            >
              <div
                v-for="folderType in [FolderType.ClientFiles, FolderType.ManagementFiles, FolderType.Conversations, FolderType.CompanyInfo]"
                :key="folderType"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm"
                :class="selectedCompanyId === company.userId && selectedFolder === folderType ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-muted-100 dark:hover:bg-muted-800'"
                @click="emit('select-folder', company, folderType)"
              >
                <Icon name="ph:folder-duotone" class="w-4 h-4 text-amber-400" />
                <span class="flex-1">{{ FOLDER_CONFIG[folderType].nameAr }}</span>
                <span v-if="getFolderCount(company, folderType) !== null" class="text-xs text-muted-400">
                  ({{ getFolderCount(company, folderType) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
