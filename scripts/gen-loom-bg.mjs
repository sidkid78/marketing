// One-off image generator for skill-barter.html "Digital Loom" background.
// Uses the Interactions API, mirroring image-studio/services/genaiServices.ts.
// Run from frontend/ : node scripts/gen-loom-bg.mjs
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

// Pull key from .env.local without adding a dotenv dep.
const envPath = path.join(process.cwd(), '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const apiKey = envText
  .split(/\r?\n/)
  .map((l) => l.match(/^\s*(?:NEXT_PUBLIC_)?GEMINI_API_KEY\s*=\s*(.+?)\s*$/))
  .find(Boolean)?.[1]?.replace(/^["']|["']$/g, '');

if (!apiKey) {
  console.error('No GEMINI_API_KEY / NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const prompt = [
  'A wide, atmospheric, painterly photograph of a hand-loom weaving in warm afternoon light.',
  'Threads of soft emerald, amber, and rose interlace across the frame, suggesting connection and exchange.',
  'In the background, faint glowing circuit lines and constellations of light are woven into the textile,',
  'hinting at AI and digital networks without dominating the image.',
  'Earthy cream and beige tones, slight grain, cinematic depth of field, editorial magazine feel,',
  'inspired by Renaissance still-life lighting meets modern data visualization.',
  'No text, no logos. Composition centered, room for overlay.',
].join(' ');

const client = new GoogleGenAI({ apiKey });

console.log('Requesting image generation...');
const interaction = await client.interactions.create({
  model: 'gemini-3.1-flash-image',
  input: prompt,
  response_format: {
    type: 'image',
    mime_type: 'image/jpeg',
    aspect_ratio: '16:9',
    image_size: '2K',
  },
  store: false,
});

const img = interaction.output_image?.data;
if (!img) {
  console.error('No image returned:', JSON.stringify(interaction, null, 2));
  process.exit(1);
}

const outPath = path.join(process.cwd(), 'public', 'images', 'skill-barter-loom.jpg');
fs.writeFileSync(outPath, Buffer.from(img, 'base64'));
console.log('Wrote', outPath, `(${fs.statSync(outPath).size} bytes)`);
