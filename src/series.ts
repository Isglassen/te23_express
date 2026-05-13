import express from "express";
import type { Manga } from "./manga.js";

export const seriesRouter = express.Router();

export interface Series {
	id: number;
	author: string;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[] // Only requested languages will be included in lists
	};
	manga: Manga[];
}

export type SeriesResponse = Omit<Series, "manga"> & { manga: number[] };

// TODO: Implementation
seriesRouter.get('/', (req, res) => {
	const { q } = req.query;
	res.send('Get all series');
});

seriesRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Get series with id ${id}`);
});

seriesRouter.post('/', (req, res) => {
	res.send('Create a new series');
});

seriesRouter.put('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Update series with id ${id}`);
});

seriesRouter.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Delete series with id ${id}`);
});

seriesRouter.get('/:id/manga', (req, res) => {
	const { id } = req.params;
	const { q } = req.query;
	res.send(`Get all manga for series with id ${id}`);
});

seriesRouter.post('/:id/manga', (req, res) => {
	const { id } = req.params;
	res.send(`Create a new manga for series with id ${id}`);
});

seriesRouter.put('/:id/manga', (req, res) => {
	const { id } = req.params;
	res.send(`Set list of manga for series with id ${id}`);
});

seriesRouter.patch('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Partially update series with id ${id}`);
});