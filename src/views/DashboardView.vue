<script setup>
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {onMounted, watch} from "vue";
import router from "@/router/index.js";

const authStore = useAuthStore();
const {logout} = authStore;
const {loading, error, isLoggedIn} = storeToRefs(authStore)
onMounted(()=>{
  if (!authStore.$state){
    router.push('/login')
  }
})
watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/login')
  }
})
watch(
    () => authStore.$state,
    (newState) => {
      if (!newState.user || !newState.token) {
        // Redirect to login page if the store is cleared
        router.push('/login');
      }
    },
    {deep: true}
);
</script>

<template>
  User's Dashboard
</template>

<style scoped>

</style>