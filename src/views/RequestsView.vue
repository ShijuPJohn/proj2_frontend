<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import {da} from "vuetify/locale";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const requests = ref([]);

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
onMounted(async () => {
  if (!authStore.$state || role.value !== 'librarian') {
    router.push('/unauthorized')
  }
  try {
    const response = await axios.get('http://localhost:5000/api/requests', {headers});
    console.log(response)
    if (response.status === 200) {
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

  async function onDelete(rid) {

  try {
    const response = await axios.delete(`http://localhost:5000/api/request_librarian/${rid}`, {headers});
    if (response.status === 200) {
      console.log(response)
      requests.value = requests.value.filter(request => request.id !== rid);
      snackbarMessage.value = "Request Deleted"
      snackbarColor.value = 'success'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function onApprove(rid, uid, bid) {
  const data = {
    request: rid,
    user: uid,
    book: bid
  }
  try {
    const response = await axios.post("http://localhost:5000/api/book-issue", data, {headers});
    if (response.status === 201) {
      console.log(response)
      requests.value = requests.value.filter(request => request.id !== rid);
      snackbarMessage.value = "Book Issued"
      snackbarColor.value = 'success'
      snackbar.value = true
    }
  } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
      snackbarColor.value = 'error'
      snackbar.value = true
  }
}
</script>

<template>
  <div class="request-card-container w-[95%] md:w-[70%]">
    <div v-for="request in requests"
         class="request-card flex justify-between items-center p-4 m-2 bg-slate-900 bg-opacity-15 border-[1px] border-slate-500">
      <div class=" w-[40%] flex flex-col">
        <p class="font-bold text-[1.2rem]">{{ request.book.title }}</p>
        <p class="font-bold text-[1.2rem]"><span class="text-[.7rem] mr-2 text-slate-500"
                                                 v-for="author in request.book.authors">{{ author.name }}</span></p>

      </div>
      <div class="flex justify-center items-center"><span
          class="mr-2 text-[.6rem] text-slate-500">requested by: </span>{{ request.user.username }}
      </div>
      <div class="request-card-btn-container flex gap-1">
        <v-btn flat color="green" @click="onApprove(request.id,request.user.id,request.book.id)">
          <v-icon icon="mdi-check"/>
        </v-btn>
        <v-btn flat color="red" @click="onDelete(request.id)">
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
.request-card {
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  color: #ffffff;
  margin-left: 0.5rem;
}
</style>