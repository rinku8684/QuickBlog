import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

console.log(
  'API KEY:',
  apiKey ? apiKey.substring(0, 3) + '...' : 'NOT FOUND'
);

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey
});

try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Say hello in one short sentence.'
  });

  console.log('--------------------------------');
  console.log('GEMINI TEST SUCCESSFUL');
  console.log('--------------------------------');
  console.log(response.text);
} catch (error) {
  console.error('--------------------------------');
  console.error('GEMINI TEST FAILED');
  console.error('--------------------------------');
  console.error(error);
}