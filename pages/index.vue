<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { onMounted } from 'vue';
import { useScrapedHorses } from "~/composables/useScrapedHorses";
import { useGacha } from "~/composables/useGacha";

// スクレイピングデータを取得するカスタムフック
const { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses } = useScrapedHorses(); // スクレイピングデータを取得
const { selectedHorse, isRolling, startGacha } = useGacha(scrapedHorseNames); // ガチャのロジックを適用

// ライフサイクルフック
onMounted(() => {
  console.log('ガチャページがマウントされました！');
  fetchScrapedHorses(); // ページがマウントされたらスクレイピングを実行
});
</script>

<!-- コンポーネントのビュー部分を定義 -->
<template>
  <div class="container">
    <h1 id="index-page-title">🏇 高知ファイナル 本命馬決定ガチャ 🏇</h1>

    <div class="message-area">
      <!-- スクレイピング中は「loading...」を表示 -->
      <p v-if="isLoading" class="display-loading">🔄 loading...</p>

      <!-- スクレイピング中は「loading...」を表示 -->
      <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- ガチャ結果を表示 -->
      <p v-else-if="selectedHorse">
        <span v-if="!isRolling">🎉🎉🎉 </span>
        <strong>{{ selectedHorse }}</strong>
        <span v-if="!isRolling"> 🎉🎉🎉</span>
      </p>

      <!-- ボタン押下前のテンプレート -->
      <p v-else class="placeholder">ガチャを回して結果を見よう！</p>
    </div>

    <button @click="startGacha" :disabled="isRolling || scrapedHorseNames.length === 0">
      ガチャを回す
    </button>
  </div>
</template>

<!-- コンポーネント固有のスタイルを定義 -->
<style scoped>
/* scoped属性を追加することで、このコンポーネントのスタイルが他のコンポーネントに影響を与えないようにする */

#index-page-title {
  font-size: 60px
}

/* コンテナ全体を中央に配置 */
.container {
  text-align: center;
  margin-top: 50px;
}

/* メッセージエリアの高さを固定 */
.message-area {
  min-height: 100px;
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
.placeholder {
  color: #e58be5;
}

.error-message {
  color: red;
  font-weight: bold;
}

button {
  padding: 10px 20px;
  font-size: 20px;
  cursor: pointer;
}
</style>
