<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import BookStrips from "@/components/BookStrips.vue";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const issues = ref([]);
const dialog = ref(false);
const currentIssueId = ref(-1);

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
onMounted(async () => {
  if (!authStore.$state) {
    router.push('/unauthorized')
  }
  try {
    const response = await axios.get('http://localhost:5000/api/issues', {headers});
    console.log(response)
    issues.value = response.data.issues.map(issue => {
      const issuedDate = new Date(issue.date_time_issued);
      const currentDate = new Date();
      const timeDifference = currentDate - issuedDate;
      const daysElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      console.log(issue.date_time_issued)
      return {...issue, days: daysElapsed}
    });

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

async function onDelete() {

  try {
    const response = await axios.put(`http://localhost:5000/api/return-book-iid/${currentIssueId.value}`, {}, {headers});
    console.log(response)
    issues.value = issues.value.filter(issue => issue.id !== currentIssueId.value);
    snackbarMessage.value = "Request Deleted";
    snackbarColor.value = 'success';
    snackbar.value = true

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    dialog.value = false;
  }
}

function deleteDialog(issueId) {
  currentIssueId.value = issueId;
  dialog.value = true;
}
</script>

<template>
  <div class="request-card-container">
    <div v-for="issue in issues"
         class="issue-card">
      <div class="book-image-container">
        <img :src="issue.book.cover_image" alt="" class="book-image">
      </div>
      <router-link :to="`/book-details/${issue.book.id}/${issue.book.title}`" tag="div" class="book-info">

        <p class="book-title">{{ issue.book.title }}</p>
        <p class="book-authors">
          <span class="author-name" v-for="author in issue.book.authors">
            {{ author.name }}
          </span>
        </p>

      </router-link>
      <div class="user-info"><span class="label">allotted to: </span>{{ issue.user.username }}
      </div>
      <div class="issued-info"><span class="label">Issued: </span>{{ issue.days !== 0 ? issue.days + ' days ago' : 'Today' }}
      </div>
      <div class="request-card-btn-container">
        <v-btn flat color="red" @click="deleteDialog(issue.id)">
          <v-icon icon="mdi-close"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Force-Return?</v-card-title>
      <v-card-subtitle>Are you sure you want force-return from the user?</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="onDelete">Yes</v-btn>
        <v-btn color="red" @click="dialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.request-card-container {
  width: 95%;
}

@media (min-width: 768px) {
  .request-card-container {
    width: 70%;
  }
}

.issue-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
  padding: 0.3rem;
  margin: 0.5rem;
  background-color: rgba(31, 41, 55, 0.15);
  border: 1px solid #6b7280;
}

.book-image-container {
  height: 100%;
}

.book-image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.book-info {
  width: 35%;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 500;
  font-size: 1.2rem;
}

.book-authors {
  font-size: 1.2rem;
}

.author-name {
  font-size: 0.7rem;
  margin-right: 0.5rem;
  color: #6b7280;
}

.user-info,
.issued-info {
  display: flex;
  align-items: center;
}

.label {
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.request-card-btn-container {
  display: flex;
  gap: 0.25rem;
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
