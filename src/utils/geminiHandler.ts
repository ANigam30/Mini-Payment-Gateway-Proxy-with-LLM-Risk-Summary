import { PaymentRequest } from '../types';
import axios from 'axios';

const GEMINI_API_KEY = process.env['GEMINI_API_KEY'];
const GEMINI_API_URL = process.env['GEMINI_API_URL'] || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function getGeminiFraudSummary(request: PaymentRequest, score: number): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not set in environment variables.');
  }

  // Prompt: Only ask for a natural-language summary based on the score and request
  const prompt = `You are a payment fraud detection expert. Given the following payment request and a risk score (0.0 to 1.0, where 1.0 is highest risk), generate a short, clear natural-language summary explaining the risk factors for this transaction.\nPayment details: ${JSON.stringify(request)}\nRisk score: ${score}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse Gemini response
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Return as array (split by newlines or as single element)
    if (text.includes('\n')) {
      return text.split('\n').map((line: string) => line.trim()).filter(Boolean);
    }
    return [text.trim()];
  } catch (error) {
    return [
      'Gemini LLM API call failed. Defaulting to generic summary.',
      (error as Error).message
    ];
  }
} 