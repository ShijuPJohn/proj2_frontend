<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore.js';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const { logout } = authStore;
const { loading,role, error, isLoggedIn, token } = storeToRefs(authStore);
</script>

<template>
  <header class="flex items-center justify-between w-full h-20 bg-gray-700 px-4">
    <router-link to="/" class="flex items-center text-white text-4xl">
      <img src="./../assets/images/books.png" alt="logo" class="h-8 mr-2 mt-1">
      E-Library
    </router-link>
    <ul class="flex items-center text-white">
      <li class="header-list-item">
        <router-link to="/" class="text-lg text-cyan-400">Home</router-link>
      </li>
      <li v-if="isLoggedIn" class="header-list-item">
        <router-link to="/dashboard">Dashboard</router-link>
      </li>
      <li class="header-list-item">
        <router-link to="/contact">Contact</router-link>
      </li>
      <li class="header-list-item">
        <router-link to="/about">About</router-link>
      </li>
      <li v-if="!isLoggedIn" class="header-list-item">
        <router-link to="/login" class="text-lg text-cyan-400">Login</router-link>
      </li>
      <li v-else @click="logout" class="header-list-item cursor-pointer">Log Out</li>
    </ul>
  </header>
</template>

<style scoped>
.header-list-item {
  @apply text-lg text-cyan-400 mx-8 my-4 py-2 border-b-2 border-transparent transition duration-500 hover:border-secondary-color-light;
}
</style>
