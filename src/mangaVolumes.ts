import express from "express";
import type { Request } from "express";

export const volumesRouter = express.Router();

volumesRouter.get('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;
	// TODO: Get list of all volumes for manga with given id, including their own ids, sorted by volume number.
	res.status(500).json({ error: "Not implemented" });
});

volumesRouter.get('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;
	// TODO: Get a specific volume for manga with given id, by volume id
	res.status(500).json({ error: "Not implemented" });
});

volumesRouter.post('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;
	// TODO: Add a new volume to manga with given id. (volumeNumber, chapterCount)
	res.status(500).json({ error: "Not implemented" });
});

volumesRouter.delete('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;
	// TODO: Delete volume with given id from manga with given id
	res.status(500).json({ error: "Not implemented" });
});

volumesRouter.patch('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;
	// TODO: Update volume with given id for manga with given id (volumeNumber, chapterCount)
	res.status(500).json({ error: "Not implemented" });
});