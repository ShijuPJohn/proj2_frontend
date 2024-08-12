<script setup>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartData = {
  labels: [
    'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
    'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'
  ],
  datasets: [
    {
      label: 'Books Issued',
      backgroundColor: '#42A5F5',
      data: [5, 10, 7, 3, 15, 8, 12, 6, 9, 14], // Dummy data points
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      beginAtZero: true
    },
    y: {
      beginAtZero: true
    }
  }
};
</script>
<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
/* Optionally style your chart */
</style>