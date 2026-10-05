import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  const line = readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
  const value = line?.slice('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
  if (value) {
    const host = new URL(value).hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      console.error('Tests that create data require a local Supabase URL. The selected .env.local points to a hosted project.');
      process.exit(1);
    }
  }
}
