import { defineEventHandler } from 'h3';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

// 【共通関数】PuppeteerでページのHTMLを取得
async function fetchHtmlWithPuppeteer(url: string): Promise<string> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`Puppeteerでページ取得中: ${url}`);
    // JavaScript の実行を待つ
    await page.goto(url, { waitUntil: 'networkidle2' });

    // JavaScript 実行後の HTML を取得
    const content = await page.content();
    await browser.close();

    return content;
  } catch (error) {
    console.error(`Puppeteerエラー: ${error}`);
    throw new Error('Puppeteerでページを取得できませんでした');
  }
}

// 【共通関数】AxiosでページのHTMLを取得し、EUC-JP → UTF-8 に変換
async function fetchHtmlWithAxios(url: string): Promise<ReturnType<typeof cheerio.load>> {
  try {
    console.log(`Axiosでページ取得中: ${url}`);

    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://nar.netkeiba.com/',
      }
    });
    const utf8Data = iconv.decode(Buffer.from(data), 'EUC-JP');
  
    // Cheerio で HTML を解析して返却
    return cheerio.load(utf8Data);
  } catch (error) {
    console.error(`Axiosエラー: ${error}`);
    throw new Error('Axiosでページを取得できませんでした');
  }
}

// 【共通関数】高知ファイナルレースの番号を取得
function getFinalRaceNumber($: ReturnType<typeof cheerio.load>): string {
  const kochiRaceList = $('dl.RaceList_DataList').filter((_, dl) =>
    $(dl).find('.RaceList_DataHeader').text().includes('高知')
  );
  const finalRace = kochiRaceList.find('.RaceList_ItemTitle:contains("ファイナルレース")').closest('.RaceList_DataItem');

  // ex) "9R" → "9" の変換
  return finalRace.find('.Race_Num').text().trim().replace('R', '');
}

// 【共通関数】出走馬のリストを取得
function getHorseNames($: ReturnType<typeof cheerio.load>): string[] {
  return $('.HorseList .HorseName').map((_, el) => $(el).text().trim()).get();
}

export default defineEventHandler(async () => {
  try {
    // 日付フォーマット
    const [year, month, day] = new Date().toISOString().slice(0, 10).split('-'); // [yyyy, MM, dd]
    const formattedDate = `${year}${month}${day}`

    // 高知競馬のレース一覧ページ
    // const raceListUrl = `https://nar.netkeiba.com/top/race_list.html?kaisai_id=${year}54${month}${day}&kaisai_date=${formattedDate}&rf=race_list`;
    const raceListUrl = 'https://nar.netkeiba.com/top/race_list.html?kaisai_id=2025540205&kaisai_date=20250205&rf=race_list'; // 開催されて無い日は過去のURLを固定（開発中のみ）
    
    console.log(`高知競馬のレース一覧URL: ${raceListUrl}`);

    // 高知ファイナルレースの番号を取得
    const listHtml = await fetchHtmlWithPuppeteer(raceListUrl);
    const $listPage = cheerio.load(listHtml);
    const finalRaceNumber = getFinalRaceNumber($listPage);

    if (!finalRaceNumber) {
      console.log("高知ファイナルレースが見つかりませんでした");
      return { error: '本日は高知競馬は開催されていません' };
    }

    console.log(`高知ファイナルレース番号: ${finalRaceNumber}R`);

    // 高知ファイナル出走馬リストのページURL
    const raceId = `${year}54${month}${day}${finalRaceNumber.padStart(2, '0')}`;
    // const raceUrl = `https://nar.netkeiba.com/race/shutuba.html?race_id=${raceId}&rf=race_list`;
    const raceUrl = 'https://nar.netkeiba.com/race/shutuba.html?race_id=202554020509&rf=race_list'; // 開催されて無い日は過去のURLを固定（開発中のみ）
    console.log(`スクレイピング対象レースURL: ${raceUrl}`);

    // 出走馬名を取得
    const $racePage = await fetchHtmlWithAxios(raceUrl);
    const horses = getHorseNames($racePage);

    if (horses.length === 0) {
      console.log("出走馬が取得できませんでした");
      return { error: '本日は高知競馬は開催されておりません' };
    }

    console.log(`出走馬一覧: ${horses}`);

    return { horses };
  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return { error: 'スクレイピングに失敗しました' };
  }
});
