<script setup>
import {watch} from "vue";
import router from "@/router/index.js";

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

</template>

<style scoped>

</style>