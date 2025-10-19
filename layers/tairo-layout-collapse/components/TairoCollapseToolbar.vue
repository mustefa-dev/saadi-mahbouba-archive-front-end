<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    collapse?: boolean
    horizontalScroll?: boolean
  }>(),
  {
    collapse: true,
  },
)

const app = useAppConfig()

const route = useRoute()
</script>

<template>
  <div
    class="relative my-5 flex h-16 items-center gap-2 rounded-lg bg-white"
    :class="props.horizontalScroll && 'pe-4 xl:pe-10'"
  >

    <BaseHeading
      v-if="app.tairo?.collapse?.toolbar?.showTitle"
      as="h1"
      size="md"
      weight="semibold"
      class="text-[#5B5B5B] block p-2"
    >
      <slot name="title">
        {{ route.meta.title }}
      </slot>
    </BaseHeading>

    <div class="ms-auto" />
    <!--
<template v-for="tool of app.tairo?.collapse?.toolbar?.tools">
<component
:is="resolveComponentOrNative(tool.component)"
v-if="tool.component"
:key="tool.component"
v-bind="tool.props"
/>
</template>
-->
    <!--
<DemoThemeToggle/>
-->
    <DemoToolbarNotifications v-if="useAppUserStore().isInRole(['User','Admin'])"/>
    <AppAccountMenu/>
  </div>
</template>
