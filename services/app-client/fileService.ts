import { toFormData } from "axios";
import axiosIns from "./axios";

export class FileService {
  async uploadFile(file:File){
    if(!file) return undefined;
    const res = await axiosIns.post("/files",toFormData({
      file:file
    }))
    return res.data.path;
  }

  async uploadFiles(files:File[]){
    console.log(files);
    if(!files) return undefined;
    const formData = new FormData();
    for(let i=0;i<files.length;i++)
      formData.append('files',files[i])
    const res = await axiosIns.post("/files/multiple",formData);
    return res.data.map((f:any)=>f.path);
  }
}
