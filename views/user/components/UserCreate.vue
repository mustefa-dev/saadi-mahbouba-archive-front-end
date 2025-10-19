<script setup lang="ts">
import type { User } from '../types';
import { useUserStore } from '../stores';
import AppInputField from '~/components/app-field/AppInputField.vue';
import AppAutoCompleteField from '~/components/app-field/AppAutoCompleteField.vue';
import { UserService } from '../service';
import { UserRoles } from '~/utils/constants/enum';
const userStore = useUserStore();
const userService = new UserService();
const user = ref<User>(
  {}
);
const createUser = async ()=>{
  await userService.create(user.value);
  user.value = {
    fullName:"",
    password:"",
    role:0,
  }
}
</script>
<template>
  <AppDialog size="md" v-model="userStore.isCreateDialogOpen">
    <div class="space-y-3">
        <AppInputField v-model="user.fullName" size="md" label="الاسم"/>
    <div class="grid grid-cols-2 gap-3">
        <AppInputField v-model="user.email" size="md" label="البريد الالكتروني"/>
        <AppInputField v-model="user.password" size="md" label="رمز السر" type="password"/>
      </div>
        <AppAutoCompleteField v-model="user.role" label="الدور" item-label="arName" item-value="value" :items="UserRoles"/>
    <div class="grid grid-cols-2 gap-3">
        <AppAutoCompleteField v-model="user.projectId" label="المشروع" item-label="name" item-value="id"
                              get-url="projects" fetch-on-search search-key="name"
      />
        <AppInputField v-model="user.location" size="md" label="الموقع"/>
      </div>
    </div>
    <template #actions>
      <BaseButton color="primary" @click="createUser" :disabled="useAppTableStore().isLoading">
        تأكيد
      </BaseButton>
    </template>
  </AppDialog>
</template>
