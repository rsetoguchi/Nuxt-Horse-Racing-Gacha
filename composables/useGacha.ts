import { ref } from 'vue'

export function useGacha(horseNames: Ref<string[]>) { // horseNamesに型を指定する
  // ガチャで選ばれた馬の名前を保持する
  const selectedHorse = ref<string | null>(null); // 型を string | null にする
  // ガチャが回転中かどうかを示すフラグ（true: ガチャが回っている状態）
  const isRolling = ref(false);
  // setInterval() のタイマーIDを格納し、管理するための変数
  let timer: number | null = null; // 型を number | null にする

  // ガチャを回す処理
  const startGacha = () => {
    isRolling.value = true;

    // 100ms（0.1秒）ごとにランダムな馬名を選択
    // window.setInterval() を使えば、ブラウザ（Nuxt3）環境で number を返すため型エラーが解消する
    timer = window.setInterval(() => { // setInterval()：指定された時間間隔（ミリ秒単位）で関数またはコードスニペットを繰り返し実行する
      selectedHorse.value = horseNames.value[Math.floor(Math.random() * horseNames.value.length)];
    }, 100);

    // 2秒後にガチャを停止
    setTimeout(() => {
      if (timer !== null) {
        // 現在動いている setInterval()を止める → 馬名がランダムに変わり続けてしまうため
        clearInterval(timer);
        timer = null;
        // ガチャの回転が終わったことを示す。falseにすることで、ボタンを再び押せる状態にする
        isRolling.value = false;
      }
    }, 2000);
  };

  return { selectedHorse, isRolling, startGacha };
}
