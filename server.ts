/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { validateAssessment } from './src/lib/apiValidation';
import { AIInsights } from './src/types/carbon';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security: Helmet middleware for robust headers and CSP security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "referrer"],
      connectSrc: [
        "'self'",
        "https://ais-pre-g7tspjm47ifbrcuzrpiz7f-646585121123.asia-southeast1.run.app",
        "https://ais-dev-g7tspjm47ifbrcuzrpiz7f-646585121123.asia-southeast1.run.app",
        "https://generativelanguage.googleapis.com"
      ],
      frameAncestors: ["'self'", "https://ai.studio", "https://*.google.com", "https://*.googlecode.com"]
    }
  }
}));

// Security: Strict CORS to allow verified domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const originUrl = new URL(origin);
      const hostname = originUrl.hostname;
      if (
        hostname === 'localhost' ||
        hostname.endsWith('run.app') ||
        hostname.endsWith('google.com') ||
        hostname.endsWith('googlecode.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    } catch {
      callback(new Error('Blocked by CORS policy: Invalid origin'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Security: Payload size limits to combat DOS vectors
app.use(express.json({ limit: '15kb' }));

// Security: Simple IN-MEMORY Rate Limiter with memory sweeping
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute per IP

// Periodically prune stale IP client records to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS * 5) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref(); // clear entries inactive for 5 minutes, sweep every 5 minutes

function apiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown-ip';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(ip);
  if (!clientData) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (now - clientData.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    clientData.count = 1;
    clientData.windowStart = now;
    return next();
  }

  clientData.count += 1;
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many carbon recalculations requested. Please wait 1 minute before trying again.',
    });
    return;
  }
  next();
}

// Lazy Initialize Gemini API safely as per guidelines (prevents crashes if missing)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not defined or configured in Settings Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Simple caching map for repeated Gemini requests to save API key credits and lower delays
interface CachedResponse {
  data: AIInsights;
  timestamp: number;
}
const geminiCache = new Map<string, CachedResponse>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1-hour cache lifetime

// Periodically prune expired Gemini cache records to stay memory efficient
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of geminiCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL_MS) {
      geminiCache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// API: Carbon Compass Insights Endpoint with extreme security input validation & cache
app.post('/api/insights', apiRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { assessment } = req.body;

    // Security: Input validation & sanitization via centralized lib validator
    const validation = validateAssessment(assessment);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const {
      carMilesPerWeek,
      vehicleType,
      publicTransitMilesPerWeek,
      shortFlightsPerYear,
      mediumFlightsPerYear,
      longFlightsPerYear,
      electricityKwhPerMonth,
      cleanEnergyPercentage,
      dietType,
      shoppingSpendPerMonth,
      shoppingHabits,
      wasteBagCountPerWeek,
      recyclingPercentage,
    } = assessment;

    // Cache-check sequence: Stringify ordered keys to form deterministic cache key
    const cacheKey = JSON.stringify({
      carMilesPerWeek,
      vehicleType,
      publicTransitMilesPerWeek,
      shortFlightsPerYear,
      mediumFlightsPerYear,
      longFlightsPerYear,
      electricityKwhPerMonth,
      cleanEnergyPercentage,
      dietType,
      shoppingSpendPerMonth,
      shoppingHabits,
      wasteBagCountPerWeek,
      recyclingPercentage,
    });

    const cached = geminiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      // Return fresh timestamp on cached data to keep response structures aligned
      const freshResponse = { ...cached.data, timestamp: new Date().toISOString() };
      res.json(freshResponse);
      return;
    }

    const client = getGeminiClient();

    // Construct precise instruction context based on user assessment parameters
    const prompt = `Analyze this individual's household activities and carbon footprint assessment results:
- Driving: ${carMilesPerWeek} miles/week in a ${vehicleType} vehicle.
- Public Transit: ${publicTransitMilesPerWeek} miles/week.
- Flights: Short:${shortFlightsPerYear}/year, Medium:${mediumFlightsPerYear}/year, Long:${longFlightsPerYear}/year.
- Home Utility: Uses ${electricityKwhPerMonth} kWh/month with ${cleanEnergyPercentage}% of energy derived from clean sources.
- Eating Habits: Adheres to a "${dietType}" diet.
- Material Habits: Spends $${shoppingSpendPerMonth}/month on retail with a "${shoppingHabits}" customer style.
- Garbage habits: Disposes of ${wasteBagCountPerWeek} trash bags per week with a ${recyclingPercentage}% recycling rate.

Generate a JSON object compliant with the request schema containing:
1. Highly personalized climate mitigation recommendations mapped accurately back to their specific input numbers. Specify realistic metrics of carbon tonnes saved and financial cost savings (USD offset/year) tailored for their action. For example, replacing high-wattage bulbs, selecting more clean grid options, or shifting 2 meat meals per week.
2. Unobvious hidden drivers of their particular footprint profile.
3. Hidden green opportunities they are uniquely situated to harness.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an environmental engineering AI. Your goal is to guide carbon footprint reduction with real-world, high-fidelity suggestions. Keep descriptions clear and accessible. Output valid JSON adhering perfectly to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of: transportation, flights, electricity, diet, shopping, waste'
                  },
                  action: { type: Type.STRING, description: 'Short actionable title' },
                  potentialSavings: { type: Type.NUMBER, description: 'CO2e saved in annual metric tons' },
                  potentialCostSavings: { type: Type.NUMBER, description: 'Financial savings in USD per year' },
                  easeOfImplementation: {
                    type: Type.STRING,
                    description: 'One of: Easy, Medium, Hard'
                  },
                  description: { type: Type.STRING, description: 'Cohesive, human description of why and how' }
                },
                required: ['id', 'category', 'action', 'potentialSavings', 'potentialCostSavings', 'easeOfImplementation', 'description']
              }
            },
            hiddenDrivers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['recommendations', 'hiddenDrivers', 'opportunities']
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || '{}');
    
    // Inject server timestamp
    parsedResponse.timestamp = new Date().toISOString();

    // Cache the verified response
    if (parsedResponse && Array.isArray(parsedResponse.recommendations)) {
      geminiCache.set(cacheKey, {
        data: parsedResponse,
        timestamp: Date.now(),
      });
    }

    res.json(parsedResponse);
  } catch (err: unknown) {
    console.error('Gemini Insights Handler Error:', err);
    // Generic error responses safe from leaking API metadata
    res.status(500).json({
      error: 'Unspecified failure analyzing carbon footprint indices. Please verify your internet connection or check your API configuration.',
    });
  }
});

// Full-Stack: Serve Frontend Assets over Vite in development or static index in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonCompass AI full-stack server running live on port ${PORT}`);
  });
}

startServer();
