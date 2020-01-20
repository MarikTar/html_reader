import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const PORT = process.env.PORT || 80;
const app = express();
app.use(cors({
  optionsSuccessStatus: 200,
  credentials: false,
}));

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
