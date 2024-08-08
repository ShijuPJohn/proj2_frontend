<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "axios";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {useRoute} from "vue-router";
import router from "@/router/index.js";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const user = ref({})
const valid = ref(false);
const editProfileDialog = ref(false);
const changePasswordDialog = ref(false);
const name = ref('');
const email = ref('');
const about = ref('');
const image = ref(null);
const imageUrl = ref('');

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
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/user/`, {headers});
    console.log("response data", response.data)
    response.data.user.imageUrl = "http://localhost:5000/" + response.data.user.imageUrl
    user.value = response.data.user;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})

function initiateEdit() {
  name.value = user.value.username;
  email.value = user.value.email;
  about.value = user.value.about;
  editProfileDialog.value = true;
}

</script>

<template>
  <div class="book-details-main-container flex flex-col border-slate-500 w-[100%] md:w-[60%] mt-4">
    <div class="book-details-title-image-container flex gap-2" v-if="Object.keys(user).length > 0">
      <div class="book-details-image-container h-[10rem] p-2 border-slate-500 border-[1px] m-2">
        <img :src="user.imageUrl" alt="book cover image" class="h-full w-full">
      </div>
      <div class="book-details-title-text flex flex-col justify-space-between py-4">
        <p class="text-[1.3rem] font-medium"><span
            class="text-md-body-1 text-slate-600">Name : </span>{{ user.username }}</p>
        <p class="text-[1.2rem] font-medium"><span class="text-md-body-1 text-slate-600">Email : </span>{{ user.email }}
        </p>
        <p class="text-[1.1rem] font-medium"><span
            class="text-md-body-1 text-slate-600 w-[20rem]">About : </span>{{ user.about }}
        </p>
      </div>
    </div>
    <div class="actions-box mx-2 flex flex-col gap-2 w-[30rem] my-4 ">
      <v-btn flat color="green" @click="initiateEdit">Edit Profile</v-btn>
      <v-btn flat color="red" @click="changePasswordDialog=true">Change Password</v-btn>
    </div>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>

  <v-dialog v-model="editProfileDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Edit Profile Info:</v-card-title>
      <v-container>
        <v-form ref="form" v-model="valid" class="form">
          <v-text-field
              v-model="name"
              :rules="[v => !!v || 'Name is required', v=>v.length>3 || 'Name should be at least 3 characters']"
              variant="outlined"
              label="Name"
              floating-label
              required>

          </v-text-field>
          <v-text-field
              v-model="email"
              :rules="[v => !!v || 'Email year is required', v=>/^[^@]+@[^@]+\.[^@]+$/.test(v) || 'Enter email in the correct form']"
              variant="outlined"
              label="Email"
              floating-label
              required>
          </v-text-field>
          <v-textarea
              v-model="about"
              variant="outlined"
              label="About"
              floating-label
              required>
          </v-textarea>
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="returnBook">Yes</v-btn>
        <v-btn color="red" @click="editProfileDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>

</style>