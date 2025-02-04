<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { onMounted, onBeforeUnmount, onUpdated } from 'vue'
import { useHorses } from "~/composables/useHorses";
import { useGacha } from "~/composables/useGacha"

const { horseNames, fetchHorses } = useHorses();
const { selectedHorse, isRolling, startGacha } = useGacha(horseNames);

// ライフサイクルフック
// コンポーネントがマウントされた後に実行
onMounted(() => {
  fetchHorses();
  console.log('ガチャページがマウントされました！');
});

// コンポーネントの状態が更新された時に実行
onUpdated(() => {
  console.log('ページの状態が更新されました！');
});

// コンポーネントが削除される直前に実行
onBeforeUnmount(() => {
  console.log('ページがアンマウントされます...');
  // clearInterval(): setInterval()でセットしたタイマーを解除する
  if (timer) clearInterval(timer);
});
</script>

<!-- コンポーネントのビュー部分を定義 -->
<template>
  <div class="container">
    <h1>🏇 高知ファイナル 本命馬決定ガチャ 🏇</h1>

    <!-- v-if：要素を条件付きでレンダリングする -->
    <p v-if="selectedHorse">結果：<strong>{{ selectedHorse }}</strong></p>
    <button @click="startGacha" :disabled="isRolling">ガチャを回す</button>
  </div>
</template>

<!-- コンポーネント固有のスタイルを定義 -->
<style scoped>
/* scoped属性を追加することで、このコンポーネントのスタイルが他のコンポーネントに影響を与えないようにする */

.container {
  text-align: center;
  margin-top: 50px;
}

button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
