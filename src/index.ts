import express from 'express';
import fetch from 'node-fetch-with-proxy';
import cors from 'cors';
import bodyParser from 'body-parser';
import { HTMLElement, Node } from 'node-html-parser';
import Scrapper from './scrapper';

const PORT = process.env.PORT || 80;
const app = express();
const scrapper = new Scrapper();

const censor = (key: string, value: HTMLElement) => {
  if (value.parentNode) {
    // eslint-disable-next-line no-param-reassign
    value.parentNode = {} as Node;
  }
  return value;
};

app.use(cors({
  optionsSuccessStatus: 200,
  credentials: false,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  const { href } = req.query;
  if (href) {
    try {
      const data = await fetch(href);
      const html = await data.text();
      return res.status(200).send({ success: true, body: html });
    } catch (error) {
      return res.status(500).send({ success: false, body: '' });
    }
  }
  return res.status(404).send({ success: false, body: '' });
});

app.post('/singlePage/', async (req, res) => {
  const { href } = req.query;
  const selP = req.body;
  if (href) {
    try {
      const data = await fetch(href);
      const html = await data.text();
      const pageCount = scrapper.getNodeList(html, selP);
      console.log('1');
      return res.status(200).send(JSON.stringify(pageCount, censor));
    } catch (error) {
      console.log(error);
      return res.status(500).send(false);
    }
  }
  return res.status(404).send(false);
});

app.post('/multiPages', async (req, res) => {
  const { urls, selectors } = req.body;
  if (urls.length > 0) {
    scrapper.clearProgress();
    try {
      console.log(selectors);
      scrapper.scrapURLs(urls, selectors);
      return res.status(200).send(true);
    } catch (error) {
      console.log(error);
      return res.status(500).send(false);
    }
  }
  return res.status(404).send(false);
});

app.get('/progress', (req, res) => {
  res.send(JSON.stringify({ progress: scrapper.progress, data: scrapper.compresedData }, censor));
  console.log('Current memory usage: %j', process.memoryUsage());
  scrapper.clearData();
});

app.get('/pull', (req, res) => {
  return res.send(JSON.stringify({ data: scrapper.compresedData }, censor));
});

app.listen(PORT, () => console.log('server is running...', PORT));
