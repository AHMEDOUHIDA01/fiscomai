import { openDB, type IDBPDatabase } from "idb";
import type { ProgressState } from "../engine/progress/state";
import type { ProgressEvent } from "../engine/progress/reducer";

/**
 * Seule porte d'accès aux données. En v1 : IndexedDB sur l'appareil.
 * En v2 : une implémentation distante (Netlify Functions) avec la même interface.
 */
export interface Repository {
  load(): Promise<ProgressState | null>;
  save(state: ProgressState): Promise<void>;
  /** File d'événements à synchroniser plus tard avec le serveur (v2). */
  enqueue(event: ProgressEvent, at: number): Promise<void>;
  clear(): Promise<void>;
}

const DB_NAME = "okiks";
const STATE_KEY = "progress";

export class IndexedDbRepository implements Repository {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore("state");
        db.createObjectStore("outbox", { autoIncrement: true });
      },
    });
  }

  async load() {
    return ((await (await this.db).get("state", STATE_KEY)) as ProgressState | undefined) ?? null;
  }

  async save(state: ProgressState) {
    await (await this.db).put("state", state, STATE_KEY);
  }

  async enqueue(event: ProgressEvent, at: number) {
    if (event.type === "tick") return;
    const db = await this.db;
    await db.add("outbox", { event, at });
    // On garde la file bornée tant qu'il n'y a pas de serveur pour la vider.
    const count = await db.count("outbox");
    if (count > 2000) {
      const tx = db.transaction("outbox", "readwrite");
      let cursor = await tx.store.openCursor();
      for (let i = 0; cursor && i < count - 2000; i++) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      await tx.done;
    }
  }

  async clear() {
    const db = await this.db;
    await db.clear("state");
    await db.clear("outbox");
  }
}

/** Repli en mémoire si IndexedDB est indisponible (navigation privée stricte). */
export class MemoryRepository implements Repository {
  private state: ProgressState | null = null;
  async load() {
    return this.state;
  }
  async save(state: ProgressState) {
    this.state = state;
  }
  async enqueue() {}
  async clear() {
    this.state = null;
  }
}

export async function createRepository(): Promise<Repository> {
  try {
    if (typeof indexedDB === "undefined") throw new Error("no idb");
    const repo = new IndexedDbRepository();
    await repo.load();
    return repo;
  } catch {
    return new MemoryRepository();
  }
}
