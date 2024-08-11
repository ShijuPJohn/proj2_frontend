<script setup>
import {storeToRefs} from 'pinia';
import {useAuthStore} from '@/stores/authStore.js';

const authStore = useAuthStore();
const { logout } = authStore;
const { loading,role, error, isLoggedIn, token } = storeToRefs(authStore);
</script>

<template>
  <header class="header-container">
    <router-link to="/" class="logo-container">
      <img src="./../assets/images/books.png" alt="logo" class="logo-image">
      E-Library
    </router-link>
    <ul class="nav-list">
      <li class="nav-item">
        <router-link to="/" class="nav-link nav-link-home">Home</router-link>
      </li>
      <li v-if="isLoggedIn" class="nav-item">
        <router-link to="/dashboard">Dashboard</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/contact">Contact</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/about">About</router-link>
      </li>
      <li v-if="!isLoggedIn" class="nav-item">
        <router-link to="/login" class="nav-link nav-link-login">Login</router-link>
      </li>
      <li v-else @click="logout" class="nav-item nav-item-logout">Log Out</li>
    </ul>
  </header>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 80px;
  background-color: #374151;
  padding: 0 16px;
}

.logo-container {
  display: flex;
  align-items: center;
  color: white;
  font-size: 2.25rem;
}

.logo-image {
  height: 32px;
  margin-right: 8px;
  margin-top: 4px;
}

.nav-list {
  display: flex;
  align-items: center;
  color: white;
}

.nav-item {
  margin: 16px 32px;
  padding: 8px 0;
  border-bottom: 2px solid transparent ;

  transition: border-color 0.5s;
}

.nav-link {
  color: #00bcd4;
  font-size: 1.125rem;
  text-decoration: none;
}

.nav-link-home {
  /* Additional styles for the home link */
}

.nav-link-login {
  /* Additional styles for the login link */
}

.nav-item-logout {
  cursor: pointer;
}

.nav-item:hover {
  border-bottom-color: var(--secondary-color-light);
}
li{
  list-style: none;
}
</style>
