<template>
  <div class="flex flex-col h-full bg-white dark:bg-[#0e1621]">
    <!-- Header - Telegram style -->
    <div class="flex-shrink-0 bg-white dark:bg-[#212121] border-b border-muted-200 dark:border-muted-800/30 px-4 py-3">
      <div class="flex items-center gap-3">
        <!-- Back button (mobile only) -->
        <button
          class="md:hidden p-2 -mr-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors"
          @click="emit('close')"
        >
          <Icon name="ph:arrow-right" class="size-6 text-muted-700 dark:text-muted-300" />
        </button>

        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-base">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- User info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base text-muted-900 dark:text-white truncate">
            {{ userName }}
          </h3>
          <p class="text-xs text-muted-500 dark:text-muted-400">
            آخر ظهور مؤخرًا
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:magnifying-glass" class="size-5 text-muted-600 dark:text-muted-400" />
          </button>
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:phone" class="size-5 text-muted-600 dark:text-muted-400" />
          </button>
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:dots-three-vertical" class="size-5 text-muted-600 dark:text-muted-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container - Telegram style -->
    <div
      class="flex-1 overflow-y-auto px-3 sm:px-6 md:px-12 lg:px-16 py-4 space-y-1 custom-scrollbar bg-[#f4f4f5] dark:bg-[#0e1621]"
    >
      <!-- Static message example -->
      <div class="flex items-end gap-1 justify-start">
        <div class="max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative bg-white dark:bg-[#2b2b2b] text-muted-900 dark:text-white rounded-bl-md">
          <p class="text-sm leading-relaxed break-words">
            مرحبا! كيف يمكنني مساعدتك؟
          </p>
          <div class="flex items-center justify-end gap-1.5 mt-1 min-w-[60px]">
            <span class="text-[11px] whitespace-nowrap opacity-70">
              10:30 ص
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-end gap-1 justify-end">
        <div class="max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative bg-primary-500 dark:bg-primary-600 text-white rounded-br-md">
          <p class="text-sm leading-relaxed break-words">
            شكرا لك، أحتاج مساعدة في شيء ما.
          </p>
          <div class="flex items-center justify-end gap-1.5 mt-1 min-w-[60px]">
            <span class="text-[11px] whitespace-nowrap opacity-70">
              10:31 ص
            </span>
            <Icon name="ph:checks" class="size-4 flex-shrink-0 opacity-70" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area - Telegram style -->
    <div class="flex-shrink-0 bg-white dark:bg-[#212121] border-t border-muted-200 dark:border-muted-800/30 px-4 py-3">
      <!-- Input Form - Telegram style -->
      <form class="flex items-center gap-2">
        <!-- Attachment button -->
        <label class="cursor-pointer flex-shrink-0">
          <input
            type="file"
            class="hidden"
            accept="image/*,audio/*,.pdf,.doc,.docx"
          />
          <div class="p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors">
            <Icon name="ph:paperclip" class="size-6 text-muted-500 dark:text-muted-400" />
          </div>
        </label>

        <!-- Input field -->
        <div class="flex-1 bg-muted-50 dark:bg-[#181818] rounded-lg">
          <input
            type="text"
            placeholder="أكتب رسالة..."
            class="w-full px-4 py-2.5 bg-transparent outline-none text-[15px] text-muted-900 dark:text-white placeholder-muted-400 dark:placeholder-muted-500"
          />
        </div>

        <!-- Emoji button (optional) -->
        <button
          type="button"
          class="flex-shrink-0 p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors"
        >
          <Icon name="ph:smiley" class="size-6 text-muted-500 dark:text-muted-400" />
        </button>

        <!-- Voice button -->
        <button
          type="button"
          class="flex-shrink-0 p-2.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors"
        >
          <Icon name="ph:microphone" class="size-5 text-muted-500 dark:text-muted-400" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: string;
  userName: string;
}>();

const emit = defineEmits<{
  close: []
}>();
</script>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
