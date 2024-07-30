<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const requests = ref([]);

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
onMounted(async () => {
  if (!authStore.$state || role.value !== 'librarian') {
    router.push('/unauthorized')
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get('http://localhost:5000/api/requests', {headers});
    console.log(response)
    if (response.status === 200) {
      console.log(response)
      requests.value = response.data.requests;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})
</script>

<template>
  <div class="request-card-container w-[95%] md:w-[70%]">
    <div v-for="request in requests"
         class="request-card flex justify-between items-center p-4 m-2 bg-slate-900 bg-opacity-15 border-[1px] border-slate-500">
      <div class=" w-[40%] flex flex-col">
        <p class="font-bold text-[1.2rem]">{{ request.book.title }}</p>
        <p class="font-bold text-[1.2rem]"><span class="text-[.7rem] mr-2 text-slate-500" v-for="author in request.book.authors">{{author.name}}</span></p>

      </div>
      <div class="flex justify-center items-center"><span
          class="mr-2 text-[.6rem] text-slate-500">requested by: </span>{{ request.user.username }}
      </div>
      <div class="request-card-btn-container flex gap-1">
        <v-btn flat color="green">
          <v-icon icon="mdi-check"/>
        </v-btn>
        <v-btn flat color="red">
          <v-icon icon="mdi-close"/>
        </v-btn>
      </div>
    </div>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.request-card{
}
</style>