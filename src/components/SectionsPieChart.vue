<script setup>
import { Pie } from 'vue-chartjs';
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from "axios";
import { useAuthStore } from "@/stores/authStore.js";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { token } = storeToRefs(authStore);
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const chartData = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
    }
  ]
});

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/sections-stats', { headers });
    const data = response.data.section_stats;
    const totalCount = response.data.total_books;

    // Create a new object for chartData
    const newChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        }
      ]
    };

    // Populate the newChartData
    data.forEach(section => {
      newChartData.labels.push(section.sname);
      newChartData.datasets[0].data.push((section.book_count * 100) / totalCount);
      newChartData.datasets[0].backgroundColor.push(getRandomColor());
    });

    // Assign the new object to chartData.value
    chartData.value = newChartData;

    console.log("Updated chartData:", chartData.value);

  } catch (error) {
    console.error('Error:', error);
  }
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.label || '';
          if (context.parsed !== null) {
            label += `: ${context.parsed.toFixed(2)}%`;
          }
          return label;
        },
      },
    },
  },
};
</script>

<template>
  <div>
    <Pie :data="chartData" :options="chartOptions"/>
  </div>
</template>

<style scoped>
div {
  width: 400px;
  height: 400px;
}
</style>
