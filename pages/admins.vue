<script setup lang="ts">
import type { User, UsersResponse } from '~/types/users';
import { formatDate, phoneNumberFormatter } from '~/utils/helpers';
import { UserRoles } from '~/types/enums';
import AddUser from '~/views/users/components/AddUser.vue';
import EditUser from '~/views/users/components/EditUser.vue';
import DeleteUser from '~/views/users/components/DeleteUser.vue';
import ViewAdmin from '~/views/users/components/ViewAdmin.vue';

useHead({
  title: "إدارة المشرفين"
})

definePageMeta({
  title: "المشرفون"
})

const apiPaths = useApiPaths();

const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

// Use useFetch like Archive-Admin with UserRoles enum
const { data: adminsData, refresh: refreshAdmins, pending: isLoading } = await useFetch<UsersResponse>(
  apiPaths.users,
  {
    key: 'admins-list',
    lazy: true,
    query: computed(() => ({
      role: UserRoles.ADMIN, // Use enum value (0)
      fullName: searchQuery.value,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const admins = computed<User[]>(() => adminsData.value?.data || []);
const totalCount = computed(() => adminsData.value?.totalCount || 0);
const pageCount = computed(() => adminsData.value?.pageCount || 0);

watch(searchQuery, () => {
  pageNumber.value = 1;
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة المشرفين</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">إدارة حسابات المشرفين</BaseParagraph>
      </div>
    </div>

    <BaseCard class="p-6">
      <div class="flex items-center justify-between gap-4">
        <BaseInput v-model="searchQuery" placeholder="البحث بالاسم..." icon="ph:magnifying-glass-duotone" class="w-full max-w-xs" />
        <AddUser @added="refreshAdmins" />
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <BasePlaceload class="h-12 w-full rounded" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
      </div>

      <div v-else-if="admins.length === 0" class="p-12 text-center">
        <BaseParagraph class="text-muted-400">لا توجد مشرفين</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم الكامل</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">رقم الهاتف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="admin in admins" :key="admin.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-muted-900 dark:text-white">{{ admin.fullName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ phoneNumberFormatter(admin.phoneNumber) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ formatDate(admin.creationDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <ViewAdmin :user="admin" />
                  <EditUser :user="admin" @edited="refreshAdmins" />
                  <DeleteUser :user-id="admin.id" :user-name="admin.fullName" @deleted="refreshAdmins" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pageCount > 1" class="p-6 border-t border-muted-200 dark:border-muted-700">
        <BasePagination :current-page="pageNumber" :item-per-page="pageSize" :total-items="totalCount" @update:current-page="pageNumber = $event" />
      </div>
    </BaseCard>
  </div>
</template>
