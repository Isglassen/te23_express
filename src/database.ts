import sqlite3 from "sqlite3";

export class Database {
	public db: sqlite3.Database;
	
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
			manga_id INTEGER,
			title TEXT NOT NULL,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE IF NOT EXISTS volume (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			volume_number INTEGER NOT NULL,
			chapter_count INTEGER
		);
		CREATE TABLE IF NOT EXISTS manga_volume (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			manga_id INTEGER NOT NULL,
			volume_id INTEGER NOT NULL,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (volume_id) REFERENCES volume (id) ON DELETE CASCADE ON UPDATE CASCADE,
			UNIQUE (manga_id, index_in_manga),
			UNIQUE (manga_id, volume_id)
		);
		`);
	}

	public close() {
		this.db.close();
	}
	
	public async createManga(title: string, author: string): Promise<number> {
		return new Promise((resolve, reject) => {
			this.db.run(
				"INSERT INTO manga (title, author) VALUES (?, ?)",
				[title, author],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				}
			);
		});
	}

	public async createVolume(volumeNumber: number, chapterCount: number): Promise<number> {
		return new Promise((resolve, reject) => {
			this.db.run(
				"INSERT INTO volume (volume_number, chapter_count) VALUES (?, ?)",
				[volumeNumber, chapterCount],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				}
			);
		});
	}

	public async addVolumeToManga(mangaId: number, volumeId: number): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`INSERT INTO manga_volume (manga_id, volume_id) VALUES (?, ?);`,
				[mangaId, volumeId],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async addMangaTitles(mangaId: number, titles: {lang: string, title: string}[]): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`INSERT INTO manga_titles (manga_id, language, title) VALUES ${'(?, ?, ?) '.repeat(titles.length)};`,
				titles.flatMap(( { lang, title }) => [mangaId, lang, title]),
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async clearMangaTitles(mangaId: number): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`DELETE FROM manga_titles WHERE manga_id = ?;`,
				[mangaId],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async clearMangaVolumes(mangaId: number): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`DELETE FROM manga_volume WHERE manga_id = ?;`,
				[mangaId],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async deleteManga(mangaId: number): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`DELETE FROM manga WHERE id = ?;`,
				[mangaId],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async deleteVolume(volumeId: number): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.db.run(
				`DELETE FROM volume WHERE id = ?;`,
				[volumeId],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async getAllManga(query?: string): Promise<any[]> {
		return new Promise((resolve, reject) => {
			const likeString = query ? `%${query}%` : undefined;
			this.db.all(
				`SELECT * FROM manga ${
					query
						? "WHERE title LIKE ? OR author LIKE ? OR EXISTS (SELECT 1 FROM manga_titles WHERE manga_titles.manga_id = manga.id AND manga_titles.title LIKE ?)"
						: ""
				};`,
				query ? [likeString, likeString, likeString] : [],
				(err, rows) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows);
					}
				}
			);
		});
	}
}

export default new Database("manga.db");