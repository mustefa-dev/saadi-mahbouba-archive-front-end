<script setup lang="ts">
import { useCollapse } from '../composables/collapse'
import TairoCollapseNavigationMenuToggle from './TairoCollapseNavigationMenuToggle.vue';

const { isOpen, isMobileOpen, menuItems, toggle } = useCollapse()
const appUserStore = useAppUserStore();
const app = useAppConfig()

const startMenuItems = computed(
  () =>
    menuItems.value?.filter(
      sidebar => !sidebar.position || sidebar.position === 'start',
    ),
)
const isUserInRole = (roles? : string[])=>{
  if(!roles)
    return true;
  return appUserStore.isInRole(roles)
}
</script>

<template>
  <div
    class="border-muted-200 fixed h-full start-0 top-0 z-[60] flex flex-col border-r transition-all duration-300"
    :class="[
      !isOpen ? 'w-[60px] p-0 py-2' : 'w-[300px] p-4',
    ]"
  >
    <!-- Toggle Button -->
    <button
      @click="toggle"
      class="absolute top-6 z-[70] flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all duration-300"
      :style="{ left: isOpen ? '287px' : '47px' }"
    >
      <Icon
        :name="isOpen ? 'ph:caret-right' : 'ph:caret-left'"
        class="h-4 w-4"
      />
    </button>

    <div class="rounded-lg h-full flex flex-col overflow-hidden"
      :class="isOpen && isMobileOpen ? 'bg-[#2f2f2ff0]':'bg-[#2f2f2f]'"
    >
      <!--Header-->
      <slot name="header">
        <component
          :is="
          resolveComponentOrNative(
            app.tairo?.collapse?.navigation?.header?.component,
          )
          "
          v-if="app.tairo?.collapse?.navigation?.header?.component"
        />
      </slot>
      <!--Body-->
      <div
        class="relative flex w-full grow flex-col py-6 overflow-y-auto nui-slimscroll"
        :class="!isOpen ? 'px-4' : 'px-6'"
      >
        <!--Menu-->
        <ul v-if="startMenuItems?.length" class="space-y-2">
          <!--Menu item-->
          <li v-for="(item, index) in startMenuItems" :key="index">
            <template v-if="isUserInRole(item.role)" >
              <TairoCollapseNavigationCollapseLinks
                v-if="item.children"
                :item="item"
                :expanded="isOpen"
                @clicked="isOpen = true"
              />
              <span
                v-else-if="item.header"
              >
                <Icon :name="item.icon.name" :class="item.icon.class" v-if="item.icon" />
                <span
                  class="text-md text-white"
                  :class="!isOpen ? 'hidden' : 'block'"
                >
                  {{ item.header }}
                </span>
              </span>
              <NuxtLink
                v-else-if="item.to"
                :to="item.to"
                :data-nui-tooltip="isOpen ? undefined : item.name"
                data-nui-tooltip-position="end"
                exact-active-class="!text-primary-500 "
                class="nui-focus text-white  hover:bg-muted-100  hover:text-muted-600  flex cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
                :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
              >
                <Icon :name="item.icon.name" :class="item.icon.class" />
                <span
                  class="whitespace-nowrap font-sans text-lg"
                  :class="!isOpen ? 'hidden' : 'block'"
                >
                  {{ item.name }}
                </span>
              </NuxtLink>
              <div
                v-else-if="item.divider"
                class="border-muted-200  my-3 h-px w-full border-t"
              />
              <button
                v-else
                class="nui-focus text-white  hover:bg-muted-100  hover:text-muted-600  flex w-full cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
                :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
                @click="item.click"
              >
                <Icon :name="item.icon.name" :class="item.icon.class" />
                <span
                  class="whitespace-nowrap font-sans text-sm"
                  :class="!isOpen ? 'hidden' : 'block'"
                >
                  {{ item.name }}
                </span>
              </button>
            </template>
          </li>
        </ul>
      </div>
      <!--Footer-->
      <slot name="footer">
        <component
          :is="
          resolveComponentOrNative(
            app.tairo?.collapse?.navigation?.footer?.component,
          )
          "
          v-if="app.tairo?.collapse?.navigation?.footer?.component"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for dark sidebar */
.nui-slimscroll::-webkit-scrollbar {
  width: 6px;
}
.nui-slimscroll::-webkit-scrollbar-track {
  background: transparent;
}
.nui-slimscroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.nui-slimscroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
