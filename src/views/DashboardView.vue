<script setup>
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import ProfileView from "@/views/ProfileView.vue";
import AuthorsView from "@/views/AuthorsView.vue";
import SectionsView from "@/views/SectionsView.vue";
import RequestsView from "@/views/RequestsView.vue";
import UsersView from "@/views/UsersView.vue";
import StatsView from "@/views/StatsView.vue";
import CreatedBooksView from "@/views/CreatedBooksView.vue";
import IssuesView from "@/views/IssuesView.vue";

const authStore = useAuthStore();
const {logout} = authStore;
const {loading, error, role, isLoggedIn} = storeToRefs(authStore)
const selectedPanel = ref(0);
onMounted(() => {
  if (!authStore.$state) {
    router.push('/')
  }
  if(localStorage.getItem("selectedPanel")){
    selectedPanel.value = parseInt(localStorage.getItem("selectedPanel"));
  }
})
watch(isLoggedIn, (newVal) => {
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})
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

function selectComponent(num) {
  selectedPanel.value = num
  localStorage.setItem("selectedPanel", selectedPanel.value.toString());
}
</script>

<template>
  <div  class="dashboard-root-container w-full h-full flex">
    <div class="dashboard-side-panel h-[100vh] w-[10rem] flex flex-col sticky left-0 top-0">
      <button @click="selectComponent(0)" class="action-btn" :class="selectedPanel===0?'selected-action-btn':null">
        Profile
      </button>
      <button v-if="role==='librarian'" @click="selectComponent(1)" class="action-btn" :class="selectedPanel===1?'selected-action-btn':null">
        Authors
      </button>
      <button v-if="role==='librarian'" @click="selectComponent(2)" class="action-btn" :class="selectedPanel===2?'selected-action-btn':null">
        Sections
      </button>
      <button v-if="role==='librarian'" @click="selectComponent(3)" class="action-btn" :class="selectedPanel===3?'selected-action-btn':null">Books
      </button>
      <button  @click="selectComponent(4)" class="action-btn" :class="selectedPanel===4?'selected-action-btn':null">
        Requests
      </button>
      <button v-if="role==='librarian'" @click="selectComponent(5)" class="action-btn" :class="selectedPanel===5?'selected-action-btn':null">Users
      </button>
      <button @click="selectComponent(6)" class="action-btn" :class="selectedPanel===6?'selected-action-btn':null">Stats
      </button>
      <button @click="selectComponent(7)" class="action-btn" :class="selectedPanel===7?'selected-action-btn':null">Issues
      </button>
    </div>
    <div class="dashboard-main-panel flex-grow flex justify-center">
      <ProfileView v-if="selectedPanel===0"/>
      <AuthorsView v-if="selectedPanel===1"/>
      <SectionsView v-if="selectedPanel===2"/>
      <CreatedBooksView v-if="selectedPanel===3"/>
      <RequestsView v-if="selectedPanel===4"/>
      <UsersView v-if="selectedPanel===5"/>
      <StatsView v-if="selectedPanel===6"/>
      <IssuesView v-if="selectedPanel===7"/>
    </div>
  </div>
<!--  <div v-if="role==='user'" class="actions-box">-->
<!--    <router-link to="/issued-books" class="create-book action-btn">Issued Books</router-link>-->
<!--  </div>-->
</template>

<style scoped>
.dashboard-side-panel {
  background-color: #3c5066;
}

.actions-box {
  display: flex;
  flex-direction: column;
}

.action-btn {
  text-decoration: none;
  border: none;
  border-bottom-style: solid;
  border-width: 1px;
  border-color: var(--grey-color-border1);
  color: white;
  font-size: .9rem;
  padding: 1rem;
  transition: background-color 0.2s;
}

.selected-action-btn {
  background-color: #17334b;
}

.action-btn:hover {
  background-color: #1e2832;
}
</style>