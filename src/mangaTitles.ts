import express from "express";
import type { Request } from "express";
import DB from "./database.js";
import { ID_REGEX } from "./server.js";

export const titlesRouter = express.Router({mergeParams: true});

titlesRouter.get('/', async (req: Request<{ mangaId: string }>, res) => {
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

	const titles = await DB.getMangaTitles(mangaIdNum);
	res.status(200).json(titles);
});

titlesRouter.get('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;

	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(titleId)) {
		res.status(400).json({ error: "Invalid manga or title ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const titleIdNum = parseInt(titleId, 10);
	
	const title = await DB.getMangaTitle(mangaIdNum, titleIdNum);
	if (!title) {
		res.status(404).json({ error: "Title not found" });
		return;
	}

	res.status(200).json(title);
});

titlesRouter.post('/', async (req: Request<{ mangaId: string }>, res) => {
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
	if (!('title' in body) || typeof body.title !== 'string') {
		res.status(400).json({ error: "Missing required string field 'title'" });
		return;
	}
	if (!('lang' in body) || typeof body.lang !== 'string') {
		res.status(400).json({ error: "Missing required string field 'lang'" });
		return;
	}
	if (!('official' in body) || typeof body.official !== 'boolean') {
		res.status(400).json({ error: "Missing required boolean field 'official'" });
		return;
	}
	
	const [titleId] = await DB.createMangaTitles(mangaIdNum, [{title: body.title, lang: body.lang, official: body.official}]);

	res.status(201).json({ id: titleId });
});

titlesRouter.delete('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;

	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(titleId)) {
		res.status(400).json({ error: "Invalid manga or title ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const titleIdNum = parseInt(titleId, 10);

	if (!await DB.getMangaTitle(mangaIdNum, titleIdNum)) {
		res.status(404).json({ error: "Title not found" });
		return;
	}

	await DB.deleteMangaTitle(mangaIdNum, titleIdNum);

	res.status(200).json({ message: "Title deleted successfully" });
});

titlesRouter.patch('/:titleId', async (req: Request<{ mangaId: string; titleId: string }>, res) => {
	const { mangaId, titleId } = req.params;

	if (!ID_REGEX.test(mangaId) || !ID_REGEX.test(titleId)) {
		res.status(400).json({ error: "Invalid manga or title ID" });
		return;
	}
	const mangaIdNum = parseInt(mangaId, 10);
	const titleIdNum = parseInt(titleId, 10);
	
	const body = req.body as unknown;
	if (!body || typeof body !== 'object' || body === null) {
		res.status(400).json({ error: "Invalid request body" });
		return;
	}
	const updates: { title?: string; lang?: string; official?: boolean } = {};
	if ('title' in body) {
		if (typeof body.title !== 'string') {
			res.status(400).json({ error: "Field 'title' must be a string" });
			return;
		}
		updates.title = body.title;
	}
	if ('lang' in body) {
		if (typeof body.lang !== 'string') {
			res.status(400).json({ error: "Field 'lang' must be a string" });
			return;
		}
		updates.lang = body.lang;
	}
	if ('official' in body) {
		if (typeof body.official !== 'boolean') {
			res.status(400).json({ error: "Field 'official' must be a boolean" });
			return;
		}
		updates.official = body.official;
	}

	const title = await DB.getMangaTitle(mangaIdNum, titleIdNum);
	if (!title) {
		res.status(404).json({ error: "Title not found" });
		return;
	}

	if (!DB.getMangaTitle(mangaIdNum, titleIdNum)) {
		res.status(404).json({ error: "Title not found" });
		return;
	}

	await DB.updateMangaTitle(mangaIdNum, titleIdNum, updates);

	res.status(200).send(await DB.getMangaTitle(mangaIdNum, titleIdNum));
});

// TODO: Possibly add PUT and DELETE for entire list