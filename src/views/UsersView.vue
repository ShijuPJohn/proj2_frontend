<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const users = ref([]);
const currentUserId = ref(0);
const deleteConfirmDialog = ref(false);
const deleteUserDialogMessage = ref("");
const valid = ref(false);
const userName = ref('');

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
    const response = await axios.get('http://localhost:5000/api/users', {headers});
    console.log(response.data)
    users.value = response.data.users;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
watch(isLoggedIn, (newVal) => {
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})

function openDeleteDialog(aid) {
  currentUserId.value = aid
  deleteUserDialogMessage.value = "Do you really want to delete this user?";
  deleteConfirmDialog.value = true;
}


async function deleteUser() {
  try {
    const response = await axios.delete(`http://localhost:5000/api/users/${currentUserId.value}`, {headers});
    users.value = users.value.filter(user => user.id !== currentUserId.value);
    snackbarMessage.value = "User Deleted";
    snackbarColor.value = 'success';
    snackbar.value = true;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
  deleteConfirmDialog.value = false;
}

</script>

<template>
  <div class="author-card-container w-[95%] md:w-[50%]">
    <div
        class="author-card flex flex-row justify-space-between items-center border-slate-500 border-[1px] m-2 px-2 py-3 bg-slate-400 bg-opacity-40"
        v-for="user in users" :key="user.id">
      <h3 class="text-sm">{{ user.id }}. {{ user.username }}</h3>
      <div class="author-card-action-btns-container flex gap-4">
        <v-btn flat color="#bd3228" @click="openDeleteDialog(user.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-subtitle>{{ deleteUserDialogMessage }}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="deleteUser">Yes</v-btn>
        <v-btn color="red" @click="deleteConfirmDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>




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

.snackbar-close-btn {
  margin-left: auto;
  color: white;
}

.floating-action-button {
  box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
}
</style>