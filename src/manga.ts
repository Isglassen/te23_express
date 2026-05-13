import express from "express";
import type { Volume } from "./volumes.js";

export const mangaRouter = express.Router();

export interface Manga {
	id: number;
	author: string;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[] // Only requested languages will be included in lists
	};
	volumes: Volume[];
}

export type MangaResponse = Omit<Manga, "volumes"> & { volumes: number[] };

// TODO: Implementation
mangaRouter.get('/', (req, res) => {
	const { q } = req.query;
	res.send('Get all manga');
});

mangaRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Get manga with id ${id}`);
});

mangaRouter.post('/', (req, res) => {
	res.send('Create a new manga');
});

mangaRouter.put('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Update manga with id ${id}`);
});

mangaRouter.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Delete manga with id ${id}`);
});

mangaRouter.get('/:id/volumes', (req, res) => {
	const { id } = req.params;
	const { q } = req.query;
	res.send(`Get all volumes for manga with id ${id}`);
});

mangaRouter.post('/:id/volumes', (req, res) => {
	const { id } = req.params;
	res.send(`Create a new volume for manga with id ${id}`);
});

mangaRouter.put('/:id/volumes', (req, res) => {
	const { id } = req.params;
	res.send(`Set list of volumes for manga with id ${id}`);
});

mangaRouter.patch('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Partially update manga with id ${id}`);
});