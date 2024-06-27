<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <div class="root-container">
    <Navbar/>
    <RouterView />
  </div>
</template>

<style scoped>
.root-container{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

</style>