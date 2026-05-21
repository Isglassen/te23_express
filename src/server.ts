import express from 'express';
import db from './database.js';
import { mangaRouter } from './manga.js';

export const ID_REGEX = /^\d+$/;

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/manga', mangaRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).send({ status: 400, message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, (error) => {
  if (error)
    console.error(error)
  else
    console.log(`Server is running on port ${PORT}`);
});

app.once("close", () => {
  db.close();
})