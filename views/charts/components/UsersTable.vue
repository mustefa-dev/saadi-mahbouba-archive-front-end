<script setup lang="ts">
import { useAppCrudStore } from '~/components/app-crud/store/AppCrudStore';
import axiosIns from '~/services/app-client/axios';
import { usersTableHeaders } from '..';

const isLoading = ref(false);
const totalCount = ref(0);
const pageNumber = ref(1);
const users = ref([]);
onMounted(()=>{
  loadData();
})
const loadData = async ()=>{
  isLoading.value = true;
  const res = await axiosIns.get(`dashboard/user-ticketsnumber?pageSize=5&pageNumber=${pageNumber.value}`);
  users.value = res.data.data;
  totalCount.value = res.data.pagesCount * 5;
  isLoading.value = false;
  useAppCrudStore().isLoading = false;
}
</script>

<template>
  <div class="flex flex-col gap-2 py-2">
    <span class="text-md font-bold">
      احصائيات شكاوي المستخدمين
    </span>
    <div class="flex-grow h-full">
      <AppTable :items="users" :headers="usersTableHeaders">
        <BasePagination
          :item-per-page="5"
          :total-items="totalCount"
          :current-page="pageNumber"
          @update:current-page="(cp)=>{pageNumber = cp; loadData()}"
        />
      </AppTable>
    </div>
  </div>
</template>
