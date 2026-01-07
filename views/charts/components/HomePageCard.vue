<script setup lang="ts">
const props = defineProps<{
  title: string
  data: any
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  subtitle?: string
  loading?: boolean
}>()

const colorClasses = computed(() => {
  const colors = {
    primary: {
      bg: 'bg-primary-500/10 dark:bg-primary-500/20',
      icon: 'text-primary-500',
      text: 'text-primary-600 dark:text-primary-400'
    },
    success: {
      bg: 'bg-success-500/10 dark:bg-success-500/20',
      icon: 'text-success-500',
      text: 'text-success-600 dark:text-success-400'
    },
    warning: {
      bg: 'bg-warning-500/10 dark:bg-warning-500/20',
      icon: 'text-warning-500',
      text: 'text-warning-600 dark:text-warning-400'
    },
    danger: {
      bg: 'bg-danger-500/10 dark:bg-danger-500/20',
      icon: 'text-danger-500',
      text: 'text-danger-600 dark:text-danger-400'
    },
    info: {
      bg: 'bg-info-500/10 dark:bg-info-500/20',
      icon: 'text-info-500',
      text: 'text-info-600 dark:text-info-400'
    },
    muted: {
      bg: 'bg-muted-500/10 dark:bg-muted-500/20',
      icon: 'text-muted-500',
      text: 'text-muted-600 dark:text-muted-400'
    }
  }
  return colors[props.color] || colors.primary
})
</script>

<template>
  <BaseCard class="p-5 hover:shadow-lg hover:shadow-muted-300/30 dark:hover:shadow-muted-800/30 transition-all duration-300 group">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-muted-500 dark:text-muted-400 mb-1 truncate">
          {{ props.title }}
        </p>
        <div v-if="loading" class="h-8 w-20 bg-muted-200 dark:bg-muted-700 rounded animate-pulse"></div>
        <p v-else class="text-3xl font-bold text-muted-800 dark:text-white">
          {{ props.data?.toLocaleString() ?? 0 }}
        </p>
        <p v-if="subtitle" class="text-xs text-muted-400 mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div
        :class="[colorClasses.bg, 'w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300']"
      >
        <Icon :name="props.icon" :class="[colorClasses.icon, 'w-7 h-7']" />
      </div>
    </div>
  </BaseCard>
</template>
