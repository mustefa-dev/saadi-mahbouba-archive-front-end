<script setup lang="ts">
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import TairoCollapseLayout from '~/layers/tairo-layout-collapse/components/TairoCollapseLayout.vue';
import { baseURL } from '~/services/app-client/axios';

let connection : HubConnection;

const showToast = (data:any)=>{
  useToast({
    title:'لدريك رسالة جديدة',message:data.comment??'مرفق',icon:'ph:chat-centered-light',
    onClick:()=>{
      useRouter().push('/tickets/'+data.ticketId)
    }
  })
}
watch(()=>useAppUserStore().user,()=>{
  if(useAppUserStore().user)

    if(connection) connection.stop();

  connection = new HubConnectionBuilder()
    .withUrl(baseURL+`ticketsHub?userId=${useAppUserStore().user.id}`,{
      accessTokenFactory: ()=>{return 'Bearer' + useAppUserStore().user.token}
    })
    .build();

  connection.on('PublicComment',(data)=>{

    console.log(data);


    useNotificationStore().isNewNotification = true;
    if(useRoute().fullPath.includes('tickets/')&&data.ticketId===useRoute().params.id) return;
    showToast(data);
  })
  connection.start();

},{immediate:true})
</script>

<template>
  <div style="zoom: 90%;">
  <TairoCollapseLayout>
    <slot />
  </TairoCollapseLayout>
  </div>
</template>
