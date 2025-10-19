<script setup>
import { getEnumByKey,UserRoles } from '~/utils/constants/enum';
</script>
<template>
  <div class="flex items-center gap-3 mx-2">
    <BaseAvatar size="sm" class="bg-black text-white" color="dark">
      <Icon name="ph:user" />
    </BaseAvatar>
    <div class="flex flex-col">
      <span class="text-sm font-bold">{{useAppUserStore().user.fullName}}</span>
      <span class="text-xs font-bold text-muted-500">{{getEnumByKey(UserRoles,'name',useAppUserStore().user.role).arName}}</span>
    </div>
    <div class="flex">
      <BaseDropdown
        variant="text"
      >
        <BaseDropdownItem
          title="تغيير الرمز السري"
          rounded="sm"
          @click="useAppUserStore().isChangePasswordDialogOpen=true"
        />
        <BaseDropdownItem
          title="تسجيل خروج"
          rounded="sm"
          @click="useAppUserStore().logout()"
        />
      </BaseDropdown>
    </div>
  </div>
  <ChangeUserPassword/>
</template>
