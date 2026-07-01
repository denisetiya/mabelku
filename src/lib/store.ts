import { db, schema } from './db';

export function getStoreSettings() {
  let settings = db.select().from(schema.storeSettings).get();
  if (!settings) {
    db.insert(schema.storeSettings)
      .values({ id: crypto.randomUUID() })
      .run();
    settings = db.select().from(schema.storeSettings).get()!;
  }
  return settings;
}

export function updateStoreSettings(data: Partial<typeof schema.storeSettings.$inferInsert>) {
  const current = getStoreSettings();
  db.update(schema.storeSettings)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(schema.storeSettings.id.eq(current.id))
    .run();
  return getStoreSettings();
}
