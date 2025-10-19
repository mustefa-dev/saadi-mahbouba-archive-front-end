<script setup lang="ts">
import { useUserStore } from '../stores';
import AppInputField from '~/components/app-field/AppInputField.vue';
import { UserService } from '../service';
import { UserRoles } from '~/utils/constants/enum';
import AppAutoCompleteField from '~/components/app-field/AppAutoCompleteField.vue';
const userStore = useUserStore();
userStore.editUser.projectId = userStore.editUser.project as string;
const userService = new UserService();
</script>
<template>
  <AppDialog size="md" v-model="userStore.isEditDialogOpen" title="تعديل">
    <div class="space-y-3">
      <AppInputField v-model="userStore.editUser.fullName" size="md" label="الاسم"/>
      <AppInputField v-model="userStore.editUser.email" size="md" label="البريد الالكتروني"/>
      <!--
      <AppAutoCompleteField v-if="useAppUserStore().isInRole('SuperAdmin')" v-model="userStore.editUser.projectId" label="المشروع" item-label="name" item-value="id"
        get-url="projects" fetch-on-search search-key="name"/>
      -->
      <AppAutoCompleteField 
        v-model="userStore.editUser.role" 
        size="md" 
        :items="UserRoles"
        item-label="arName"
        item-value="value"
        label="الدور"
      />
        <AppInputField v-model="userStore.editUser.location" size="md" label="الموقع"/>
    </div>
    <template #actions>
      <BaseButton color="info" @click="userService.update(userStore.editUser)">
        تأكيد
      </BaseButton>
    </template>
  </AppDialog>
</template>
