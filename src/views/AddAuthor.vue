<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import axios from "axios";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const authorName = ref('');

onMounted(() => {
  console.log(role.value)
  if (!authStore.$state || role.value !== 'librarian') {
    router.push('/unauthorized')
  }
})
watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})
async function onSubmit() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  const data = {
    name: authorName.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/authors', data, {headers})
    if (response.status === 201) {
      snackbarMessage.value = "Author added"
      snackbarColor.value = 'success'
      snackbar.value = true
      authorName.value = ""
    }
  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }

}
</script>

<template>
  <div class="add-author-container">
    <div class="title">Add a new Author</div>
    <form class="form" method="post" action="/login" @submit.prevent="onSubmit">
      <input type="text" class="input-text" placeholder="Category Name" v-model="authorName">
      <input type="submit" class="submit-button" value="Submit" aria-label="Submit">
    </form>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.add-author-container {
  margin-top: 5rem;
  width: 18rem;
  min-height: 55vh;
  background-color: white;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, 0.5);
}

  .title {
    font-size: 1.5rem;
    font-weight: 500;
    color: #4B5563;
    padding: 0 0.25rem;
    border-bottom: 3px solid var(--secondary-color-light);
    margin-top: 1rem;
  }

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
}

.input-text {
  width: 100%;
  min-height: 4rem;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  font-size: 1.125rem;
  border-radius: 0.375rem;
  border: 1px solid #f472b6;
}

.input-text:focus {
  border-color: var(--primary-color);
  outline: none;
}

.submit-button {
  height: 4rem;
  width: 100%;
  text-transform: uppercase;
  background-color: var(--primary-color-light);
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  color: white;
  margin-left: 0.5rem;
}
</style>