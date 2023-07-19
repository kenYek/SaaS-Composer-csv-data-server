const fs = require('fs');
const path = require('path');

async function readCSVFile() {
  try {
    // 使用await在async函式中進行非同步讀取檔案操作
    const data = await fs.promises.readFile('./csvFolder/example.csv', 'utf8');

    // 將CSV內容轉換成二維陣列
    const rows = data.trim().split('\n').map(row => row.split(','));

    // 輸出CSV內容
    // console.log('Country\tCapital\tMonday\tTuesday\tWednesday\tThursday\tFriday\tSaturday\tSunday');
    rows.forEach(row => {
      console.log(row.join('\t'));
    });
  } catch (err) {
    console.error('讀取檔案時出現錯誤：', err);
  }
}

// 呼叫async函式
readCSVFile();

async function getCsvFiles() {
    const csvFolder = './csvFolder'; // 設定csvFolder目錄路徑
  
    try {
      const files = await fs.promises.readdir(csvFolder);
  
      const csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv');
      console.log('CSV檔案列表：', csvFiles);
    } catch (err) {
      console.error('讀取目錄時出現錯誤：', err);
    }
  }

  getCsvFiles()