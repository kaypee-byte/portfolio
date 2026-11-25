import { writeFileSync } from 'node:fs';
const { SUPABASE_URL = '', SUPABASE_ANON_KEY = '' } = process.env;
writeFileSync('config.js', `window.CONFIG = ${JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY })};\n`);
console.log('config.js written', SUPABASE_URL ? '(connected)' : '(EMPTY: sample content only)');
