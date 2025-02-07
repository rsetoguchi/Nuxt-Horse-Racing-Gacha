<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { ref, onMounted, onBeforeUpdate, onUpdated } from 'vue';
import { useScrapedHorses } from "~/composables/useScrapedHorses";
import { useGacha } from "~/composables/useGacha";

// コンポーネントのインポート
import GachaButton from "~/components/GachaButton.vue";
import GachaResult from "~/components/GachaResult.vue";

// スクレイピングデータを取得するカスタムフック
const { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses } = useScrapedHorses(); // スクレイピングデータを取得
const { selectedHorse, isRolling, startGacha } = useGacha(scrapedHorseNames); // ガチャのロジックを適用

// `loading...` のアニメーション用
const msg = 'Now Loading'
const loadingText = ref(msg);

// ローディングアニメーションを開始する関数
const startLoadingAnimation = () => {
  const states = [msg, `${msg}.`, `${msg}..`, `${msg}...`];
  let index = 0;
  setInterval(() => {
    loadingText.value = states[index];
    index = (index + 1) % states.length; // 0,1,2,3 のループ
  }, 500);
};

// ガチャ履歴（選ばれた1頭ずつ追加）
const gachaHistory = ref([]);

// ガチャ履歴の最大件数
const HISTORY_LIMIT = 5;

// ガチャ結果をローカルストレージに保存（選ばれた1頭だけ追加）
const saveToLocalStorage = (horseName) => {
  if (!horseName) return;

  console.log("選ばれた馬:", horseName);

  // すでに同じ馬が履歴にある場合は追加しない（重複防止）
  gachaHistory.value.push(horseName);

  console.log("履歴リスト:", gachaHistory.value);

  // 履歴をローカルストレージに保存
  localStorage.setItem('gachaHistory', JSON.stringify(gachaHistory.value));
};

// ガチャ履歴の削除（1件ずつ）
const deleteHorse = (index) => {
  gachaHistory.value.splice(index, 1); // 指定したインデックスの履歴を削除

  // ローカルストレージを更新
  localStorage.setItem('gachaHistory', JSON.stringify(gachaHistory.value));
};

// isRolling の変化を監視し、ガチャが止まったら履歴に追加
watch(isRolling, (newState) => {
  if (!newState && selectedHorse.value) {
    console.log("ガチャ終了！選ばれたのは:", selectedHorse.value);
    saveToLocalStorage(selectedHorse.value);
  }
});

// ガチャを回したらリセットメッセージを消す
watch(selectedHorse, () => {
  resetMessage.value = "";
});

// ローカルストレージから履歴を取得
const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('gachaHistory');
  if (savedData) {
    gachaHistory.value = JSON.parse(savedData);
    console.log("ローカルストレージから復元:", gachaHistory.value);
  }
};

// 履歴リセット時のメッセージ
const resetMessage = ref("");
// リセット処理中かどうか
const isResetting = ref(false);

// 全履歴をリセットする関数
const resetHistory = () => {
  // リセット処理開始フラグ
  isResetting.value = true;
};

// ライフサイクルフック
// コンポーネントがマウントされた後に実行
onMounted(() => {
  console.log('ガチャページがマウントされました！');

  fetchScrapedHorses(); // スクレイピングを実行
  startLoadingAnimation(); // ローディングアニメーションを開始
  loadFromLocalStorage(); // ローカルストレージの履歴を復元
});

// onBeforeUpdate()：コンポーネントがリアクティブな状態変更により「仮想DOMの更新を実行する直前」に呼び出されるフックを登録する。このフックの後、実際の DOM 更新が行われる。
// リセット確認ダイアログを出す
onBeforeUpdate(() => {
  if (isResetting.value) {
    console.log("onBeforeUpdate: 確認ダイアログを表示");
    const confirmation = window.confirm("ガチャ結果の履歴がすべて消えますがよろしいですか？");
    if (confirmation) {
      gachaHistory.value = []; // メモリ上の履歴をリセット
      localStorage.removeItem('gachaHistory'); // ローカルストレージの履歴も削除
      resetMessage.value = "ガチャ履歴をリセットしました"; // メッセージを表示
      console.log("履歴がリセットされました");
    }

    // 3秒後にメッセージを消す
    setTimeout(() => {
      resetMessage.value = "";
    }, 3000);

    isResetting.value = false; // フラグをリセット
  }
});

// onUpdated()：コンポーネントの状態が更新された時に実行
// 履歴が変更されたら最新10件に制限
onUpdated(() => {
  if (gachaHistory.value.length > HISTORY_LIMIT) {
    console.log(`履歴が${gachaHistory.value.length}件になったので、古いデータを削除します`);
    
    // 古い履歴を削除（最も古いものを削除）
    gachaHistory.value.splice(0, gachaHistory.value.length - HISTORY_LIMIT);
    
    // ローカルストレージを更新
    localStorage.setItem('gachaHistory', JSON.stringify(gachaHistory.value));
  }
});
</script>

