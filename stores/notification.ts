export const useNotificationStore = defineStore('notification',()=>{
  const isNewNotification = ref<boolean>(true);
  return{
    isNewNotification
  }
});
