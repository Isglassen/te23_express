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
		CREATE TABLE IF NOT EXISTS manga_volumes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			volume_number REAL NOT NULL,
			chapter_count INTEGER,
			manga_id INTEGER,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE
			UNIQUE (manga_id, volume_number)
		);
		PRAGMA foreign_keys = ON;
		`);
	}

	public close() {
		this.db.close();
	}
}

const DB = new Database("manga.db");

export default DB;