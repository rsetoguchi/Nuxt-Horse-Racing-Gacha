import { defineEventHandler } from 'h3';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

export default defineEventHandler(async () => {
  try {
    const url = 'https://nar.netkeiba.com/race/shutuba.html?race_id=202554020410';

    // HTMLをバイナリデータで取得（エンコーディング設定なし）
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer', // バイナリとして取得（文字化けを防止）
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // ブラウザからのアクセスに見せかける（スクリプトからのアクセスは bot と見なされることがあるため）
        'Referer': 'https://www.netkeiba.com/', // 「netkeiba.com からの遷移」と認識され、アクセスしやすくなる
      }
    });

    // `EUC-JP` → `UTF-8` に変換
    const utf8Data = iconv.decode(Buffer.from(data), 'EUC-JP');

    // Cheerio で HTML を解析
    const $ = cheerio.load(utf8Data);

    // cheerio を使い HTML から馬の名前を抽出し、horses 配列に格納する
    const horses: string[] = []; // string[] 型で定義
    $('.HorseList .HorseName').each((_, el) => { // クラス名が HorseList の中にある HorseName 要素を全て取得し、eachでループし HorseName 要素を処理
      horses.push($(el).text().trim()); // $(el).text() で馬名のテキストを取得し、.trim()で不要な空白や改行を削除。pushで horses 配列に追加
    });

    console.log('取得した馬名:', horses);
    return { horses };
  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return { error: 'スクレイピングに失敗しました' };
  }
});
