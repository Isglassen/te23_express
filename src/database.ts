import sqlite3 from "sqlite3";

export class Database {
	public db: sqlite3.Database;
	private inTransaction: boolean = false;
	
	constructor(filename: string) {
		this.db = new sqlite3.Database(filename, (err) => {
			if (err) {
				console.error("Error opening database:", err);
			} else {
				console.log("Database opened successfully");
			}
		});
		this.initialize();
	}

	public initialize() {
		this.db.exec(`
		CREATE TABLE IF NOT EXISTS manga (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			author TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS manga_titles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			language TEXT NOT NULL,
			manga_id INTEGER NOT NULL,
			official BOOLEAN NOT NULL,
			title TEXT NOT NULL,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE IF NOT EXISTS manga_volumes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			volume_number REAL NOT NULL,
			chapter_count INTEGER NOT NULL,
			manga_id INTEGER NOT NULL,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE,
			UNIQUE (manga_id, volume_number)
		);
		PRAGMA foreign_keys = ON;
		`);
	}

	public async transaction(): Promise<void> {
		if (this.inTransaction) return;
		return new Promise((resolve, reject) => {
			this.db.run('BEGIN TRANSACTION', (err) => {
				if (err) {
					reject(err);
				} else {
					this.inTransaction = true;
					resolve();
				}
			});
		});
	}

	public async commit(): Promise<void> {
		if (!this.inTransaction) return;
		return new Promise((resolve, reject) => {
			this.db.run('COMMIT', (err) => {
				if (err) {
					reject(err);
				} else {
					this.inTransaction = false;
					resolve();
				}
			});
		});
	}

	public async rollback(): Promise<void> {
		if (!this.inTransaction) return;
		return new Promise((resolve, reject) => {
			this.db.run('ROLLBACK', (err) => {
				if (err) {
					reject(err);
				} else {
					this.inTransaction = false;
					resolve();
				}
			});
		});
	}

	public close() {
		this.db.close();
	}

