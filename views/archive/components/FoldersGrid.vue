<script setup lang="ts">
import { FolderType, FOLDER_CONFIG, type CompanyFolders } from '~/types/archive'

const props = defineProps<{
  folders: CompanyFolders | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'select', folderType: FolderType): void
}>()

const folderItems = computed(() => [
  {
    type: FolderType.ClientFiles,
    ...FOLDER_CONFIG[FolderType.ClientFiles],
    count: props.folders?.clientFilesCount ?? 0,
    unit: 'ملف'
  },
  {
    type: FolderType.ManagementFiles,
    ...FOLDER_CONFIG[FolderType.ManagementFiles],
    count: props.folders?.managementFilesCount ?? 0,
    unit: 'ملف'
  },
  {
    type: FolderType.Conversations,
    ...FOLDER_CONFIG[FolderType.Conversations],
    count: props.folders?.conversationsCount ?? 0,
    unit: 'رسالة'
  },
  {
    type: FolderType.CompanyInfo,
    ...FOLDER_CONFIG[FolderType.CompanyInfo],
    count: null,
    unit: ''
  }
])
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="p-6 bg-muted-100 dark:bg-muted-800 rounded-xl animate-pulse">
        <div class="w-16 h-16 mx-auto bg-muted-200 dark:bg-muted-700 rounded-lg mb-4"></div>
        <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-2/3 mx-auto mb-2"></div>
        <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-1/2 mx-auto"></div>
      </div>
    </div>

    <!-- Folders Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="folder in folderItems"
        :key="folder.type"
        class="group p-6 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg cursor-pointer transition-all duration-200"
        @click="emit('select', folder.type)"
      >
        <div class="flex flex-col items-center text-center">
          <!-- Folder Icon -->
          <div class="w-20 h-20 mb-4 relative">
            <div class="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform"></div>
            <div class="absolute inset-0 bg-amber-200 dark:bg-amber-800/50 rounded-xl flex items-center justify-center">
              <Icon name="ph:folder-open-duotone" class="w-12 h-12 text-amber-500" />
            </div>
          </div>

          <!-- Folder Name -->
          <h3 class="font-medium text-muted-800 dark:text-muted-100 mb-1">
            {{ folder.nameAr }}
          </h3>

          <!-- File Count -->
          <p v-if="folder.count !== null" class="text-sm text-muted-400">
            {{ folder.count }} {{ folder.unit }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
