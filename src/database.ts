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
		CREATE TABLE IF NOT EXISTS series (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			author TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS series_titles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			language TEXT NOT NULL,
			series_id INTEGER,
			title TEXT NOT NULL,
			FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
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
			volume_number REAL
		);
		CREATE TABLE IF NOT EXISTS volume_titles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			language TEXT NOT NULL,
			volume_id INTEGER,
			title TEXT NOT NULL,
			FOREIGN KEY (volume_id) REFERENCES volume (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE IF NOT EXISTS chapter (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			chapter_number REAL
		);
		CREATE TABLE IF NOT EXISTS chapter_titles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			language TEXT NOT NULL,
			chapter_id INTEGER,
			title TEXT NOT NULL,
			FOREIGN KEY (chapter_id) REFERENCES chapter (id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE IF NOT EXISTS series_manga (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			index_in_series INTEGER NOT NULL,
			series_id INTEGER NOT NULL,
			manga_id INTEGER NOT NULL,
			FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE ON UPDATE CASCADE,
			UNIQUE (series_id, index_in_series),
			UNIQUE (series_id, manga_id)
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
		CREATE TABLE IF NOT EXISTS volume_chapter (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			index_in_volume INTEGER NOT NULL,
			volume_id INTEGER NOT NULL,
			chapter_id INTEGER NOT NULL,
			FOREIGN KEY (volume_id) REFERENCES volume (id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (chapter_id) REFERENCES chapter (id) ON DELETE CASCADE ON UPDATE CASCADE,
			UNIQUE (volume_id, index_in_volume),
			UNIQUE (volume_id, chapter_id)
		);
		`);
	}
}

export default new Database("manga.db");