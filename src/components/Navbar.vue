<script setup>
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";

const authStore = useAuthStore();
const {logout} = authStore;
const {loading, error, isLoggedIn} = storeToRefs(authStore)
</script>

<template>
<header class="main-header">
<ul class="header-list">
  <li class="header-list-item"><router-link to="/" class="header-list-item-link">Home</router-link> </li>
  <li class="header-list-item"><router-link to="/contact" class="header-list-item-link">Contact</router-link> </li>
  <li class="header-list-item"><router-link to="/about" class="header-list-item-link">About</router-link> </li>
  <li class="header-list-item" v-if="!isLoggedIn"><router-link to="/login" class="header-list-item-link" >Login</router-link> </li>
  <li class="header-list-item header-list-item-link" v-else @click="logout">Log Out </li>
</ul>
</header>
</template>

<style scoped>
.main-header{
  display: flex;
  width: 100%;
  height: 5rem;
  background-color: #444444;
  justify-content: flex-end;
}
.header-list{
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
}
.header-list-item{
  margin: 1rem 2rem;
  padding: .5rem;
  border-bottom: solid;
  border-width: 2px;
  border-color: rgba(2, 2, 2, 0);
  transition: border-bottom-color;
  transition-duration: .5s;
}
.header-list-item:hover{
  border-bottom: solid;
  border-width: 2px;
  border-color: var(--secondary-color-light);
}
.header-list-item-link{
  text-decoration: none;
  font-size: 1.2rem;
  color: #68efff;
  cursor: pointer;
}
</style>