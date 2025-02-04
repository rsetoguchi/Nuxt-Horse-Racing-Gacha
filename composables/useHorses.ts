import { ref } from 'vue'
// useNuxtApp()：Nuxt3 のプラグインやグローバルなインスタンスにアクセスするための関数
// つまり、Nuxt3内で登録されたプラグイン（Firebase等）を取得するために使用する
import { useNuxtApp } from "#app";
import { collection, getDocs } from "firebase/firestore";

export function useHorses() {
  // Firebaseの設定は plugins/firebase.tsに分けたので、useNuxtApp()を使ってプラグインを取得する
  const { $firestore } = useNuxtApp();

  // ref()：任意の値の型を取り、「.value」 プロパティの下で内部の値を公開するオブジェクトを作成することができる
  const horseNames = ref<string[]>([]);

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

  return { horseNames, fetchHorses };
}
