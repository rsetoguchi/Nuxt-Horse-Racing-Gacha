<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { ref, onMounted } from 'vue';
import { useScrapedHorses } from "~/composables/useScrapedHorses";
import { useGacha } from "~/composables/useGacha";

// スクレイピングデータを取得するカスタムフック
const { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses } = useScrapedHorses(); // スクレイピングデータを取得
const { selectedHorse, isRolling, startGacha } = useGacha(scrapedHorseNames); // ガチャのロジックを適用

// `loading...` のアニメーション用
const msg = 'Now Loading'
const loadingText = ref(msg);
let loadingInterval = null;

// ローディングアニメーションを開始する関数
const startLoadingAnimation = () => {
  const states = [msg, `${msg}.`, `${msg}..`, `${msg}...`];
  let index = 0;
  loadingInterval = setInterval(() => {
    loadingText.value = states[index];
    index = (index + 1) % states.length; // 0,1,2,3 のループ
  }, 500);
};

// ライフサイクルフック
// コンポーネントがマウントされた後に実行
onMounted(() => {
  console.log('ガチャページがマウントされました！');

  fetchScrapedHorses(); // スクレイピングを実行
  startLoadingAnimation(); // ローディングアニメーションを開始
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
      <p v-else-if="selectedHorse">
        <span v-if="!isRolling">🎉🎉🎉 </span>
        <strong id="selected-horse-name">{{ selectedHorse }}</strong>
        <span v-if="!isRolling"> 🎉🎉🎉</span>
      </p>

      <!-- ボタン押下前のテンプレート -->
      <p v-else class="placeholder">ガチャを回して結果を見よう</p>
    </div>
    
    <div class="btn-border-gradient-wrap btn-border-gradient-wrap--gold" :class="{ 'disabled': isRolling || scrapedHorseNames.length === 0 }">
      <a class="btn btn-border-gradient" @click.prevent="startGacha">
        <span class="btn-text-gradient--gold">ガチャを回す</span>
      </a>
    </div>
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
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin: 70px 0;
}

.display-loading, .placeholder {
  font-size: 40px;
  font-weight: bold;
}

/* デフォルトのメッセージ（ボタン位置がずれないように空白を埋める） */
.placeholder, #selected-horse-name {
  font-family: 'ヒラギノ明朝 Pro W3', 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'HGS明朝E', 'ＭＳ Ｐ明朝', serif;
  padding: 1rem 2rem;
  /* color: #fff; */
  background-image: -webkit-linear-gradient(315deg, #b8751e 0%, #ffce08 37%, #fefeb2 47%, #fafad6 50%, #fefeb2 53%, #e1ce08 63%, #b8751e 100%);
  background-image: linear-gradient(135deg, #b8751e 0%, #ffce08 37%, #fefeb2 47%, #fafad6 50%, #fefeb2 53%, #e1ce08 63%, #b8751e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-message {
  color: red;
  font-weight: bold;
}

/* Now Loading... のアニメーションを適用 */
.display-loading {
  color: rgb(168, 166, 166);
  animation: fadeBlink 1.5s infinite;
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

.btn,
a.btn,
button.btn {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.5;
  position: relative;
  display: inline-block;
  padding: 1rem 4rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  color: #212529;
  border-radius: 0.5rem;
}

.btn-border-gradient-wrap {
  display: inline-block;

  padding: 0.2rem;

  border-radius: 0.5rem;
}

/* ボタンを無効化するスタイル */
.btn-border-gradient-wrap.disabled {
  pointer-events: none; /* クリックを無効化 */
  opacity: 0.5; /* 視覚的に無効化されていることを示す */
}

.btn-border-gradient-wrap--gold {
  background-image: -webkit-linear-gradient(
    315deg,
    #704308 0%,
    #ffce08 37%,
    #fefeb2 47%,
    #fafad6 50%,
    #fefeb2 53%,
    #e1ce08 63%,
    #704308 100%
  );
  background-image: linear-gradient(
    135deg,
    #704308 0%,
    #ffce08 37%,
    #fefeb2 47%,
    #fafad6 50%,
    #fefeb2 53%,
    #e1ce08 63%,
    #704308 100%
  );
}

.btn-border-gradient-wrap--gold:hover a.btn {
  text-shadow: 0 0 15px rgba(250, 250, 214, 0.5),
    0 0 15px rgba(250, 250, 214, 0.5), 0 0 15px rgba(250, 250, 214, 0.5),
    0 0 15px rgba(250, 250, 214, 0.5);
}

a.btn-border-gradient {
  font-size: 2rem;
  background: #000;
}

.btn-text-gradient--gold {
  font-family: "ヒラギノ明朝 Pro W3", "Hiragino Mincho Pro",
    "Hiragino Mincho ProN", "HGS明朝E", "ＭＳ Ｐ明朝", serif;

  background: -webkit-gradient(
    linear,
    left bottom,
    left top,
    from(#ffffdb),
    to(#a16422)
  );

  background: -webkit-linear-gradient(bottom, #ffffdb, #a16422);

  background: linear-gradient(to top, #ffffdb, #a16422);
  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;
}
</style>
