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
  <div class="author-card-container">
    <div class="author-card" v-for="user in users" :key="user.id">
      <h3 class="author-name">{{ user.id }}. {{ user.username }}</h3>
      <div class="author-card-action-btns-container">
        <v-btn flat color="#bd3228" @click="openDeleteDialog(user.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" class="dialog" max-width="400">
    <v-card>
      <v-card-title class="dialog-title">Confirm Delete</v-card-title>
      <v-card-subtitle class="dialog-subtitle">{{ deleteUserDialogMessage }}</v-card-subtitle>
      <v-card-actions class="dialog-actions">
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
.author-card-container {
  width: 95%;
  max-width: 50%;
}

.author-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #64748b;
  margin: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(156, 163, 175, 0.4);
}

.author-name {
  font-size: 0.875rem;
}

.author-card-action-btns-container {
  display: flex;
  gap: 1rem;
}

.dialog {
  max-width: 400px;
}

.dialog-title {
  font-size: 1.5rem;
}

.dialog-subtitle {
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: 0.5rem;
  color: white;
}
</style>
