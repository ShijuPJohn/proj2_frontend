<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import axios from "axios";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {useRoute} from "vue-router";
import router from "@/router/index.js";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, id, token} = storeToRefs(authStore);
const {logout} = authStore;
const user = ref({})
const valid = ref(false);
const editProfileDialog = ref(false);
const changePasswordDialog = ref(false);
const name = ref('');
const email = ref('');
const about = ref('');
const image = ref(null);
const imageUrl = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
const rules = reactive({
  required: value => !!value || 'Required.',

  min: v => v.length >= 6 || 'Password must be at least 6 characters',
  uppercase: v => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  lowercase: v => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  special: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Password must contain a special character',
  emailMatch: () => 'The email and password you entered don\'t match'
});
const passwordRules = [
  rules.required,
  rules.min,
  rules.uppercase,
  rules.lowercase,
  rules.special,
];
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

  try {
    const response = await axios.get(`http://localhost:5000/api/user/`, {headers});
    user.value = response.data.user;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})

function initiateEdit() {
  console.log(user.value)
  name.value = user.value.username;
  email.value = user.value.email;
  about.value = user.value.about;
  imageUrl.value = user.value.imageUrl;
  editProfileDialog.value = true;
}

function toggleShowCurrentPassword() {
  showCurrentPassword.value = !showCurrentPassword.value;
}

function toggleShowNewPassword() {
  showNewPassword.value = !showNewPassword.value;
}

async function handleImageUpload() {
  const formData = new FormData();
  formData.append('image', image.value);
  try {
    const response = await axios.post('http://localhost:5000/api/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token.value}`
      }
    });
    imageUrl.value = `/static/uploads/user_thumbs/${response.data.filename}`;
    snackbarMessage.value = "Cover Image uploaded successfully";
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to cover Image. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function handleEdit() {
  const data = {username: name.value, email: email.value, about: about.value, imageUrl: imageUrl.value}
  try {
    const response = await axios.put(`http://localhost:5000/api/users/${id.value}`, data, {headers});
    console.log(response.data)
    user.value = response.data.user;
    snackbarMessage.value = "Profile info updated";
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to update profile. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    editProfileDialog.value = false;
  }
}

async function changePassword() {
  const data = {current_password: currentPassword.value, new_password: newPassword.value}
  try {
    const response = await axios.put(`http://localhost:5000/api/users-password/${id.value}`, data, {headers});
    snackbarMessage.value = "Password updated. Please login with the new password";
    setTimeout(logout, 1500);
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    changePasswordDialog.value = false;
  }
}
</script>

<template>
  <div class="book-details-main-container flex flex-col border-slate-500 w-[100%] md:w-[60%] mt-4">
    <div class="book-details-title-image-container flex gap-2" v-if="Object.keys(user).length > 0">
      <div class="book-details-image-container h-[10rem] p-2 border-slate-500 border-[1px] m-2">
        <img :src="'http://localhost:5000'+user.imageUrl" alt="book cover image" class="h-full w-full">
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
              :disabled="role==='librarian'"
              :rules="[v => !!v || 'Email is required', v=>/^[^@]+@[^@]+\.[^@]+$/.test(v) || 'Enter email in the correct form']"
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
          <v-file-input
              accept="image/*"
              label="Profile Pic"
              class="file-input"
              v-model="image"
              @change="handleImageUpload"
          ></v-file-input>
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="handleEdit">Submit</v-btn>
        <v-btn color="red" @click="editProfileDialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="changePasswordDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Change Password:</v-card-title>
      <v-container>
        <v-form ref="form" v-model="valid" class="form">
          <v-text-field
              v-model="currentPassword"
              :rules="[v => !!v || 'Password is required']"
              variant="outlined"
              :type="showCurrentPassword ? 'text' : 'password'"
              :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="toggleShowCurrentPassword"
              label="Current Password"
              floating-label
              required>

          </v-text-field>
          <v-text-field
              class="input-text"
              v-model="newPassword"
              :rules="passwordRules"
              :type="showNewPassword ? 'text' : 'password'"
              :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="toggleShowNewPassword"
              variant="outlined"
              label="New Password"
              floating-label
              required
          ></v-text-field>
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="changePassword">Submit</v-btn>
        <v-btn color="red" @click="changePasswordDialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  color: #ffffff;
  margin-left: 0.5rem;
}

</style>