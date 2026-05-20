import express from "express";
import type { Request } from "express";
import DB from "./database.js";
import { ID_REGEX } from "./server.js";

export const volumesRouter = express.Router({mergeParams: true});

volumesRouter.get('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;

	if (!ID_REGEX.test(mangaId)) {
		res.status(400).json({ error: "Invalid manga ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);

	if (!await DB.mangaExists(mangaIdNum)) {
		res.status(404).json({ error: "Manga not found" });
		return;
	}

	const volumes = await DB.getMangaVolumes(mangaIdNum);
	res.status(200).json(volumes);
});

volumesRouter.get('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;

	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(volumeId)) {
		res.status(400).json({ error: "Invalid manga or volume ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const volumeIdNum = parseInt(volumeId, 10);

	const volume = await DB.getMangaVolume(mangaIdNum, volumeIdNum);
	if (!volume) {
		res.status(404).json({ error: "Volume not found" });
		return;
	}

	res.status(200).json(volume);
});

volumesRouter.post('/', async (req: Request<{ mangaId: string }>, res) => {
	const {mangaId} = req.params;
	
	if (!ID_REGEX.test(mangaId)) {
		res.status(400).json({ error: "Invalid manga ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);

	const body = req.body as unknown;
	if (!body || typeof body !== 'object' || body === null) {
		res.status(400).json({ error: "Invalid request body" });
		return;
	}
	if (!('volumeNumber' in body) || typeof body.volumeNumber !== 'number') {
		res.status(400).json({ error: "Missing required number field 'volumeNumber'" });
		return;
	}
	if (!('chapterCount' in body) || typeof body.chapterCount !== 'number' ||	!Number.isInteger(body.chapterCount)) {
		res.status(400).json({ error: "Missing required integer field 'chapterCount'" });
		return;
	}

	if (!await DB.mangaExists(mangaIdNum)) {
		res.status(404).json({ error: "Manga not found" });
		return;
	}

	const [volumeId] = await DB.createMangaVolumes(mangaIdNum, [{ volumeNumber: body.volumeNumber, chapterCount: body.chapterCount }]);

	res.status(201).json({ id: volumeId });
});

volumesRouter.delete('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;
	
	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(volumeId)) {
		res.status(400).json({ error: "Invalid manga or volume ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const volumeIdNum = parseInt(volumeId, 10);

	if (!await DB.getMangaVolume(mangaIdNum, volumeIdNum)) {
		res.status(404).json({ error: "Volume not found" });
		return;
	}

	await DB.deleteMangaVolume(mangaIdNum, volumeIdNum)

	res.status(204).send();
});

volumesRouter.patch('/:volumeId', async (req: Request<{ mangaId: string; volumeId: string }>, res) => {
	const { mangaId, volumeId } = req.params;
	
	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(volumeId)) {
		res.status(400).json({ error: "Invalid manga or volume ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const volumeIdNum = parseInt(volumeId, 10);

	const body = req.body as unknown;
	if (!body || typeof body !== 'object' || body === null) {
		res.status(400).json({ error: "Invalid request body" });
		return;
	}
	const updates: { volumeNumber?: number; chapterCount?: number } = {};
	if ('volumeNumber' in body) {
		if (typeof body.volumeNumber !== 'number') {
			res.status(400).json({ error: "Field 'volumeNumber' must be a number" });
			return;
		}
		updates.volumeNumber = body.volumeNumber;
	}
	if ('chapterCount' in body) {
		if (typeof body.chapterCount !== 'number' || !Number.isInteger(body.chapterCount)) {
			res.status(400).json({ error: "Field 'chapterCount' must be a integer"})
			return;
		}
		updates.chapterCount = body.chapterCount;
	}

	await DB.updateMangaVolume(mangaIdNum, volumeIdNum, updates)

	res.status(200).send(await DB.getMangaVolume(mangaIdNum, volumeIdNum));
});

// TODO: Possibly add PUT and DELETE for entire list