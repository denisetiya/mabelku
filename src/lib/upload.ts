import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = './public/uploads';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

mkdirSync(UPLOAD_DIR, { recursive: true });

export interface UploadResult {
  url: string;
  filename: string;
}

export async function saveFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipe file tidak didukung. Hanya JPEG, PNG, WebP, GIF.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filepath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
  };
}

export function deleteFile(url: string): void {
  if (!url) return;
  const filename = url.replace('/uploads/', '');
  const filepath = join(UPLOAD_DIR, filename);
  if (existsSync(filepath)) {
    unlinkSync(filepath);
  }
}
