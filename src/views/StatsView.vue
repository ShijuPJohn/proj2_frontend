<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import SectionsPieChart from "@/components/SectionsPieChart.vue";
import RequestsBarChart from "@/components/RequestsBarChart.vue";

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
</script>
<template>
  <div class="chart-container" v-if="role==='librarian'">
    <h1>Sections Distribution</h1>
    <SectionsPieChart/>
  </div>
  <div class="chart-container" v-if="role==='librarian'">
    <h1>Number of Issues</h1>
    <RequestsBarChart/>
  </div>
</template>
<style>
.chart-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
