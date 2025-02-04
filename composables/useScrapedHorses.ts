import { ref } from 'vue';

export function useScrapedHorses() {
  const scrapedHorseNames = ref<string[]>([]);
  // スクレイピング実行中のフラグ
  const isLoading = ref(true);

  const fetchScrapedHorses = async () => {
    try {
      isLoading.value = true; // スクレイピング開始
      const response = await fetch('/api/scrape');
      const data = await response.json();

      if (data.horses) {
        scrapedHorseNames.value = data.horses;
      } else {
        console.error('スクレイピング結果が取得できません:', data.error);
      }
    } catch (error) {
      console.error('スクレイピングAPIエラー:', error);
    } finally {
      isLoading.value = false; // スクレイピング完了
    }
  };

  return { scrapedHorseNames, isLoading, fetchScrapedHorses };
}
