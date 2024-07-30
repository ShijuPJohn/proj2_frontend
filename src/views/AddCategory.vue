<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import axios from "axios";
import {tr} from "vuetify/locale";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const categoryName = ref('');
const categoryDesc = ref('');


onMounted(() => {
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
    name: categoryName.value,
    description: categoryDesc.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/sections', data, {headers})
    if (response.status === 201) {
      snackbarMessage.value = "Category added"
      snackbarColor.value = 'success'
      snackbar.value = true
      categoryName.value = ""
      categoryDesc.value = ""
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }

}
</script>


<template>
  <div class="root-container">
    <div class="title-text-box">Add a new category</div>
    <form class="form" method="post" action="/login" @submit.prevent="onSubmit">
      <input type="text" class="input-text" placeholder="Category Name" v-model="categoryName">
      <textarea v-model="categoryDesc" class="input-text" placeholder="Description"></textarea>
      <input type="submit" class="btn submit" value="Submit">
    </form>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>


<style scoped>
.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.root-container {
  margin-top: 5rem;
  width: 28rem;
  min-height: 55vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, .5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
}

.title-text-box {
  font-size: 1.5rem;
  font-weight: 500;
  color: #545454;
  padding: 0 .3rem;
  border-bottom: solid;
  border-color: var(--secondary-color-light);
  margin-top: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
}

.input-text {
  width: 100%;
  min-height: 4rem;
  margin: 1rem .5rem;
  padding: 1rem;
  font-size: 1.1rem;
  border-radius: 5px;
  border-width: 1px;
  border-color: #a97d96;
  border-style: solid;
  outline: none;
}

.input-text:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form .btn,
.form .btn:hover {
  height: 4rem;
  width: 100%;
  text-transform: uppercase;
  background: var(--primary-color-light);
  outline: none;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.2rem;
}


.create-account-box a,
.create-account-box a:link,
.create-account-box a:visited {
  text-decoration: none;
  color: deeppink;
  padding: .3rem .7rem;
}


</style>