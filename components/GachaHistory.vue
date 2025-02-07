<script setup>
defineProps({
  gachaHistory: Array,
  deleteHorse: Function,
  resetMessage: String,
  resetHistory: Function,
  gachaHistoryLength: Number
});
</script>

<template>
  <div v-if="gachaHistory.length > 0" id="history">
    <h2>ガチャ結果　※最新5件</h2>
    <ul>
      <li v-for="(horse, index) in gachaHistory" :key="index">
        {{ horse }}
        <button @click="deleteHorse(index)" id="delete-btn">削除</button>
      </li>
    </ul>
  </div>

  <!-- 全履歴リセットボタン -->
  <button v-if="gachaHistory.length > 0" @click="resetHistory" id="reset-btn">全履歴リセット</button>

  <!-- リセット後のメッセージ -->
  <p v-if="resetMessage" id="reset-message">{{ resetMessage }}</p>

  <!-- 今回はライフサイクルを学ぶため、敢えて onBeforeUpdate() を発火させる -->
  <span v-if="isResetting" style="display: none;"></span>
</template>

<style scoped>
/* ガチャ履歴 */
#history {
  margin-top: 50px;
  border-radius: 10px;
  /* border: 2px solid #FFD700; */
  color: #fff;
  text-align: center;
  max-width: 450px; /* 履歴全体を中央寄せ */
  margin-left: auto;
  margin-right: auto;
}

#history h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #FFD700;
}

#history ul {
  list-style: none;
  padding: 0;
}

#history li {
  padding: 10px 15px;
  font-size: 18px;
  border-bottom: 1px solid #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  gap: 20px; /* 馬名と削除ボタンの間隔を適度に確保 */
}

#history li:last-child {
  border-bottom: none;
}

/* 削除ボタン */
#delete-btn {
  background: transparent;
  color: red;
  border: 2px solid red;
  padding: 5px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.2s ease-in-out;
}

#delete-btn:hover {
  background: red;
  color: white;
}

/* リセットメッセージ */
#reset-message {
  color: #FFD700;
  font-size: 20px;
  text-align: center;
  margin-top: 70px;
}

/* 全履歴リセットボタン */
#reset-btn {
  display: block;
  margin: 20px auto;
  background: transparent;
  color: red;
  border: 2px solid red;
  padding: 8px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.2s ease-in-out;
}

#reset-btn:hover {
  background: red;
  color: white;
}
</style>
