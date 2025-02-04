import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // console.log("🔍 Firestore環境変数の確認:");
  // console.log("apiKey:", config.public.firebaseApiKey as string);
  // console.log("authDomain:", config.public.firebaseAuthDomain as string);
  // console.log("projectId:", config.public.firebaseProjectId as string);
  // console.log("storageBucket:", config.public.firebaseStorageBucket as string);
  // console.log("messagingSenderId:", config.public.firebaseMessagingSenderId as string);
  // console.log("appId:", config.public.firebaseAppId as string);

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string,
  };

  // Firebaseの初期化
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return {
    provide: {
      firebaseApp: app,
      firestore: db
    }
  };
});
