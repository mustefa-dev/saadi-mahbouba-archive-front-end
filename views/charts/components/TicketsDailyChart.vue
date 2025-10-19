<script setup lang="ts">
import { useAppCrudStore } from '~/components/app-crud/store/AppCrudStore';
import axiosIns from '~/services/app-client/axios';
import type { PaginatedResponse } from '~/utils/types/ApiResponses';
import { tableHeader } from '~/views/ticket';
import TicketStatusTag from '~/views/ticket/components/TicketStatusTag.vue';
import type { Ticket } from '~/views/ticket/types';

const isLoading = ref(false);
const recentTickets = ref<Ticket[]>([]);
onMounted(async ()=>{
  isLoading.value = true;
  const res = await axiosIns.get<PaginatedResponse<Ticket>>('tickets?pageSize=5');
  recentTickets.value = res.data.data;
  isLoading.value = false;
  useAppCrudStore().isLoading = false;
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-md font-bold">
      اخر الشكاوي
    </span>
    <div class="flex-grow h-full">
      <AppTable :items="recentTickets" :headers="tableHeader">
        <template #data-user="{item}">
          <span v-if="item.user">{{item.user?.fullName}}</span>
          <span v-else>لا يوجد</span>
        </template>
        <template #data-title="{item}">
          <span v-if="item.title">{{toShortString(item.title??'',20)}}</span>
          <span v-else>لا يوجد</span>
        </template>
        <template #data-description="{item}">
          <span v-if="item.description">{{toShortString(item.description??'',10)}}</span>
          <span v-else>لا يوجد</span>
        </template>
        <template #data-creationDate="{item}">
          <span>{{new Date(item.creationDate||'').toLocaleDateString('ar')}}</span>
        </template>
        <template #data-status="{item}">
            <div class="flex justify-center">
              <TicketStatusTag :status="item.status??0"/>
            </div>
        </template>
        <template #data-actions="{item}">
          <div class="w-full flex justify-center gap-2">
            <RouterLink
              :to="`/tickets/${item.id}`"
            >
              <BaseButton variant="pastel" @click="useTicketStore().selectedTicketId = item.id">
                <Icon name="ph:eye" class="size-4"/>
              </BaseButton>
            </RouterLink>
          </div>
        </template>
        <template #data-assignedUsers="{item}">
          <template v-if="item.assignedUsers?.length">
              <div class="flex justify-center gap-2">
                <BaseTag v-for="user in item.assignedUsers" size="sm">{{user.fullName}}</BaseTag>
              </div>
          </template>
          <span v-else>لا يوجد</span>
        </template>
      </AppTable>
    </div>
  </div>
</template>
