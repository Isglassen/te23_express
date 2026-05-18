import express from "express";
import { titlesRouter } from "./mangaTitles.js";
import { volumesRouter } from "./mangaVolumes.js";
import DB from "./database.js";

export const mangaRouter = express.Router();

export interface Manga {
	id: number;
	author: string;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[]
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
	// TODO: Get list of all manga, optionally filtered by search query (matches any title, both standard and translated)
	res.status(500).json({ error: "Not implemented" });
});

mangaRouter.get('/:id', async (req, res) => {
	// TODO: Get detailed manga information, including all translated titles and volumes
	res.status(500).json({ error: "Not implemented" });
});

mangaRouter.post('/', async (req, res) => {
	// TODO: Create new manga with given properties (author, standard title, optional list of translated titles and volumes)
	res.status(500).json({ error: "Not implemented" });
});

mangaRouter.patch('/:id', async (req, res) => {
	const { id } = req.params;
	// TODO: Partially update base manga properties (author, standard title). Translated titles and volumes will be updated in their respective routes
	res.status(500).json({ error: "Not implemented" });
});

mangaRouter.delete('/:id', async (req, res) => {
	const { id } = req.params;
	// TODO: Delete manga
	res.status(500).json({ error: "Not implemented" });
});