	/* #region Manga */
	async mangaExists(id: number): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT 1 FROM manga WHERE id = ?', [id], (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(!!row);
				}
			});
		});
	}

	async getAllManga(query?: string): Promise<{ id: number; title: string; author: string }[]> {
		return new Promise((resolve, reject) => {
			const query_where = ' WHERE title LIKE ? OR author LIKE ? OR EXISTS (SELECT 1 FROM manga_titles WHERE manga_titles.manga_id = manga.id AND title LIKE ?)';
			const sql = `SELECT id, title, author FROM manga${query ? query_where : ''}`;
			const params = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : [];
			this.db.all(sql, params, (err, rows: { id: number; title: string; author: string }[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async getManga(id: number): Promise<{ id: number; title: string; author: string } | null> {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT id, title, author FROM manga WHERE id = ?', [id], (err, row: { id: number; title: string; author: string }) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async createManga(title: string, author: string): Promise<number> {
		return new Promise((resolve, reject) => {
			this.db.run('INSERT INTO manga (title, author) VALUES (?, ?)', [title, author], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.lastID);
				}
			});
		});
	}

	async updateManga(id: number, { title, author }: { title?: string, author?: string }): Promise<void> {
		return new Promise((resolve, reject) => {
			const fields = [];
			const params = [];
			if (title !== undefined) {
				fields.push('title = ?');
				params.push(title);
			}
			if (author !== undefined) {
				fields.push('author = ?');
				params.push(author);
			}
			if (fields.length === 0) {
				resolve();
				return;
			}
			params.push(id);
			const sql = `UPDATE manga SET ${fields.join(', ')} WHERE id = ?`;
			this.db.run(sql, params, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async deleteManga(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('DELETE FROM manga WHERE id = ?', [id], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	/* #endregion */

	/* #region Titles */
	async getMangaTitles(mangaId: number): Promise<{ id: number; lang: string; official: boolean; title: string }[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				'SELECT id, language, official, title FROM manga_titles WHERE manga_id = ?',
				[mangaId],
				(err, rows: { id: number; language: string; official: boolean; title: string }[]) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows.map(row => ({ id: row.id, lang: row.language, official: !!row.official, title: row.title })));
					}
			});
		});
	}

	async getMangaTitle(mangaId: number, titleId: number): Promise<{ id: number; lang: string; official: boolean; title: string } | null> {
		return new Promise((resolve, reject) => {
			this.db.get(
				'SELECT id, language, official, title FROM manga_titles WHERE manga_id = ? AND id = ?',
				[mangaId, titleId],
				(err, row: { id: number; language: string; official: boolean; title: string }) => {
					if (err) {
						reject(err);
					} else {
						resolve(row ? { id: row.id, lang: row.language, official: !!row.official, title: row.title } : null);
					}
			});
		});
	}

	async createMangaTitles(mangaId: number, titles: {title: string, lang: string, official: boolean}[]): Promise<number[]> {
		await this.transaction();
		const result = await new Promise<number[]>((resolve, reject) => {
			const promises: Promise<number>[] = [];
			for (const title of titles) {
				promises.push(new Promise((resolve, reject) => {
					this.db.run(
						'INSERT INTO manga_titles (manga_id, title, language, official) VALUES (?, ?, ?, ?)',
						[mangaId, title.title, title.lang, title.official],
						function(err) {
							if (err) {
								reject(err);
							} else {
								resolve(this.lastID);
							}
						}
					);
				}));
			}
			Promise.all(promises).then(resolve).catch(reject);
		});
		await this.commit();
		return result;
	}

	async updateMangaTitle(mangaId: number, titleId: number, { title, lang, official }: { title?: string; lang?: string; official?: boolean }): Promise<void> {
		return new Promise((resolve, reject) => {
			const fields = [];
			const params = [];
			if (title !== undefined) {
				fields.push('title = ?');
				params.push(title);
			}
			if (lang !== undefined) {
				fields.push('language = ?');
				params.push(lang);
			}
			if (official !== undefined) {
				fields.push('official = ?');
				params.push(official);
			}
			if (fields.length === 0) {
				resolve();
				return;
			}
			params.push(mangaId);
			params.push(titleId);
			const sql = `UPDATE manga_titles SET ${fields.join(', ')} WHERE manga_id = ? AND id = ?`;
			this.db.run(sql, params, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async deleteMangaTitle(mangaId: number, titleId: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('DELETE FROM manga_titles WHERE manga_id = ? AND id = ?', [mangaId, titleId], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	/* #endregion */

	/* #region Volumes */
	async getMangaVolumes(mangaId: number): Promise<{ id: number; volumeNumber: number; chapterCount: number }[]> {
		return new Promise((resolve, reject) => {
			this.db.all('SELECT id, volume_number, chapter_count FROM manga_volumes WHERE manga_id = ? ORDER BY volume_number ASC', [mangaId], (err, rows: { id: number; volume_number: number; chapter_count: number }[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows.map(row => ({ id: row.id, volumeNumber: row.volume_number, chapterCount: row.chapter_count })));
				}
			});
		});
	}

	async getMangaVolume(mangaId: number, volumeId: number): Promise<{ id: number; volumeNumber: number; chapterCount: number } | null> {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT id, volume_number, chapter_count FROM manga_volumes WHERE manga_id = ? AND id = ?', [mangaId, volumeId], (err, row: { id: number; volume_number: number; chapter_count: number }) => {
				if (err) {
					reject(err);
				} else {
					resolve(row ? { id: row.id, volumeNumber: row.volume_number, chapterCount: row.chapter_count } : null);
				}
			});
		});
	}

	async createMangaVolumes(mangaId: number, volumes: {volumeNumber: number, chapterCount: number}[]): Promise<number[]> {
		await this.transaction();
		const result = await new Promise<number[]>((resolve, reject) => {
			const promises: Promise<number>[] = [];
			for (const volume of volumes) {
				promises.push(new Promise((resolve, reject) => {
					this.db.run(
						'INSERT INTO manga_volumes (manga_id, volume_number, chapter_count) VALUES (?, ?, ?)',
						[mangaId, volume.volumeNumber, volume.chapterCount],
						function(err) {
							if (err) {
								reject(err);
							} else {
								resolve(this.lastID);
							}
						}
					);
				}));
			}
			Promise.all(promises).then(resolve).catch(reject);
		});
		await this.commit();
		return result;
	}

	async updateMangaVolume(mangaId: number, volumeId: number, { volumeNumber, chapterCount }: { volumeNumber?: number; chapterCount?: number }): Promise<void> {
		return new Promise((resolve, reject) => {
			const fields = [];
			const params = [];
			if (volumeNumber !== undefined) {
				fields.push('volume_number = ?');
				params.push(volumeNumber);
			}
			if (chapterCount !== undefined) {
				fields.push('chapter_count = ?');
				params.push(chapterCount);
			}
			if (fields.length === 0) {
				resolve();
				return;
			}
			params.push(mangaId);
			params.push(volumeId);
			const sql = `UPDATE manga_volumes SET ${fields.join(', ')} WHERE manga_id = ? AND id = ?`;
			this.db.run(sql, params, function(err) {
				if (err) {
					console.error(err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async deleteMangaVolume(mangaId: number, volumeId: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('DELETE FROM manga_volumes WHERE manga_id = ? AND id = ?', [mangaId, volumeId], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	/* #endregion */
}

const DB = new Database(process.env.DATABASE_PATH || "manga.db");

export default DB;