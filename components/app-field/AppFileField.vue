<script setup lang="ts">
import { baseURL } from '~/services/app-client/axios';

const props = defineProps<{
  multiple?:boolean
  append?:boolean
}>()

const model = defineModel<(string|File)[]>();
const imagesSrc = reactive<Map<string,string>>(new Map());

const inputEle = ref();

const open = ()=>{
  inputEle.value.click();
}
const change = async (e:Event)=>{
  const target = (e.target as HTMLInputElement);

  if(!target.files?.length)
    return

  if(!props.append)
    model.value = [];

  if(!model.value) model.value = [];

  console.log(model.value);

  for(let i=0;i<target.files?.length;i++)
  {
    const src = await preview(target.files?.item(i) as File)
    imagesSrc.set(target.files.item(i)?.name??'',src??'')
    model.value?.push(target.files?.item(i) as File);
  }

  console.log(model.value);
}

const remove = (index:number)=>{
  
  model.value?.splice(index,1);

}
const preview = async (file:File) =>{

  if(!file)
    return undefined;

  let result_base64 = await new Promise((resolve) => {
    let fileReader = new FileReader();
    fileReader.onload = (_) => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });

  return result_base64 as string;
}

</script>
<template>
  <div>
    <div
      class="border-muted-300 dark:border-muted-700 hover:border-muted-400  dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-3 transition-colors duration-300"
      tabindex="0"
      role="button"
      @click="open"
    >
      <div class="p-1 text-center flex items-center flex-col gap-2">
        <img src="~/assets/images/fileupload-bg.svg" class="size-24"/>
        <h4 class="text-muted-400 font-sans text-sm">
          اسحب الملفات التي تريد رفعها
        </h4>

        <div>
          <span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase">
            او
          </span>
        </div>

        <label
          for="file"
          class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
        >
          اختر الملفات
        </label>
      </div>
    </div>
  </div>
  <div v-if="model?.length" class="mt-6 flex gap-3 items-center">
    <div v-for="(file,i) in model" class="border-accent size-24 rounded-md flex justify-center items-center" style="position: relative;">
      <img 
        v-if="typeof file != 'string'"
        class="size-full rounded-md absolute"
        :src="imagesSrc.get(file.name)"
        alt="Image preview"
      />
      <img 
        v-else
        class="size-full rounded-md absolute"
        :src="baseURL + file"
        alt="Image preview"
      />
      <div 
        class="size-full rounded-md absolute cursor-pointer"
        style="background: rgba(0,0,0,0.8);"
      />
      <Icon name="ph:trash" class="size-5  z-10 text-red-900 cursor-pointer" @click="remove(i)"/>
    </div>
  </div>
  <input 
    ref="inputEle" 
    hidden 
    type="file" 
    @change="change"
    accept='image/*' 
    :multiple
  />
</template>
