import * as SQLite from "expo-sqlite";

export async function getDb() {
  const db = await SQLite.openDatabaseAsync("species.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS observations (
      clientId    TEXT PRIMARY KEY,
      speciesName TEXT NOT NULL,
      lat         REAL NOT NULL,
      lng         REAL NOT NULL,
      notedAt     INTEGER NOT NULL,
      mediaUri    TEXT,          -- caminho local do arquivo
      mediaType   TEXT,          -- "image" | "video"
      storageId   TEXT,          -- preenchido após upload (evita re-upload)
      synced      INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS runs (
     clientId            TEXT PRIMARY KEY,
     observationClientId TEXT NOT NULL,
     ordem               INTEGER NOT NULL,
     temperatura         REAL NOT NULL,
     desempenho          REAL,
     synced              INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

export async function saveLocal(obs: any) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO observations
     (clientId, speciesName, lat, lng, notedAt, mediaUri, mediaType, storageId, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      obs.clientId,
      obs.speciesName,
      obs.lat,
      obs.lng,
      obs.notedAt,
      obs.mediaUri ?? null,
      obs.mediaType ?? null,
      obs.storageId ?? null,
    ],
  );
}

export async function getPending() {
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM observations WHERE synced = 0`);
}

export async function setStorageId(clientId: any, storageId: any) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE observations SET storageId = ? WHERE clientId = ?`,
    [storageId, clientId],
  );
}

export async function markSynced(clientId: any) {
  const db = await getDb();
  await db.runAsync(`UPDATE observations SET synced = 1 WHERE clientId = ?`, [
    clientId,
  ]);
}
