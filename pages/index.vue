<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { onMounted } from 'vue'
import { useScrapedHorses } from "~/composables/useScrapedHorses";
import { useGacha } from "~/composables/useGacha"

// スクレイピングデータを取得するカスタムフック
const { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses } = useScrapedHorses(); // スクレイピングデータを取得
const { selectedHorse, isRolling, startGacha } = useGacha(scrapedHorseNames); // ガチャのロジックを適用

// ライフサイクルフック
// 初回ページ読み込み時にスクレイピング実行
onMounted(() => {
  // ページがマウントされたらスクレイピングデータを取得
  console.log('ガチャページがマウントされました！');
});
</script>

<!-- コンポーネントのビュー部分を定義 -->
<template>
  <div class="container">
    <h1>🏇 高知ファイナル 本命馬決定ガチャ 🏇</h1>

    <!-- スクレイピング中は「loading...」を表示 -->
    <h2 v-if="isLoading" class="display-loading">🔄 loading...</h2>

    <!-- エラーメッセージの表示 -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- スクレイピングが完了したらボタンを表示 -->
    <template v-else>
      <!-- ガチャ結果を表示 -->
      <!-- v-if：要素を条件付きでレンダリングする -->
      <p v-if="selectedHorse">
        <span v-if="!isRolling">結果：</span><strong>{{ selectedHorse }}</strong>
      </p>
      <button @click="startGacha" :disabled="isRolling || scrapedHorseNames.length === 0">
        ガチャを回す
      </button>
    </template>
  </div>
</template>

<!-- コンポーネント固有のスタイルを定義 -->
<style scoped>
/* scoped属性を追加することで、このコンポーネントのスタイルが他のコンポーネントに影響を与えないようにする */

/* コンテナ全体を中央に配置 */
.container {
  text-align: center;
  margin-top: 50px;
}

.display-loading {
  padding: 10px 20px;
  margin-top: 20px;
}

.error-message {
  color: red;
  font-weight: bold;
}

button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 50px;
}
</style>
