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
  <div
      class="request-card flex justify-between items-center h-[4.5rem] p-[.1rem] m-2  bg-slate-900 bg-opacity-15 border-[1px] border-slate-500">
    <div class="book-image-container h-[100%]">
      <img :src="request.book.cover_image" alt="" class="h-full w-full object-contain">
    </div>
    <div class=" w-[40%] flex flex-col">
      <p class="font-medium text-[1.1rem]">{{ request.book.title }}</p>
      <p class="text-[1.2rem]"><span class="text-[.7rem] mr-2 text-slate-500"
                                     v-for="author in request.book.authors">{{ author.name }}</span></p>

    </div>
    <div class="flex justify-center items-center"><span
        class="mr-2 text-[.6rem] text-slate-500">requested by: </span>{{ request.user.username }}
    </div>
    <div class="request-card-btn-container flex gap-1">
      <v-btn v-if="role==='librarian'" flat color="green" @click="onApprove(request.id,request.user.id,request.book.id)">
        <v-icon icon="mdi-check"/>
      </v-btn>
      <v-btn flat color="red" @click="onDelete(request.id)">
        <v-icon icon="mdi-close"/>
      </v-btn>
    </div>
  </div>

</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #64748b;
  background-color: rgba(30, 41, 59, 0.05);
  height: 22rem;
  width: 13rem;
  padding: 0.5rem;
}

.book-image {

  height: 55%;
}

.image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.book-title {
  text-align: center;
}

.book-author {
  font-size: 0.7rem;
  color: #64748b;
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  color: #ffffff;
  margin-left: 0.5rem;
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
