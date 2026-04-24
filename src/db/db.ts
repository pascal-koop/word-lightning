import Dexie, { type EntityTable } from "dexie";
import { QUESTIONS } from "../game/questions";

export type QuestionRecord = {
  id: number;
  text: string;
};

export type SettingRecord = {
  key: string;
  value: string;
};

export type QuestionSource = "default" | "custom" | "both";

export const SETTINGS_KEYS = {
  questionSource: "questionSource",
} as const;

const LEGACY_KEYS = {
  useDefaultQuestions: "useDefaultQuestions",
} as const;

export function isQuestionSource(value: string): value is QuestionSource {
  return value === "default" || value === "custom" || value === "both";
}

export class WordLightningDB extends Dexie {
  defaultQuestions!: EntityTable<QuestionRecord, "id">;
  customQuestions!: EntityTable<QuestionRecord, "id">;
  settings!: EntityTable<SettingRecord, "key">;

  constructor() {
    super("WordLightningDB");
    this.version(1).stores({
      defaultQuestions: "++id, &text",
      customQuestions: "++id, &text",
      settings: "&key",
    });
  }
}

export const db = new WordLightningDB();

export async function seedDefaultQuestions() {
  const count = await db.defaultQuestions.count();
  if (count > 0) return;

  const rows = QUESTIONS.map((text) => ({ text }));
  await db.defaultQuestions.bulkAdd(rows as QuestionRecord[]);
}

async function migrateLegacySettings() {
  const legacy = await db.settings.get(LEGACY_KEYS.useDefaultQuestions);
  if (!legacy) return;

  const migratedValue: QuestionSource =
    legacy.value === "false" ? "custom" : "default";

  await db.transaction("rw", db.settings, async () => {
    await db.settings.put({
      key: SETTINGS_KEYS.questionSource,
      value: migratedValue,
    });
    await db.settings.delete(LEGACY_KEYS.useDefaultQuestions);
  });
}

export async function ensureInitialSettings() {
  const existing = await db.settings.get(SETTINGS_KEYS.questionSource);
  if (existing) return;

  await db.settings.put({
    key: SETTINGS_KEYS.questionSource,
    value: "default" satisfies QuestionSource,
  });
}

export async function initializeDatabase() {
  await seedDefaultQuestions();
  await migrateLegacySettings();
  await ensureInitialSettings();
}
