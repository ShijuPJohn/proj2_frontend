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
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }

}
</script>

<template>
  <div class="mt-20 w-72 min-h-55vh bg-white rounded-xl flex flex-col items-center justify-center p-4 shadow-custom1">
    <div class="text-2xl font-medium text-gray-600 px-1 border-b-[3px] border-secondary-light mt-4">Add a new Author
    </div>
    <form class="flex flex-col items-center w-full my-6" method="post" action="/login" @submit.prevent="onSubmit">
      <input type="text"
             class="w-full min-h-16 my-4 px-4 py-2 text-lg rounded-md border border-solid border-pink-300 focus:border-primary focus:outline-none"
             placeholder="Category Name" v-model="authorName">
      <input type="submit"
             class="h-16 w-full uppercase bg-primary-light text-white font-bold text-xl rounded-md cursor-pointer"
             value="Submit" aria-label="Submit">
    </form>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="flex justify-start">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="text-white ml-2">X</button>
  </v-snackbar>
</template>

<style scoped>

</style>