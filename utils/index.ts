export const toShortString = (str:string,len:number,extension?:string)=>{
  return str.length>len?str.substring(0,len)+(extension??'...'):str;
}
