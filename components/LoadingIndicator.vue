<script setup>
defineProps({
  isLoading: Boolean,
  loadingText: String
});
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <span class="loader"><span class="loader-inner"></span></span>
    <p class="display-loading">{{ loadingText }}</p>
  </div>
</template>

<style scoped>
/* Now Loading... のアニメーションを適用 */
.display-loading {
  font-size: 40px;
  font-weight: bold;
  color: rgb(168, 166, 166);
  animation: fadeBlink 1.5s infinite;
  margin-bottom: 0;
}

/* Now Loading... の表示を調整 */
.loading-container {
  display: flex;
  flex-direction: column; /* 縦並び */
  align-items: center;
  gap: 10px;
}

/* Now Loading... を点滅させる */
@keyframes fadeBlink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Loadingアイコンのアニメーション */
.loader {
  display: inline-block;
  width: 30px;
  height: 30px;
  position: relative;
  border: 4px solid #Fff;
  top: 50%;
  animation: loader 2s infinite ease;
}

.loader-inner {
  vertical-align: top;
  display: inline-block;
  width: 100%;
  background-color: #fff;
  animation: loader-inner 2s infinite ease-in;
}

@keyframes loader {
  0% {
    transform: rotate(0deg);
  }
  
  25% {
    transform: rotate(180deg);
  }
  
  50% {
    transform: rotate(180deg);
  }
  
  75% {
    transform: rotate(360deg);
  }
  
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loader-inner {
  0% {
    height: 0%;
  }
  
  25% {
    height: 0%;
  }
  
  50% {
    height: 100%;
  }
  
  75% {
    height: 100%;
  }
  
  100% {
    height: 0%;
  }
}
</style>
