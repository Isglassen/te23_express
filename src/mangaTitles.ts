import express from "express";
import type { Request } from "express";

export const titlesRouter = express.Router();

titlesRouter.get('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;
	// TODO: Get list of all translated titles for manga with given id, including their own ids.
	res.status(500).json({ error: "Not implemented" });
});

titlesRouter.get('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;
	// TODO: Get a specific title for manga with given id, by title id
	res.status(500).json({ error: "Not implemented" });
});

titlesRouter.post('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;
	// TODO: Add a new title to manga with given id. (title, language, official)
	res.status(500).json({ error: "Not implemented" });
});

titlesRouter.delete('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;
	// TODO: Delete title with given id from manga with given id
	res.status(500).json({ error: "Not implemented" });
});

titlesRouter.patch('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;
	// TODO: Update title with given id for manga with given id (title, language, official)
	res.status(500).json({ error: "Not implemented" });
});