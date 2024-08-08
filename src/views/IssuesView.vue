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
    dialog.value=false;
  }
}

function deleteDialog(issueId) {
  currentIssueId.value = issueId;
  dialog.value = true;
}
</script>

<template>
  <div class="request-card-container w-[95%] md:w-[70%]">
    <div v-for="issue in issues"
         class="issue-card flex justify-between items-center h-[5rem] p-[.3rem] m-2 bg-slate-900 bg-opacity-15 border-[1px] border-slate-500">
      <div class="book-image-container h-[100%]">
        <img :src="issue.book.cover_image" alt="" class="h-full w-full object-contain">
      </div>
      <div class=" w-[35%] flex flex-col">
        <p class="font-weight-medium text-[1.2rem]">{{ issue.book.title }}</p>
        <p class="text-[1.2rem]"><span class="text-[.7rem] mr-2 text-slate-500"
                                       v-for="author in issue.book.authors">{{ author.name }}</span></p>

      </div>
      <div class="flex justify-center items-center"><span
          class="mr-2 text-[.6rem] text-slate-500">allotted to: </span>{{ issue.user.username }}
      </div>
      <div class="flex justify-center items-center"><span
          class="mr-2 text-[.9rem] text-slate-500">Issued: </span>{{
          issue.days !== 0 ? issue.days + ' days ago' : 'Today'
        }}
      </div>
      <div class="request-card-btn-container flex gap-1">

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