import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useScrapedHorses() {
  const scrapedHorseNames = ref<string[]>([]);
  // スクレイピング実行中のフラグ
  const isLoading = ref(true);
  // エラーメッセージ用
  const errorMessage = ref<string | null>(null);

  const fetchScrapedHorses = async () => {
    try {
      // スクレイピング開始
      isLoading.value = true;
      // エラーをリセット
      errorMessage.value = null;

      // APIリクエスト
      const response = await fetch('/api/scrape');
      const data = await response.json();

      if (data.horses) {
        scrapedHorseNames.value = data.horses;
      } else {
        errorMessage.value = data.error;
      }
    } catch (error) {
      errorMessage.value = 'スクレイピングに失敗しました';
    } finally {
      isLoading.value = false; // スクレイピング完了
    }
  };

  // ライフサイクルフック
  // コンポーネントがマウントされた後に実行
  onMounted(() => {
    fetchScrapedHorses();
    console.log('スクレイピングデータを取得しました！');
  });

  return { scrapedHorseNames, isLoading, errorMessage, fetchScrapedHorses };
}
