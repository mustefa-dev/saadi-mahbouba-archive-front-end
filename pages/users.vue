<script setup lang="ts">
import type { User, UsersResponse } from '~/types/users';
import { UserStatus } from '~/types/users';
import { formatDate, phoneNumberFormatter } from '~/utils/helpers';
import { UserRoles } from '~/types/enums';
import AddUser from '~/views/users/components/AddUser.vue';
import AddCompany from '~/views/users/components/AddCompany.vue';
import EditUser from '~/views/users/components/EditUser.vue';
import DeleteUser from '~/views/users/components/DeleteUser.vue';
import ActivateUser from '~/views/users/components/ActivateUser.vue';
import DeactivateUser from '~/views/users/components/DeactivateUser.vue';
import ViewUser from '~/views/users/components/ViewUser.vue';

useHead({
  title: "إدارة العملاء"
})

definePageMeta({
  title: "المستخدمون"
})

const apiPaths = useApiPaths();

const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

const { data: usersData, refresh: refreshUsers, pending: isLoading } = await useFetch<UsersResponse>(
  apiPaths.users,
  {
    key: 'users-list',
    lazy: true,
    query: computed(() => ({
      role: UserRoles.USER,
      fullName: searchQuery.value,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const users = computed<User[]>(() => usersData.value?.data || []);
const totalCount = computed(() => usersData.value?.totalCount || 0);
const pageCount = computed(() => usersData.value?.pageCount || 0);

watch(searchQuery, () => {
  pageNumber.value = 1;
});

const getStatusLabel = (status?: UserStatus) => {
  switch (status) {
    case UserStatus.Active:
      return 'مفعّل';
    case UserStatus.PendingApproval:
      return 'بانتظار الموافقة';
    case UserStatus.Rejected:
      return 'مرفوض';
    default:
      return 'بانتظار الموافقة';
  }
};

const getStatusColor = (status?: UserStatus) => {
  switch (status) {
    case UserStatus.Active:
      return 'success';
    case UserStatus.PendingApproval:
      return 'warning';
    case UserStatus.Rejected:
      return 'danger';
    default:
      return 'warning';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة العملاء</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">إدارة حسابات الشركات</BaseParagraph>
      </div>
      <AddCompany @added="refreshUsers" />
    </div>

    <BaseCard class="p-6">
      <div class="flex items-center justify-between gap-4">
        <BaseInput v-model="searchQuery" placeholder="البحث بالاسم..." icon="ph:magnifying-glass-duotone" class="w-full max-w-xs" />
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <BasePlaceload class="h-12 w-full rounded" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
      </div>

      <div v-else-if="users.length === 0" class="p-12 text-center">
        <BaseParagraph class="text-muted-400">لا توجد مستخدمين</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">اسم الشركة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم الكامل</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">رقم الهاتف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الكود</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">كلمة المرور</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-muted-900 dark:text-white">{{ user.companyName || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ user.fullName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ phoneNumberFormatter(user.phoneNumber) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ user.code || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ user.passwordPlain || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ formatDate(user.creationDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseTag v-if="user.status === UserStatus.Active" :color="getStatusColor(user.status)" flavor="pastel" size="sm">{{ getStatusLabel(user.status) }}</BaseTag>
                <ActivateUser v-else :user-id="user.id" :user="user" @activated="refreshUsers" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <ViewUser :user="user" />
                  <EditUser :user="user" @edited="refreshUsers" />
                  <DeactivateUser v-if="user.status === UserStatus.Active" :user-id="user.id" :user-name="user.companyName || user.fullName" @deactivated="refreshUsers" />
                  <DeleteUser :user-id="user.id" :user-name="user.fullName" @deleted="refreshUsers" />
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
