const express = require('express');
var cors = require('cors')
let config = require('./config.json');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

var app = express();
app.use(cors())
app.use(express.json());

const port = config.port || 3500;

async function getCsvData(req, res) {
  const data = req.body;
  const jsonData = JSON.parse(data.jsondata);
  const fileConfig = {
    file: jsonData.filename || './csvFolder/example.csv',
  };

  const r = {};
  r.errCode = 0;
  r.data = [];

  for (let c = 0; c < data.targets.length; c++) {
    if (data.targets[c].type === 'table' || data.targets[c].type === 'timeseries') {
      let csvData;
      if (data.targets[c].target.startsWith('http')) {
        try {
          const response = await axios.get(data.targets[c].target);
          csvData = response.data;
        } catch (err) {
          console.error('從URL中讀取檔案時出現錯誤：', err);
          continue; // 若讀取失敗則跳過該目標
        }
      } else {
        try {
          csvData = await fs.promises.readFile('./csvFolder/' + data.targets[c].target, 'utf8');
        } catch (err) {
          console.error('從檔案中讀取檔案時出現錯誤：', err);
          continue; // 若讀取失敗則跳過該目標
        }
      }

      // 將CSV內容轉換成二維陣列
      const csvDataRows = csvData.trim().split('\n').map(row => row.split(','));

      const item = {
        target: data.targets[c].target,
        type: data.targets[c].type,
      };

      if (data.targets[c].type === 'table') {
        item.columns = [];
        if (csvDataRows && csvDataRows.length > 0) {
          for (let i = 0; csvDataRows[0] && i < csvDataRows[0].length; i++) {
            item.columns.push({
              text: csvDataRows[0][i],
            });
          }
          csvDataRows.shift();
          item.rows = csvDataRows;
        }
      } else if (data.targets[c].type === 'timeseries') {
        item.datapoints = [];
        for (let i = 0; i < csvDataRows.length; i++) {
          if (i === 0) {
            for (let j = 0; j < csvDataRows[i].length; j++) {
              item.datapoints.push([csvDataRows[i][j], j]);
            }
          }
        }
      }

      r.data.push(item);
    }
  }

  res.json(r.data);
  res.end();
}

async function getCsvFiles(req, res) {
  const csvFolder = './csvFolder'; // 設定csvFolder目錄路徑

  try {
    const files = await fs.promises.readdir(csvFolder);

    const csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv');
    console.log('CSV檔案列表：', csvFiles);
    res.json(csvFiles);
  } catch (err) {
    console.error('讀取目錄時出現錯誤：', err);
    res.json([]);
  }
  res.end();
}

app.use('/file', express.static('csvFolder'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.all('/search', getCsvFiles);

app.post('/query', getCsvData)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})