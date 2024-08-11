<script setup>
import {defineProps, onMounted, ref} from 'vue'
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import router from "@/router/index.js";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const dialog = ref(false);
const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  removeBookCallback: {
    type: Function,
  },
  onApprove: {
    type: Function,
  },
  onDelete: {
    type: Function,
  }
})

</script>

<template>
  <div class="request-card">
    <div class="book-image-container">
      <img :src="request.book.cover_image" alt="" class="book-image">
    </div>
    <div class="book-details">
      <p class="book-title">{{ request.book.title }}</p>
      <p class="book-authors">
        <span class="author-name" v-for="author in request.book.authors">{{ author.name }}</span>
      </p>
    </div>
    <div class="request-info">
      <span class="requested-by">requested by: </span>{{ request.user.username }}
    </div>
    <div class="request-actions">
      <v-btn v-if="role==='librarian'" flat color="green" @click="onApprove(request.id,request.user.id,request.book.id)">
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn flat color="red" @click="onDelete(request.id)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4.5rem;
  padding: 0.1rem;
  margin: 0.5rem;
  background-color: rgba(30, 41, 59, 0.15); /* Equivalent to bg-slate-900 bg-opacity-15 */
  border: 1px solid #64748b; /* Equivalent to border-slate-500 */
}

.book-image-container {
  height: 100%;
}

.book-image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.book-details {
  width: 40%;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 500; /* Equivalent to font-medium */
  font-size: 1.1rem;
}

.book-authors {
  font-size: 1.2rem;
}

.author-name {
  font-size: 0.7rem;
  margin-right: 0.5rem;
  color: #64748b; /* Equivalent to text-slate-500 */
}

.request-info {
  display: flex;
  align-items: center;
}

.requested-by {
  font-size: 0.6rem;
  color: #64748b; /* Equivalent to text-slate-500 */
  margin-right: 0.5rem;
}

.request-actions {
  display: flex;
  gap: 0.25rem; /* Equivalent to gap-1 */
}
</style>
