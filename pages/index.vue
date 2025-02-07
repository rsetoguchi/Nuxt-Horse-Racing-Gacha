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
import LoadingIndicator from "~/components/LoadingIndicator.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import GachaHistory from "~/components/GachaHistory.vue";

// スクレイピングデータを取得するカスタムフック
const { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses } = useScrapedHorses(); // スクレイピングデータを取得
const { selectedHorse, isRolling, startGacha } = useGacha(scrapedHorseNames); // ガチャのロジックを適用

// Now Loading... のアニメーション用
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
      <!-- スクレイピング中は「Now Loading...」を表示 -->
      <LoadingIndicator :isLoading="isLoading" :loadingText="loadingText" />

      <!-- エラーメッセージを表示 -->
      <ErrorMessage :errorMessage="errorMessage" />

      <!-- ガチャ結果を表示 -->
      <GachaResult :selectedHorse="selectedHorse" :isRolling="isRolling" />
    </div>
    
    <!-- ガチャを回すボタン -->
    <GachaButton :startGacha="startGacha" :isRolling="isRolling" :isDisabled="scrapedHorseNames.length === 0" />

    <!-- ガチャ履歴表示 -->
    <GachaHistory :gachaHistory="gachaHistory" :deleteHorse="deleteHorse" :resetMessage="resetMessage" :resetHistory="resetHistory" :gachaHistoryLength="gachaHistory.length" :isResetting="isResetting" />
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
</style>
