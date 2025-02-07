<script setup>
defineProps({
  errorMessage: String
});
</script>

<template>
  <p v-if="errorMessage" id="error-message">{{ errorMessage }}</p>
</template>

<style scoped>
#error-message {
  color: red;
  font-weight: bold;
}
</style>
