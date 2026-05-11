import express from 'express';
import db from './database.js';
import { volumesRouter } from './volumes.js';
import { seriesRouter } from './series.js';
import { mangaRouter } from './manga.js';
import { chaptersRouter } from './chapters.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/volumes', volumesRouter);
app.use('/series', seriesRouter);
app.use('/manga', mangaRouter);
app.use('/chapters', chaptersRouter);

app.listen(PORT, (error) => {
  if (error)
    console.error(error)
  else
    console.log(`Server is running on port ${PORT}`);
});