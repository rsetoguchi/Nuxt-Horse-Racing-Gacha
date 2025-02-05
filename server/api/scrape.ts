import { defineEventHandler } from 'h3';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

export default defineEventHandler(async () => {
  try {
    const [year, month, day] = new Date().toISOString().slice(0, 10).split('-');
    const formattedDate = `${year}${month}${day}`

    // 高知競馬のレース一覧ページ
    const raceListUrl = `https://nar.netkeiba.com/top/race_list.html?kaisai_id=${year}54${month}${day}&kaisai_date=${formattedDate}&rf=race_list`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // JavaScript の実行を待つ
    await page.goto(raceListUrl, { waitUntil: 'networkidle2' });

    // `JavaScript` 実行後の HTML を取得
    const content = await page.content();
    await browser.close();

    console.log(`レース一覧を取得中: ${raceListUrl}`);

    // Cheerio で HTML を解析
    const $ = cheerio.load(content);

    // 高知ファイナルレースを探す（最もレース番号が大きいレース）
    const kochiRaceList = $('dl.RaceList_DataList').filter((_, dl) =>
      $(dl).find('.RaceList_DataHeader').text().includes('高知')
    );
    const finalRace = kochiRaceList.find('.RaceList_ItemTitle:contains("ファイナルレース")').closest('.RaceList_DataItem');
    const finalRaceNumber = finalRace.find('.Race_Num').text().trim().replace('R', '');

    if (!finalRaceNumber) {
      console.log("本日は高知ファイナルレースがありません");
      return { error: '本日は高知競馬は開催されておりません' };
    }

    console.log(`高知ファイナルレースは ${finalRaceNumber}R`);

    // 高知ファイナルの出走馬リストのページURL
    const raceId = `${year}54${month}${day}${finalRaceNumber.padStart(2, '0')}`;
    const raceUrl = `https://nar.netkeiba.com/race/shutuba.html?race_id=${raceId}&rf=race_list`;

    console.log(`スクレイピング対象URL: ${raceUrl}`);

    // 出走馬名をスクレイピング
    const { data: raceData } = await axios.get(raceUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://nar.netkeiba.com/',
      }
    });

    const raceUtf8Data = iconv.decode(Buffer.from(raceData), 'EUC-JP');
    const racePage = cheerio.load(raceUtf8Data);

    // 馬名の取得
    const horses: string[] = [];
    racePage('.HorseList .HorseName').each((_, el) => {
      horses.push(racePage(el).text().trim());
    });

    if (horses.length === 0) {
      console.log("出走馬が取得できませんでした");
      return { error: '本日は高知競馬は開催されておりません' };
    }

    console.log(`horses: ${horses}`);

    return { horses };
  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return { error: 'スクレイピングに失敗しました' };
  }
});
