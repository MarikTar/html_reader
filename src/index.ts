import express from 'express';
import fetch from 'node-fetch-with-proxy';
// import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';
import { HTMLElement, Node } from 'node-html-parser';
import Scrapper from './scrapper';

const PORT = process.env.PORT || 80;
const app = express();

const censor = (key: string, value: HTMLElement) => {
  if (value.parentNode) {
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
      const scrapper = new Scrapper(href);
      const data = await fetch(href);
      const html = await data.text();
      const pageCount = scrapper.getNodeList(html, selP);
      return res.status(200).send(JSON.stringify(pageCount, censor));
    } catch (error) {
      console.log(error);
      return res.status(500).send(false);
    }
  }
  return res.status(404).send(false);
});

app.post('/singlePage/', async (req, res) => {
  const { href } = req.query;
  const body = req.body;
  if (href) {
    try {
      const scrapper = new Scrapper(href);
      const html = await scrapper.getHTML();
      const pageCount = scrapper.getNodeList(html, body);
      return res.status(200).send(JSON.stringify(pageCount, censor));
    } catch (error) {
      console.log(error);
      return res.status(500).send(false);
    }
  }
  return res.status(404).send(false);
});

app.post('/multiPages/', async (req, res) => {
  const { href } = req.query;
  const { urls, selectors } = req.body;
  if (href) {
    try {
      const scrapper = new Scrapper(href);
      console.log(selectors);
      const pageCount = await scrapper.scrapURLs(urls, selectors);
      return res.status(200).send(JSON.stringify(pageCount, censor));
    } catch (error) {
      console.log(error);
      return res.status(500).send(false);
    }
  }
  return res.status(404).send(false);
});

app.listen(PORT, () => console.log('server is running...', PORT));
