import { AppClient } from "~/services/app-client"
import type { PaginatedResponse } from "~/utils/types/ApiResponses"
import type { User } from "../types/index.ts"
import type { IModelService } from "~/services/app-model/index.js";
import type { ParamsType } from "~/utils/types/filters.js";
import type { AxiosError } from "axios";
import { useAppCrudStore } from "~/components/app-crud/store/AppCrudStore.js";
import axiosIns from "~/services/app-client/axios.js";

type ApiError = AxiosError<PaginatedResponse<User>>
const baseURL = "users"
const appClient = new AppClient<User>();
export class UserService implements IModelService<User>{
  async getAll (params?: ParamsType){
    useAppTableStore().setLoading(true);
    try {
      const response = await appClient.get(baseURL,params??useRoute().query);
      useUserStore().users = (response.data as PaginatedResponse<User>).data;
      useAppCrudStore().pagesCount = (response.data as PaginatedResponse<User>).pagesCount;
      useAppCrudStore().currentPage = (response.data as PaginatedResponse<User>).currentPage;
    } catch (e) {
      console.error(e);
      throw new Error((e as ApiError).response?.data.message)
    } finally {
      useAppTableStore().setLoading(false);
    }
  }
  async getSingle(id: string){

  }

  async delete(data:User){
    await appClient.delete(baseURL,data.id??'')
    this.getAll();
  }

  async restore(data:User){
    await appClient.put(baseURL + '/' + data.id , {isDeleted:false})
    this.getAll();
  }

  async update(data:User){
      await appClient.put(baseURL+'/'+data.id,data);
      await this.getAll();
      useUserStore().isEditDialogOpen = false;
  }

  async changePassword(user:User,newPassword:string){
    try{
      await axiosIns.put('users/' + user.id + '/change-password',{ newPassword:newPassword})
      useUserStore().isPasswordChangeDialogOpen = false;
    }catch{
      useToast({message:'حذث خطا في تغيير كلمة السر',isError:true})
    }
  }

  async setActive(user:User,isActive:boolean){

    await axiosIns.put('users/' + user.id + '/set-active',{ isActive })

    await this.getAll();
  }

  async create(data?:User){
    if(!data)
      return;
    try{
      useAppTableStore().setLoading(true);
      await appClient.post(baseURL,data);
    }catch{
      useToast({isError:true,message:'حدث خطأ اثناء اضافة مستخدم'})
      console.log("sdasdsad")
    }
      await this.getAll();
    useUserStore().isCreateDialogOpen = false;
  }

  async changePasswordBtnAction(user:User){
      useUserStore().isPasswordChangeDialogOpen = true;
      useUserStore().editUser = user;
  }
  async reActivateBtnAction(user:User){
      useUserStore().editUser = user;
  }
  async createBtnAction(){
    useUserStore().isCreateDialogOpen = true;
  }

  async editButtonAction(data : User){
    useUserStore().editUser = data;
    useUserStore().isEditDialogOpen = true;
  }
}
