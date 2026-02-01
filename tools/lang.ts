import fs from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * 目前語系
 */
const langArray = ['zh-TW', 'en-US', 'ko-KR'];

const langs = langArray.reduce((result: any, lang: string) => {
  const last = result;
  last[lang] = {};
  return last;
}, {});

const csv = fs.readFileSync('./tools/langs.csv', 'utf8');

const tableArr = parse(csv);

tableArr
  .forEach((row: string[]) => {
    const [id, ...args] = row;
    if (!id) return;
    args.forEach((element, index) => {
      const lang = langArray[index];
      if (lang === undefined || element === '' || id === '') return;
      const word = element.replace(/[\b]/g, '');
      langs[lang][id] = word;
    });
  });

const outputDir = './client/src/i18n';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

langArray.forEach((lang) => {
  fs.writeFileSync(`${outputDir}/${lang}.json`, JSON.stringify(langs[lang]));
});
