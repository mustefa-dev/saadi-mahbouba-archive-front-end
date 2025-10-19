<script setup lang="ts">
import { useCollapse } from '../composables/collapse'

const props = withDefaults(
  defineProps<{
    collapse?: boolean
    toolbar?: boolean
    circularMenu?: boolean
    condensed?: boolean
    horizontalScroll?: boolean
  }>(),
  {
    collapse: true,
    toolbar: true,
    circularMenu: true,
  },
)

const app = useAppConfig()
const { isOpen, isMobileOpen, toggle } = useCollapse()

const collapseEnabled = computed(() => {
  return (
    (app.tairo?.collapse?.navigation?.enabled as boolean) !== false
    && props.collapse !== false
  )
})
const toolbarEnabled = computed(() => {
  return (
    app.tairo?.collapse?.toolbar?.enabled as boolean !== false && props.toolbar !== false
  )
})
const circularMenuEnabled = computed(() => {
  return (
    app.tairo?.collapse?.circularMenu?.enabled as boolean !== false
    && props.circularMenu !== false
  )
})

const mainClass = computed(() => {
  if (props.condensed) {
    return 'bg-white relative min-h-screen w-full overflow-x-hidden'
  }

  if (!collapseEnabled.value) {
    return 'bg-white  relative min-h-screen w-full overflow-x-hidden px-4 transition-all duration-300 xl:px-10'
  }

  const list = [
    'bg-[#F8F9FA]  relative min-h-screen w-full overflow-x-hidden px-4 transition-all duration-300 xl:px-10',
  ]

  if (isOpen.value) {
    list.push('lg:max-w-[calc(100%_-_300px)] lg:ms-[300px]')
  }
  else {
    list.push('max-w-[calc(100%_-_60px)] ms-[60px]')
  }

  if (props.horizontalScroll) {
    list.push('!pe-0 xl:!pe-0')
  }

  return list
})
</script>

<template>
  <div class="bg-[#F8F9FA]  pb-20">
    <slot name="navigation">
      <TairoCollapseNavigation v-if="collapseEnabled"/>
    </slot>
    <div :class="mainClass">
      <div
        :class="[
          props.condensed && !props.horizontalScroll && 'w-full',
          !props.condensed && props.horizontalScroll && 'mx-auto w-full',
          !props.condensed &&
            !props.horizontalScroll &&
            'mx-auto w-full max-w-7xl',
        ]"
      >
        <slot name="toolbar">
          <TairoCollapseToolbar
            v-if="toolbarEnabled"
            :collapse="props.collapse"
            :horizontal-scroll="props.horizontalScroll"
          >
            <template #title>
              <slot name="toolbar-title" />
            </template>
          </TairoCollapseToolbar>
        </slot>

        <slot />
      </div>
    </div>

    <TairoPanels />

    <TairoCollapseCircularMenu v-if="circularMenuEnabled" />
  </div>
</template>
