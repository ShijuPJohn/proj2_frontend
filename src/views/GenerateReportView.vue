<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import {ref} from "vue";

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

async function triggerGenerate() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.post(`http://localhost:5000/api/export-csv`, {}, {headers});
    snackbarMessage.value = "Generating CSV file. Will be mailed when finished."
    snackbarColor.value = 'success'
    snackbar.value = true

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

</script>

<template>
  <div class="root-container">
    <button class="trigger-btn" @click="triggerGenerate">
      Request CSV report
    </button>
  </div>


  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.root-container {
  width: 100%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.trigger-btn {
  border-color: #2c3e50;
  padding: 1rem 2rem;
  background-color: #0056b3;
  color: white;
  font-size: 1.5rem;
  display: flex;
}
.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: auto;
  color: white;
}


</style>