import express from "express";

export const chaptersRouter = express.Router();

export interface Chapter {
	id: number;
	number: number;
	titles: {
		standard: string;
		translated: { lang: string; title: string }[] // Only requested languages will be included in lists
	}
}

// TODO: Implementation
chaptersRouter.get('/', (req, res) => {
	const { q } = req.query;
	res.send('Get all chapters');
});

chaptersRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Get chapter with id ${id}`);
});

chaptersRouter.post('/', (req, res) => {
	res.send('Create a new chapter');
});

chaptersRouter.put('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Update chapter with id ${id}`);
});

chaptersRouter.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Delete chapter with id ${id}`);
});

chaptersRouter.patch('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Partially update chapter with id ${id}`);
});