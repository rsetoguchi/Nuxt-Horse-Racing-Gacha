<script setup>
defineProps({
  selectedHorse: String,
  isRolling: Boolean,
  isLoading: Boolean
});
</script>

<template>
  <p v-if="selectedHorse">
    <span v-if="!isRolling">🎉🎉🎉 </span>
    <strong id="selected-horse-name">{{ selectedHorse }}</strong>
    <span v-if="!isRolling"> 🎉🎉🎉</span>
  </p>
  
  <p v-else class="placeholder">ガチャを回して結果を見よう</p>
</template>

<style scoped>
#selected-horse-name, .placeholder {
  font-family: 'ヒラギノ明朝 Pro W3', 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'HGS明朝E', 'ＭＳ Ｐ明朝', serif;
  padding: 1rem 2rem;
  background-image: -webkit-linear-gradient(315deg, #b8751e 0%, #ffce08 37%, #fefeb2 47%, #fafad6 50%, #fefeb2 53%, #e1ce08 63%, #b8751e 100%);
  background-image: linear-gradient(135deg, #b8751e 0%, #ffce08 37%, #fefeb2 47%, #fafad6 50%, #fefeb2 53%, #e1ce08 63%, #b8751e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.placeholder {
  min-height: 50px;
  font-size: 35px;
  font-weight: bold;
  margin: 0;
}
</style>
