<template>
  <TairoFlexTable>
    <template #header>
      <TairoFlexTableHeading type="stable">
        النوع
      </TairoFlexTableHeading>

      <TairoFlexTableHeading type="stable">
        التاريخ
      </TairoFlexTableHeading>

      <TairoFlexTableHeading type="stable">
        عنوان الشكوى
      </TairoFlexTableHeading>

      <TairoFlexTableHeading type="grow" class="text-center">
        المحتوى
      </TairoFlexTableHeading>

      <TairoFlexTableHeading type="stable">
        الاجراءات
      </TairoFlexTableHeading>
    </template>

    <TairoFlexTableRow
      v-for="n in notifications"
      :key="n.id"
      rounded="none"
    >
      <TairoFlexTableCell type="stable" data-content="Member">
        <div class="flex items-center gap-2">
          <BaseAvatar size="sm">
            <Icon :name="n.type==0?'ph:messenger-logo':'ph:user-circle-plus'" class="size-8"/>
          </BaseAvatar>

          <div class="leading-none">
            <h4 class="font-bold">
              {{ n.type==0?'رسالة':'تعيين' }}
            </h4>
          </div>
        </div>
      </TairoFlexTableCell>

      <TairoFlexTableCell type="stable" >
        <h6 class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white">
          {{new Date(n.creationDate).toLocaleString('ar')}}
        </h6>
      </TairoFlexTableCell>

      <TairoFlexTableCell type="grow" >
        <h2>
          {{ n.ticketTitle }}
        </h2>
      </TairoFlexTableCell>

      <TairoFlexTableCell type="grow">
        <span class="font-medium" v-if="n.type==1">
          تم تعيينك في شكوى جديدة
        </span>
        <span class="font-medium" v-else>
          لديك رسالة جديدة من <strong>{{n.managerName}}</strong>
        </span>
      </TairoFlexTableCell>
      <TairoFlexTableCell type="stable" data-content="Actions">
        <BaseButton
          color="primary"
          variant="outline"
          @click="useRouter().push('/tickets/'+n.ticketId)"
        >
          <Icon name="ph:caret-circle-left-light" class="size-full"
          />
        </BaseButton>
      </TairoFlexTableCell>
    </TairoFlexTableRow>
    <TairoFlexTableRow class>
      <BaseButton color="primary" class="w-full"
        :disabled="!canLoad"
        :loading="isLoadingMore"
        @click="(e:Event)=>{
          loadMore()
          e.preventDefault();
        }">
        {{canLoad?'تحميل المزيد من الاشعارات':'لا يوجد المزيد من الاشعارات'}}
      </BaseButton>
    </TairoFlexTableRow>
  </TairoFlexTable>
</template>

<script setup lang="ts">
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
  const res = await AxiosIns.get<PaginatedResponse<Notifications>>(`${notificationsUrl.value}?pageSize=10`);
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
