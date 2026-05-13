import express from "express";
import type { Chapter } from "./chapters.js";

export const volumesRouter = express.Router();

export interface Volume {
	id: number;
	number: number;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[] // Only requested languages will be included in lists
	};
	chapters: Chapter[];
}

export type VolumeResponse = Omit<Volume, "chapters"> & { chapters: number[] };

// TODO: Implementation
volumesRouter.get('/', (req, res) => {
	const { q } = req.query;
	res.send('Get all volumes');
});

volumesRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Get volume with id ${id}`);
});

volumesRouter.post('/', (req, res) => {
	res.send('Create a new volume');
});

volumesRouter.put('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Update volume with id ${id}`);
});

volumesRouter.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Delete volume with id ${id}`);
});

volumesRouter.get('/:id/chapters', (req, res) => {
	const { id } = req.params;
	const { q } = req.query;
	res.send(`Get all chapters for volume with id ${id}`);
});

volumesRouter.post('/:id/chapters', (req, res) => {
	const { id } = req.params;
	res.send(`Create a new chapter for volume with id ${id}`);
});

volumesRouter.put('/:id/chapters', (req, res) => {
	const { id } = req.params;
	res.send(`Set list of chapters for volume with id ${id}`);
});

volumesRouter.patch('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Partially update volume with id ${id}`);
});