<!-- コンポーネントのビュー部分を定義 -->
<template>
  <div class="container">
    <h1 id="index-page-title">🏇 高知ファイナル 本命馬決定ガチャ 🏇</h1>

    <div class="message-area">
      <!-- スクレイピング中は「loading...」を表示 -->
      <div v-if="isLoading" class="loading-container">
        <span class="loader"><span class="loader-inner"></span></span>
        <p class="display-loading">{{ loadingText }}</p>
      </div>

      <!-- エラーメッセージを表示 -->
      <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- ガチャ結果を表示 -->
      <GachaResult :selectedHorse="selectedHorse" :isRolling="isRolling" />
    </div>
    
    <!-- ガチャを回すボタン -->
    <GachaButton :startGacha="startGacha" :isRolling="isRolling" :isDisabled="scrapedHorseNames.length === 0" />

    <!-- ガチャ履歴表示 -->
    <div v-if="gachaHistory.length > 0" class="history">
      <h2>ガチャ結果　※最新5件</h2>
      <ul>
        <li v-for="(horse, index) in gachaHistory" :key="index">
          {{ horse }}
          <button @click="deleteHorse(index)" class="delete-btn">削除</button>
        </li>
      </ul>
    </div>

    <!-- 全履歴リセットボタン -->
    <button v-if="gachaHistory.length > 0" @click="resetHistory" class="reset-btn">全履歴リセット</button>

    <!-- リセット後のメッセージ -->
    <p v-if="resetMessage" class="reset-message">{{ resetMessage }}</p>

    <!-- 今回はライフサイクルを学ぶため、敢えて onBeforeUpdate() を発火させる -->
    <span v-if="isResetting" style="display: none;"></span>
  </div>
</template>

<!-- コンポーネント固有のスタイルを定義 -->
<style scoped>
/* scoped属性を追加することで、このコンポーネントのスタイルが他のコンポーネントに影響を与えないようにする */

/* ページ全体の背景を黒にする */
body {
  text-align: center;
  background: #000;
  background-color: black;
  color: white; /* 文字色も調整（黒背景だと見づらいため） */
}

#index-page-title {
  margin: 0;
  font-size: 60px;
  font-family: 'ヒラギノ明朝 Pro W3', 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'HGS明朝E', 'ＭＳ Ｐ明朝', serif;
  position: relative;
  padding: 1.5rem 2rem;
  -webkit-box-shadow: 0 2px 14px rgba(0, 0, 0, .1);
  box-shadow: 0 2px 14px rgba(0, 0, 0, .1);
}

#index-page-title:before,
#index-page-title:after {
  position: absolute;
  left: 0;
  width: 100%;
  height: 6px;
  content: '';
  background-image: -webkit-linear-gradient(315deg, #704308 0%, #ffce08 40%, #e1ce08 60%, #704308 100%);
  background-image: linear-gradient(135deg, #704308 0%, #ffce08 40%, #e1ce08 60%, #704308 100%);
}

#index-page-title:before {
  top: 0;
}

#index-page-title:after {
  bottom: 0;
}

/* コンテナ全体を中央に配置 */
.container {
  margin: 0;
  text-align: center;
  background-color: black;
  color: white; /* 文字色も白に */
  min-height: 100vh; /* 画面全体を黒にするため */
}

/* メッセージエリアの高さを固定 */
.message-area {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin-top: 40px;
  margin-bottom: 20px;
}

.error-message {
  color: red;
  font-weight: bold;
}

/* Now Loading... のアニメーションを適用 */
.display-loading {
  font-size: 40px;
  font-weight: bold;
  color: rgb(168, 166, 166);
  animation: fadeBlink 1.5s infinite;
  margin-bottom: 0;
}

/* `Now Loading...` の表示を調整 */
.loading-container {
  display: flex;
  flex-direction: column; /* 縦並び */
  align-items: center;
  gap: 10px;
}

/* `Now Loading...` を点滅させる */
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

/* button */
*,
*:before,
*:after {
  -webkit-box-sizing: inherit;
  box-sizing: inherit;
}

html {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 62.5%;
}

/* ガチャ履歴 */
.history {
  margin-top: 50px;
  border-radius: 10px;
  /* border: 2px solid #FFD700; */
  color: #fff;
  text-align: center;
  max-width: 450px; /* 履歴全体を中央寄せ */
  margin-left: auto;
  margin-right: auto;
}

.history h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #FFD700;
}

.history ul {
  list-style: none;
  padding: 0;
}

.history li {
  padding: 10px 15px;
  font-size: 18px;
  border-bottom: 1px solid #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  gap: 20px; /* 馬名と削除ボタンの間隔を適度に確保 */
}

.history li:last-child {
  border-bottom: none;
}

/* 削除ボタン */
.delete-btn {
  background: transparent;
  color: red;
  border: 2px solid red;
  padding: 5px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.2s ease-in-out;
}

.delete-btn:hover {
  background: red;
  color: white;
}

/* リセットメッセージ */
.reset-message {
  color: #FFD700;
  font-size: 20px;
  text-align: center;
  margin-top: 70px;
}

/* 全履歴リセットボタン */
.reset-btn {
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

.reset-btn:hover {
  background: red;
  color: white;
}
</style>
