<!-- 単一ファイルコンポーネント（SFC） ※コンポーネントのロジック（JavaScript）、テンプレート（HTML）、およびスタイル（CSS）を単一のファイルに収めたもの -->

<!-- コンポーネントのロジック部分を定義 -->
<script setup>
// setup という属性を付けることで、Vue にコンパイル時の変形操作を実行してほしいというヒントが伝えられる
// これにより、定型的な書式の少ない Composition API を利用することが可能

// インデント不要（Vue公式の推奨スタイル）→ <script setup>内のコードは 通常のJavaScriptのように記述する のが推奨されているため

import { ref, onMounted, onBeforeUnmount, onUpdated } from 'vue'
import { useNuxtApp } from "#app";
import { collection, getDocs } from "firebase/firestore";

// Firebaseの設定は plugins/firebase.tsに分けたので、useNuxtApp()を使ってプラグインを取得する
const { $firestore } = useNuxtApp();

// ref()：任意の値の型を取り、「.value」 プロパティの下で内部の値を公開するオブジェクトを作成することができる
const horseNames = ref([]);

// Firestore（Firebase）から horses コレクションのデータを取得し、horseNames 変数に格納する
const fetchHorses = async () => {
  try {
    // getDocs() は Firestore のデータを取得する関数
    // await を使うことで、Firestoreからデータを取得するのを待つ
    // Firestoreの "horses" コレクションを指定
    // $firestore は Firebase Firestoreのインスタンス
    const querySnapshot = await getDocs(collection($firestore, "horses"));

    // Firestoreのデータから name だけを取り出して、配列 horseNames.value に格納
    horseNames.value = querySnapshot.docs.map(doc => doc.data().name);

    console.log("Firestoreデータ取得成功:", horseNames.value);
  } catch (error) {
    console.error("Firestoreデータ取得エラー:", error);
  }
};

// ガチャで選ばれた馬の名前を保持する
const selectedHorse = ref(null);
// ガチャが回転中かどうかを示すフラグ（true: ガチャが回っている状態）
const isRolling = ref(false);

let timer = null;

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

// ガチャを回す処理
const startGacha = () => {
  isRolling.value = true;

  // 100ms（0.1秒）ごとにランダムな馬名を選択
  timer = setInterval(() => { // setInterval()：指定された時間間隔（ミリ秒単位）で関数またはコードスニペットを繰り返し実行する
    selectedHorse.value = horseNames.value[Math.floor(Math.random() * horseNames.value.length)];
  }, 100);

  // 2秒後にガチャを停止
  setTimeout(() => {
    // 現在動いている setInterval()を止める → 馬名がランダムに変わり続けてしまうため
    clearInterval(timer);
    timer = null;
    // ガチャの回転が終わったことを示す。falseにすることで、ボタンを再び押せる状態にする。
    isRolling.value = false;
  }, 2000);
};
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
