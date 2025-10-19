<template>
  <button type="button"
    class="hover:ring-muted-200 dark:hover:ring-muted-700 dark:ring-offset-muted-900 inline-flex size-9 items-center justify-center rounded-full ring-1 ring-transparent transition-all duration-300 hover:ring-offset-4">
    <NuxtLink to="/settings">
      <span
        class="nui-focus border-muted-200 dark:border-muted-700 dark:bg-muted-800 flex size-9 items-center justify-center rounded-full border bg-white">
        <Icon name="ph:gear-light" class="text-muted-400 size-5" />
      </span>
    </NuxtLink>
  </button>
</template>
