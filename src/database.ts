import sqlite3 from "sqlite3";

export interface DBEntry {
	id: number;
	title: string;
	titles: { language: string; title: string }[];
}

export interface DBAuthorEntry extends DBEntry {
	author: string;
}

export interface DBNumberedEntry extends DBEntry {
	number: number;
}

export interface DBSeries extends DBAuthorEntry {
	manga: number[];
}

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
			title TEXT NOT NULL,
			volume_number REAL,
			chapter_count INTEGER
		);
		CREATE TABLE IF NOT EXISTS volume_titles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			language TEXT NOT NULL,
			volume_id INTEGER,
			title TEXT NOT NULL,
			FOREIGN KEY (volume_id) REFERENCES volume (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE IF NOT EXISTS manga_volume (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			index_in_manga INTEGER NOT NULL,
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

	// FIXME: Reflect new db changes

	// ! DOES NOT HANDLE TITLES, use createTitles for that
	public async createAuthorEntry(entry: Omit<DBAuthorEntry, "id" | "titles">, table: "series" | "manga"): Promise<number> {
		return await new Promise<number>((resolve, reject) => {
			this.db.run(
				`INSERT INTO ${table} (title, author) VALUES (?, ?)`,
				[entry.title, entry.author],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				}
			);
		});
	}

	public async createNumberedEntry(entry: Omit<DBNumberedEntry, "id" | "titles">, table: "volume" | "chapter"): Promise<number> {
		return await new Promise<number>((resolve, reject) => {
			this.db.run(
				`INSERT INTO ${table} (title, number) VALUES (?, ?)`,
				[entry.title, entry.number],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				}
			);
		});
	}

	public async createTitles(titles: DBEntry["titles"], id: number, table: "series" | "manga" | "volume" | "chapter"): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			this.db.run(
				`INSERT INTO ${table}_titles (language, ${table}_id, title) VALUES ${'(?, ?, ?) '.repeat(titles.length)}`,
				titles.flatMap((title) => [title.language, id, title.title]),
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async setRelations(parentTable: "series" | "manga" | "volume", childTable: "manga" | "volume" | "chapter", parentId: number, childIds: number[]): Promise<void> {
		const relationTable = `${parentTable}_${childTable}`;
		await new Promise<void>((resolve, reject) => {
			this.db.serialize(() => {
				this.db.run(
					`DELETE FROM ${relationTable} WHERE ${parentTable}_id = ? AND ${childTable}_id NOT IN (${childIds.map(() => '?').join(', ')})`,
					[parentId, ...childIds],
					function (err) {
						if (err) {
							reject(err);
						}
					}
				);
				this.db.run(
					`INSERT OR IGNORE INTO ${relationTable} (${parentTable}_id, ${childTable}_id, index_in_${parentTable}) VALUES ${childIds.map(() => '(?, ?, ?)').join(', ')}`,
					childIds.flatMap((id, index) => [parentId, id, index]),
					function (err) {
						if (err) {
							reject(err);
						}
						else {
							resolve();
						}
					}
				);
			});
		});
	}

	public async deleteEntry(id: number, table: "series" | "manga" | "volume" | "chapter"): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			this.db.run(
				`DELETE FROM ${table} WHERE id = ?`,
				[id],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async updateAuthorEntry(id: number, entry: Partial<Omit<DBAuthorEntry, "id" | "titles">>, table: "series" | "manga"): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			this.db.run(
				`UPDATE ${table} SET title = COALESCE(?, title), author = COALESCE(?, author) WHERE id = ?`,
				[entry.title, entry.author, id],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async addRelation(parentTable: "series" | "manga" | "volume", childTable: "manga" | "volume" | "chapter", parentId: number, childId: number, index?: number): Promise<void> {
		const relationTable = `${parentTable}_${childTable}`;

		if (index !== undefined) {
			return await new Promise<void>((resolve, reject) => {
				this.db.serialize(() => {
					this.db.run(
						`UPDATE ${relationTable} SET index_in_${parentTable} = index_in_${parentTable} + 1 WHERE ${parentTable}_id = ? AND index_in_${parentTable} >= ? AND ${childTable}_id != ?`,
						[parentId, index, childId],
						function (err) {
							if (err) {
								reject(err);
							}
						}
					);
					this.db.run(
						`INSERT OR IGNORE INTO ${relationTable} (${parentTable}_id, ${childTable}_id, index_in_${parentTable}) VALUES (?, ?, ?);
						UPDATE ${relationTable} SET index_in_${parentTable} = ? WHERE ${parentTable}_id = ? AND ${childTable}_id = ?;`,
						[parentId, childId, index, index, parentId, childId],
						function (err) {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						}
					);
				});
			});
		}

		await new Promise<void>((resolve, reject) => {
			this.db.run(
				`INSERT OR IGNORE INTO ${relationTable} (${parentTable}_id, ${childTable}_id, index_in_${parentTable}) VALUES (?, ?, (SELECT COALESCE(MAX(index_in_${parentTable}), -1) + 1 FROM ${relationTable} WHERE ${parentTable}_id = ?))`,
				[parentId, childId, parentId],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	public async removeRelation(parentTable: "series" | "manga" | "volume", childTable: "manga" | "volume" | "chapter", parentId: number, childId: number): Promise<void> {
		const relationTable = `${parentTable}_${childTable}`;
		await new Promise<void>((resolve, reject) => {
			this.db.run(
				`DELETE FROM ${relationTable} WHERE ${parentTable}_id = ? AND ${childTable}_id = ?`,
				[parentId, childId],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}
}

export default new Database("manga.db");