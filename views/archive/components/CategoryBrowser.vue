<script setup lang="ts">
import type { Category, CategoryBreadcrumb } from '~/types/archive'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const apiPaths = useApiPaths()

// State
const categories = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)
const breadcrumbs = ref<CategoryBreadcrumb[]>([])
const loadingTree = ref(false)
const loadingChildren = ref(false)
const selectedCategoryId = ref<string | undefined>(props.modelValue)

// Fetch root categories
const fetchRootCategories = async () => {
  loadingTree.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryTree, {
      query: { parentId: null, maxDepth: 1 }
    })
    categories.value = response || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loadingTree.value = false
  }
}

// Fetch children of a category
const fetchChildren = async (parentId: string) => {
  loadingChildren.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryChildren(parentId))
    // Handle different response formats
    if (Array.isArray(response)) {
      return response
    } else if (response?.children) {
      return response.children
    } else if (response?.data) {
      return response.data
    }
    return []
  } catch (error) {
    console.error('Error fetching children:', error)
    return []
  } finally {
    loadingChildren.value = false
  }
}

// Fetch breadcrumbs
const fetchBreadcrumbs = async (categoryId: string) => {
  try {
    const response = await $fetch<any>(apiPaths.categoryBreadcrumbs(categoryId))
    breadcrumbs.value = response || []
  } catch (error) {
    console.error('Error fetching breadcrumbs:', error)
  }
}

// Navigate to a category (drill down)
const navigateToCategory = async (category: Category | null) => {
  currentCategory.value = category

  if (category) {
    const children = await fetchChildren(category.id)
    categories.value = children
    await fetchBreadcrumbs(category.id)
  } else {
    breadcrumbs.value = []
    await fetchRootCategories()
  }
}

// Navigate using breadcrumb
const navigateToBreadcrumb = async (breadcrumb: CategoryBreadcrumb | null) => {
  if (!breadcrumb) {
    await navigateToCategory(null)
    return
  }

  loadingChildren.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryById(breadcrumb.id))
    await navigateToCategory(response)
  } catch (error) {
    console.error('Error navigating to breadcrumb:', error)
  } finally {
    loadingChildren.value = false
  }
}

// Select a category for filtering
const selectCategory = (category: Category) => {
  selectedCategoryId.value = category.id
  emit('update:modelValue', category.id)
}

// Clear selection
const clearSelection = () => {
  selectedCategoryId.value = undefined
  emit('update:modelValue', undefined)
}

// Initial load
onMounted(() => {
  fetchRootCategories()
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  selectedCategoryId.value = newValue
})
</script>

<template>
  <div class="category-browser">
    <!-- Header with breadcrumbs -->
    <div class="mb-3">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-1 text-xs overflow-x-auto pb-1">
        <button
          class="hover:text-primary-500 transition-colors whitespace-nowrap px-1 py-0.5 rounded"
          :class="!currentCategory ? 'font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted-500'"
          @click="navigateToBreadcrumb(null)"
        >
          الرئيسية
        </button>
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
          <Icon name="ph:caret-left" class="w-3 h-3 text-muted-400 flex-shrink-0" />
          <button
            class="hover:text-primary-500 transition-colors whitespace-nowrap px-1 py-0.5 rounded"
            :class="index === breadcrumbs.length - 1 ? 'font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted-500'"
            @click="navigateToBreadcrumb(crumb)"
          >
            {{ crumb.name }}
          </button>
        </template>
      </div>
    </div>

    <!-- Selected category indicator -->
    <div v-if="selectedCategoryId" class="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm">
        <Icon name="ph:check-circle-duotone" class="w-4 h-4 text-primary-500" />
        <span class="text-primary-700 dark:text-primary-300">تم اختيار تصنيف للفلترة</span>
      </div>
      <button
        class="text-xs text-danger-500 hover:text-danger-600"
        @click="clearSelection"
      >
        مسح
      </button>
    </div>

    <!-- Category list -->
    <div class="border border-muted-200 dark:border-muted-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
      <!-- Loading -->
      <div v-if="loadingTree || loadingChildren" class="flex items-center justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="categories.length === 0" class="text-center py-6">
        <Icon name="ph:folder-open-duotone" class="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <p class="text-sm text-muted-600 dark:text-muted-300 mb-1">
          {{ currentCategory ? currentCategory.name : 'لا توجد تصنيفات' }}
        </p>
        <p v-if="currentCategory" class="text-xs text-muted-400">
          لا توجد تصنيفات فرعية - يمكنك اختيار هذا التصنيف للفلترة
        </p>
        <button
          v-if="currentCategory"
          class="mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
          @click="selectCategory(currentCategory)"
        >
          <Icon name="ph:check" class="w-4 h-4 inline ml-1" />
          اختيار هذا التصنيف
        </button>
      </div>

      <!-- Categories -->
      <div v-else class="divide-y divide-muted-100 dark:divide-muted-800">
        <div
          v-for="category in categories"
          :key="category.id"
          class="group flex items-center gap-2 p-3 hover:bg-muted-100 dark:hover:bg-muted-800 cursor-pointer transition-colors"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedCategoryId === category.id }"
        >
          <!-- Folder icon -->
          <div class="flex-shrink-0">
            <Icon
              :name="category.childrenCount > 0 ? 'ph:folder-notch-duotone' : 'ph:folder-duotone'"
              class="w-5 h-5 text-amber-500"
            />
          </div>

          <!-- Name and info -->
          <div class="flex-1 min-w-0" @click="selectCategory(category)">
            <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
              {{ category.name }}
            </p>
            <p class="text-xs text-muted-400">
              <span v-if="category.childrenCount > 0">{{ category.childrenCount }} تصنيفات فرعية</span>
              <span v-if="category.childrenCount > 0 && category.reportsCount > 0"> - </span>
              <span v-if="category.reportsCount > 0">{{ category.reportsCount }} ملفات</span>
              <span v-if="category.childrenCount === 0 && category.reportsCount === 0">فارغ</span>
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <!-- Select Button -->
            <button
              class="p-1.5 rounded-lg transition-colors"
              :class="selectedCategoryId === category.id
                ? 'bg-primary-500 text-white'
                : 'hover:bg-muted-200 dark:hover:bg-muted-600 text-muted-500 opacity-0 group-hover:opacity-100'"
              data-nui-tooltip="اختيار"
              @click.stop="selectCategory(category)"
            >
              <Icon name="ph:check" class="w-4 h-4" />
            </button>

            <!-- Open folder (if has children) -->
            <button
              v-if="category.childrenCount > 0"
              class="p-1.5 rounded-lg hover:bg-muted-200 dark:hover:bg-muted-600 text-muted-500 opacity-0 group-hover:opacity-100 transition-all"
              data-nui-tooltip="فتح"
              @click.stop="navigateToCategory(category)"
            >
              <Icon name="ph:arrow-left" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-browser {
  direction: rtl;
}
</style>
