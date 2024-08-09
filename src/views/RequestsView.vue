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
const requests = ref([]);
const dialog = ref(false);
const currentRequestId = ref(0);
const currentBookId = ref(0);
const currentUserId = ref(0);
const dialogTitle = ref('');
const dialogSubtitle = ref('');
const mode = ref("delete");

const authStore = useAuthStore();
const {loading, role, error, id, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
onMounted(async () => {
  if (!authStore.$state) {
    router.push('/unauthorized')
  }
  try {
    const response = await axios.get('http://localhost:5000/api/requests', {headers});
    console.log(response)
    if (response.status === 200) {
      requests.value = response.data.requests;
    }
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
  const rid = currentRequestId.value;
  try {
    const response = await axios.delete(`http://localhost:5000/api/request_librarian/${rid}`, {headers});
    console.log(response)
    requests.value = requests.value.filter(request => request.id !== rid);
    snackbarMessage.value = "Request Deleted"
    snackbarColor.value = 'success'
    snackbar.value = true

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    dialog.value = false;
  }
}

async function onApprove() {
  const data = {
    request: currentRequestId.value,
    user: currentUserId.value,
    book: currentBookId.value
  }
  try {
    const response = await axios.post("http://localhost:5000/api/book-issue", data, {headers});
    if (response.status === 201) {
      console.log(response)
      requests.value = requests.value.filter(request => request.id !== currentRequestId.value);
      snackbarMessage.value = "Book Issued"
      snackbarColor.value = 'success'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    dialog.value = false;
  }
}

function initiateDelete(rid) {
  currentRequestId.value = rid;
  dialogTitle.value = "Confirm Delete Request";
  dialogSubtitle.value = "Are you sure you want to remove this request?"
  dialog.value = true;
  mode.value = "delete";
}

function initiateApproval(rid, uid, bid) {
  currentRequestId.value = rid;
  currentBookId.value = bid;
  currentUserId.value = uid;
  dialogTitle.value = "Confirm Approval"
  dialogSubtitle.value = "Are you sure you want to approve this request and issue book to the user?"
  dialog.value = true;
  mode.value = "approve"
}


</script>

<template>
  <div class="request-card-container w-[95%] md:w-[70%]">
    <BookStrips v-for="request in requests" :request="request" :on-approve="initiateApproval"
                :on-delete="initiateDelete"/>
  </div>

  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="headline">{{dialogTitle}}</v-card-title>
      <v-card-subtitle>{{dialogSubtitle}}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="()=>{
          if(mode==='delete'){
          onDelete();
          } else{
          onApprove();
          }
          }">Yes
        </v-btn>
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