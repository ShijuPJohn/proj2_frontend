<script setup>
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {onMounted, watch} from "vue";
import router from "@/router/index.js";

const authStore = useAuthStore();
const {logout} = authStore;
const {loading, error, role, isLoggedIn} = storeToRefs(authStore)
onMounted(() => {
  if (!authStore.$state) {
    router.push('/')
  }
})
watch(isLoggedIn, (newVal) => {
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
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
  <main>
    <div v-if="role==='librarian'" class="actions-box">
      <router-link to="/requests" class="create-book action-btn">Book Requests</router-link>
      <router-link to="/books" class="create-book action-btn">Books</router-link>
      <router-link to="/authors" class="create-book action-btn">Authors</router-link>
      <router-link to="/sections" class="create-book action-btn">Sections</router-link>
    </div>
    <div v-if="role==='user'" class="actions-box">
      <router-link to="/issued-books" class="create-book action-btn">Issued Books</router-link>
    </div>

  </main>

</template>

<style scoped>
.actions-box {
  display: flex;
  flex-direction: column;
}

.actions-box .action-btn {
  color: var(--grey-color-dark1);
  text-decoration: none;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: var(--grey-color-border1);
  margin: 1rem 0;
  padding: .5rem .8rem;
}
</style>