import express from "express";

export const volumesRouter = express.Router();

export interface Volume {
	id: number;
	number: number;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[] // Only requested languages will be included in lists
	};
	chapters: number;
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

volumesRouter.patch('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Partially update volume with id ${id}`);
});