import express from "express";
import { titlesRouter } from "./mangaTitles.js";
import { volumesRouter } from "./mangaVolumes.js";
import DB from "./database.js";
import { ID_REGEX } from "./server.js";

export const mangaRouter = express.Router();

export interface Manga {
	id: number;
	author: string;
	titles: {
		standard: string;
		translated: { lang: string; title: string; official: boolean }[];
	};
	volumes: {
		volumeNumber: number;
		chapterCount: number;
	}[];
	totalChapters: number;
}

export type MangaResponse = Omit<Manga, "volumes"> & { volumes: number[] };

mangaRouter.use('/:mangaId/titles', titlesRouter);
mangaRouter.use('/:mangaId/volumes', volumesRouter);

mangaRouter.get('/', async (req, res) => {
	const { q } = req.query;
	if (q && typeof q !== 'string') {
		res.status(400).json({ error: "Query parameter 'q' must be a string" });
		return;
	}

	const results = await DB.getAllManga(q || undefined);
	const manga: Manga[] = await Promise.all(results.map(async m => {
		const volumes = await DB.getMangaVolumes(m.id)
		const titles = await DB.getMangaTitles(m.id)
		const totalChapters = volumes.reduce((prev, curr) => prev+curr.chapterCount, 0)
		return {
			id: m.id,
			author: m.author,
			titles: {
				standard: m.title,
				translated: titles
			},
			volumes: volumes,
			totalChapters: totalChapters
		} as Manga;
	}));

	res.status(200).json(manga);
});

mangaRouter.get('/:id', async (req, res) => {
	const { id } = req.params;

	if (!ID_REGEX.test(id)) {
		res.status(400).json({ error: "Invalid manga ID" });
		return;
	}
	const idNum = parseInt(id, 10);

	const manga = await DB.getManga(idNum);
	if (!manga) {
		res.status(404).json({ error: "Manga not found" });
		return;
	}

	const volumes = await DB.getMangaVolumes(idNum);
	const titles = await DB.getMangaTitles(idNum);
	const totalChapters = volumes.reduce((prev, curr) => prev+curr.chapterCount, 0)

	res.status(200).json({
		id: manga.id,
		author: manga.author,
		titles: {
			standard: manga.title,
			translated: titles,
		},
		volumes: volumes,
		totalChapters: totalChapters
	} as Manga);
});

mangaRouter.post('/', async (req, res) => {
	const body = req.body as unknown;

	if (!body || typeof body !== 'object' || body === null) {
		res.status(400).json({ error: "Invalid request body" });
		return;
	}
	if (!('author' in body) || typeof body.author !== 'string') {
		res.status(400).json({ error: "Missing required string field 'author'" });
		return;
	}
	if (!('titles' in body) || typeof body.titles !== 'object' || body.titles === null) {
		res.status(400).json({ error: "Missing required object field 'titles'" });
		return;
	}
	if (!('standard' in body.titles) || typeof body.titles.standard !== 'string') {
		res.status(400).json({ error: "Missing required string field 'titles.standard'" });
		return;
	}
	let translatedTitles: { lang: string; title: string; official: boolean }[] = [];
	if ('translated' in body.titles) {
		if (!Array.isArray(body.titles.translated)) {
			res.status(400).json({ error: "Field 'titles.translated' must be an array" });
			return;
		}
		for (const [index, title] of body.titles.translated.entries()) {
			if (typeof title !== 'object' || title === null) {
				res.status(400).json({ error: `Translated title at index ${index} must be an object` });
				return;
			}
			if (!('lang' in title) || typeof title.lang !== 'string') {
				res.status(400).json({ error: `Translated title at index ${index} is missing required string field 'lang'` });
				return;
			}
			if (!('title' in title) || typeof title.title !== 'string') {
				res.status(400).json({ error: `Translated title at index ${index} is missing required string field 'title'` });
				return;
			}
			if (!('official' in title) || typeof title.official !== 'boolean') {
				res.status(400).json({ error: `Translated title at index ${index} is missing required boolean field 'official'` });
				return;
			}
			translatedTitles.push({ lang: title.lang, title: title.title, official: title.official });
		}
	}
	let volumes: { volumeNumber: number; chapterCount: number }[] = [];
	if ('volumes' in body) {
		if (!Array.isArray(body.volumes)) {
			res.status(400).json({ error: "Field 'volumes' must be an array" });
			return;
		}
		for (const [index, volume] of body.volumes.entries()) {
			if (typeof volume !== 'object' || volume === null) {
				res.status(400).json({ error: `Volume at index ${index} must be an object` });
				return;
			}
			if (!('volumeNumber' in volume) || typeof volume.volumeNumber !== 'number') {
				res.status(400).json({ error: `Volume at index ${index} is missing required number field 'volumeNumber'` });
				return;
			}
			if (!('chapterCount' in volume) || typeof volume.chapterCount !== 'number' || !Number.isInteger(volume.chapterCount)) {
				res.status(400).json({ error: `Volume at index ${index} is missing required integer field 'chapterCount'` });
				return;
			}
			volumes.push({ volumeNumber: volume.volumeNumber, chapterCount: volume.chapterCount });
		}
	}

	const mangaId = await DB.createManga(body.titles.standard, body.author);
	const promises: Promise<number[]>[] = [];
	promises.push(DB.createMangaTitles(mangaId, translatedTitles));
	promises.push(DB.createMangaVolumes(mangaId, volumes))
	const [translatedTitleIds, volumeIds] = await Promise.all(promises);
	res.status(201).json({ id: mangaId, volumeIds, titleIds: translatedTitleIds });
});

mangaRouter.patch('/:id', async (req, res) => {
	const { id } = req.params;
	const body = req.body as unknown;
	
	if (!ID_REGEX.test(id)) {
		res.status(400).json({ error: "Invalid manga ID" });
		return;
	}
	const idNum = parseInt(id, 10);

	if (!await DB.mangaExists(idNum)) {
		res.status(404).json({ error: "Manga not found" });
		return;
	}

	if (!body || typeof body !== 'object' || body === null) {
		res.status(400).json({ error: "Invalid request body" });
		return;
	}
	let updates: { author?: string; title?: string } = {};
	if ('author' in body) {
		if (typeof body.author !== 'string') {
			res.status(400).json({ error: "Field 'author' must be a string" });
			return;
		}
		updates.author = body.author;
	}
	if ('titles' in body) {
		if (typeof body.titles !== 'object' || body.titles === null) {
			res.status(400).json({ error: "Field 'titles' must be an object" });
			return;
		}
		if ('standard' in body.titles) {
			if (typeof body.titles.standard !== 'string') {
				res.status(400).json({ error: "Field 'titles.standard' must be a string" });
				return;
			}
			updates.title = body.titles.standard;
		}
	}

	await DB.updateManga(idNum, updates);
	
	const manga = await DB.getManga(idNum);

	if (!manga) {
		res.status(500).json({ error: "Manga not found after update" });
		return;
	}

	res.status(200).send({
		id: manga.id,
		author: manga.author,
		titles: {
			standard: manga.title,
		},
	} as Omit<Manga, "volumes">);
});

mangaRouter.delete('/:id', async (req, res) => {
	const { id } = req.params;

	if (!ID_REGEX.test(id)) {
		res.status(400).json({ error: "Invalid manga ID" });
		return;
	}
	const idNum = parseInt(id, 10);

	if (!await DB.mangaExists(idNum)) {
		res.status(404).json({ error: "Manga not found" });
		return;
	}

	await DB.deleteManga(idNum);
	res.status(204).send();
});