<script setup lang="ts">
import type { Project } from '~/views/projects/types';
import { UserService } from '~/views/user/service';
import { filters, tableHeader } from '~/views/user';
import UserCreate from '~/views/user/components/UserCreate.vue';
import UserEdit from '~/views/user/components/UserEdit.vue';
import UserChangePassword from '~/views/user/components/UserChangePassword.vue';
import { getEnumByKey, UserRoles } from '~/utils/constants/enum';
import UserChangeStatus from '~/views/user/components/UserChangeStatus.vue';
const userService = new UserService();
useHead({
  title:"نظام الدعم الفني - المستخدمون"
})
definePageMeta({
  title:"المستخدمون"
})

</script>
<template>
  <div>
    <AppCrud :model-service="userService" pagination :filters="filters" :view-deleted="useAppUserStore().isInRole(['Admin','SuperAdmin'])">
      <AppTable :items="useUserStore().users" :headers="tableHeader">
        <template #["data-project"]="{item}">
          <span v-if="item.project">{{(item.project as Project).name}}</span>
          <span v-else>لا يوجد</span>
        </template>
        <template #["data-isActive"]="{item}">
          <div class="w-full flex justify-center">
            <UserChangeStatus :user="item" v-if="item.role=='Admin'"/>
            <span v-else>لايوجد</span>
          </div>
        </template>
        <template #["data-role"]="{item}">
          <span>{{getEnumByKey(UserRoles,'name',item.role).arName}}</span>
        </template>
        <template #["data-actions"]={item}>
          <AppCrudComponentsAppCrudActions :item="item" :hide-delete="useRoute().query.isDeleted=='true'">
            <BaseButton variant="pastel" color="warning" rounded="sm" @click="()=>userService.changePasswordBtnAction(item)">
              <span class="flex items-center gap-2 justify-center rounded-full">
                <Icon name="ph:eye" class="size-5" />
                <span>تغيير الرمز السري</span>
              </span>
            </BaseButton>
          </AppCrudComponentsAppCrudActions>
        </template>
      </AppTable>
    </AppCrud>
    <UserCreate/>
    <UserEdit/>
    <UserChangePassword/>
  </div>
</template>
