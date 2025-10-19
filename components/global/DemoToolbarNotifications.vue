<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import AxiosIns from "~/services/app-client/axios"
import { useNotificationStore } from '~/stores/notification';
import type { PaginatedResponse } from '~/utils/types/ApiResponses';
interface Notifications{
  id?:string
  title?:string
  body?:string
  userId?:string
  projectId?:string
  ticketId?:string
}
const notifications = ref<any[]>([]);
const canLoad = ref(true);
const isNewNotification = computed<boolean>(() => {
  return useNotificationStore().isNewNotification;
});
const isLoading = ref(false);
const isLoadingMore = ref(false);
const notificationsUrl = computed<string>(()=>{
  return "notifications" + (useAppUserStore().user.role == 'Admin'?'/manager':'');
})
onMounted(async () => {
  await loadNotifications();
})
const loadNotifications = async ()=>{
  isLoading.value = true;
  useNotificationStore().isNewNotification = false;
  const res = await AxiosIns.get<PaginatedResponse<Notifications>>(`${notificationsUrl.value}?pageSize=5`);
  notifications.value = res.data.data;

  //if(10==res.data.data.length)
  //  canLoad.value = true;
  //else
  //  canLoad.value = false;

  isLoading.value = false;
}
const loadMore = async () =>{

  if(canLoad.value == false)
    return;
  isLoadingMore.value = true;
  await new Promise(res=> setTimeout(res,100))
  const previousLength = notifications.value.length;
  const res = await AxiosIns.get<PaginatedResponse<Notifications>>(`${notificationsUrl.value}?pageSize=${notifications.value.length+10}`);

  if(previousLength==res.data.data.length)
    canLoad.value = false;
  else
    canLoad.value = true;

  notifications.value = res.data.data;
  isLoadingMore.value = false;
}
</script>

<template>
  <div class="group  z-20 inline-flex items-center justify-center text-right">
    <Menu v-slot="{ close }" as="div" class="relative  z-20 size-9 text-left z-100">
      <MenuButton as="div">
        <button type="button" @click="loadNotifications"
          class="group-hover:ring-muted-200 dark:group-hover:ring-muted-700 dark:ring-offset-muted-900 inline-flex size-9 items-center justify-start rounded-full ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4">
          <BaseAvatar size="sm" :dot="isNewNotification?'primary':null">
            <Icon name="ph:bell" />
          </BaseAvatar>
        </button>
      </MenuButton>

      <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <MenuItems
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
          style="width:400px;max-height: 300px;overflow-y: scroll;scrollbar-width: none;" 
        >
          <div class="p-4">
            <div class="relative flex items-center justify-between">
              <h4 class="font-heading text-muted-500 dark:text-muted-200 text-xs uppercase">
                الإشعارات
              </h4>
              <h4 class="font-bold text-muted-500 cursor-pointer hover:text-primary-500 dark:text-muted-200 text-sm uppercase"
                @click="()=>{
                  useRouter().push('/notifications')
                  close();
                }"
              >
                عرض الكل
              </h4>
            </div>
          </div>
          <template v-if="isLoading">
            <MenuItem v-for="_ in 5">
            <div class="group flex w-full items-center rounded-md p-2 text-sm transition-colors duration-300">
              <div class="ms-2 w-full">
                <BasePlaceload class="h-3 font-heading text-xs font-semibold leading-tight dark:text-white"/>
              </div>
            </div>
            </MenuItem>
          </template>
          <template v-else>
            <template v-for="notification in notifications" :key="notification.id" >
              <MenuItem as="div" class="w-full">
              <NuxtLink :to="`/tickets/${notification.ticketId}`"
                class="flex w-full text-right rounded-md p-2 text-sm transition-colors duration-300" @click.passive="close"
                active-class="text-primary-500"
              >
                <template v-if="useAppUserStore().user.role=='Admin'">
                  <div class="w-full">
                    <div class="flex justify-between">
                      <h6 class="font-heading text-xs font-semibold leading-tight" :class="active?'text-danger':''">
                        {{notification.ticketTitle}}
                      </h6>
                      <h6 class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white">
                        {{new Date(notification.creationDate).toLocaleString('ar')}}
                      </h6>
                    </div>
                    <p class="text-muted-400 font-sans text-xs mt-2">
                      {{notification.type==1?'تم تعيينك في شكوى جديدة':'لديك رسالة جديدة'}}
                    </p>
                  </div>
                </template>
                <template v-else>
                  <div class="w-full">
                    <div class="flex justify-between">
                      <h6 class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white">
                        {{notification.ticketTitle}}
                      </h6>
                      <h6 class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white">
                        {{new Date(notification.creationDate).toLocaleString('ar')}}
                      </h6>
                    </div>
                    <p class="text-muted-400 font-sans text-xs">
                      {{notification.body}}
                    </p>
                  </div>
                </template>
              </NuxtLink>
              </MenuItem>
            </template>
              <MenuItem class="w-full">
            <BaseButton color="primary" 
              :disabled="!canLoad"
              :loading="isLoadingMore"
              @click="(e)=>{
              loadMore()
              e.preventDefault();
            }">
              {{canLoad?'تحميل المزيد من الاشعارات':'لا يوجد المزيد من الاشعارات'}}
                </BaseButton>
              </MenuItem>
          </template>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
