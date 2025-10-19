<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { LMap, LMarker, LTileLayer } from "@vue-leaflet/vue-leaflet";
import AppInputField from "./AppInputField.vue";
const props = defineProps<{
  height?:number
  label?:string
  disableInputField?:boolean
}>()
const lat = defineModel('lat',{default:33.333});
const lng = defineModel('lng',{default:44.444});
const center = ref({lat:lat.value,lng:lng.value})
const locked = ref(false);
const map = ref(null);

//onMounted(()=>{
//  if(map.value)
//  {
//    console.log(map.value);
//    if(map.value.leafletObject)
//    {
//      console.log(map.value.leafletObject);
//      console.log(map.value.leafletObject._leaflet_id);
//      map.value.leafletObject._leaflet_id = 0;
//    }
//    //map.value.leafletObject.off();
//  }
//})
watch(center,()=>{
  lat.value = center.value.lat;
  lng.value = center.value.lng;
})
</script>
<template>
  <ClientOnly>
    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2">
        <AppInputField 
          label="خط الطول"
          v-model="lat"
          :disabled="disableInputField || locked"
        />
        <AppInputField 
          label="خط العرض"
          v-model="lng"
          :disabled="disableInputField || locked"
        />
      </div>
      <div class="flex flex-col z-[100]" >
        <span v-if="label" class="font-bold">{{props.label}}</span>
        <div :style="`height: ${props.height ?? 400}px;`" class="rounded-lg" :class="locked?'locked':''">
          <LMap :useGlobalLeaflet="false" v-model:center="center" :zoom="8" ref="map" :disabled="locked">
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            >
            </LTileLayer>
            <LMarker :lat-lng="[center.lat,center.lng]"/>
          </LMap>
        </div>
      </div>
      <div class="flex justify-center">
        <BaseButton color="primary">
          تأكيد الموقع
        </BaseButton>
      </div>
    </div>
  </ClientOnly>
</template>
<style scoped lang="css">
.locked{
  position: relative;
}
.locked::after{
  content: "";
  border-radius: 22px;
  z-index: 900;
  top:0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
}
</style>
