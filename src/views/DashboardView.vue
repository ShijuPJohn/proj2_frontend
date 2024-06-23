<script setup>
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {watch} from "vue";
import router from "@/router/index.js";

const authStore = useAuthStore();
const {logout} = authStore;
const {loading, error, isLoggedIn} = storeToRefs(authStore)
watch(isLoggedIn, (newVal) => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
})
</script>

<template>
User's Dashboard
</template>

<style scoped>

</style>