import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import request from 'request';


const PORT = process.env.PORT || 80;
const app = express();
app.use(cors({
  optionsSuccessStatus: 200,
  credentials: false,
}));

app.get('/test', async (req, res) => {
  const { href } = req.query;
  const proxy = {
    url: href,
    proxy: 'http://195.209.176.2:8080',
  };
  if (href) {
    request.get(proxy, (err, resp) => {
      if (err) {
        console.log('ERROR', err);
      } else {
        console.log('OK', resp);
      }
    });
    const data = await fetch(href);
    const html = await data.text();
    return res.status(200).send({ success: true, body: html });
  }
  return res.status(404).send({ success: false, body: '' });
});

app.get('/', async (req, res) => {
  const { href } = req.query;
  if (href) {
    const data = await fetch(href);
    const html = await data.text();
    return res.status(200).send({ success: true, body: html });
  }
  return res.status(404).send({ success: false, body: '' });
});

app.listen(PORT, () => console.log('server is running...'));
