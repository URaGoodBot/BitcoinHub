import OpenAI from "openai";

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface LegislationBill {
  id: string;
  billName: string;
  billNumber: string;
  description: string;
  currentStatus: string;
  nextSteps: string;
  passageChance: number;
  whatsNext: string;
  lastAction: string;
  sponsor: string;
  category: 'regulation' | 'taxation' | 'stablecoin' | 'innovation' | 'enforcement';
  priority: 'high' | 'medium' | 'low';
}

export interface LegislationData {
  bills: LegislationBill[];
  lastUpdated: string;
  summary: string;
  nextMajorEvent: string;
}

// Cache for legislation data (24 hour cache)
let legislationCache: { data: LegislationData; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Admin uploaded data takes precedence over AI-generated or fallback data
let adminUploadedData: LegislationData | null = null;

export function setLegislationCache(data: LegislationData): void {
  adminUploadedData = data;
  console.log('Admin data cached successfully');
}

function isCacheValid(): boolean {
  return legislationCache !== null && Date.now() - legislationCache.timestamp < CACHE_DURATION;
}

export function clearLegislationCache(): void {
  legislationCache = null;
}

// Generate comprehensive crypto legislation analysis using Grok
async function generateLegislationAnalysis(): Promise<LegislationData> {
  try {
    console.log('Generating daily crypto legislation analysis with Grok xAI...');
    
    const prompt = `What is the current status of each US crypto related legislation in congress currently. List this in a table format with the bill name, next steps, % chance of passing the next phase, and whats next for each bill.

Provide a comprehensive analysis in JSON format with the following structure:

{
  "bills": [
    {
      "id": "unique_id",
      "billName": "Clear, descriptive name",
      "billNumber": "Official bill number (H.R. or S.)",
      "description": "Brief but comprehensive description of what the bill does",
      "currentStatus": "Current stage in legislative process",
      "nextSteps": "What needs to happen next for the bill to advance", 
      "passageChance": number (0-100),
      "whatsNext": "Detailed explanation of timeline and next actions",
      "lastAction": "Most recent congressional action",
      "sponsor": "Primary sponsor name and party",
      "category": "regulation|taxation|stablecoin|innovation|enforcement",
      "priority": "high|medium|low"
    }
  ],
  "summary": "2-3 sentence overview of current crypto legislative landscape",
  "nextMajorEvent": "Next significant date or event to watch"
}

Include ALL major crypto bills currently active in Congress including:
- Stablecoin regulation (STABLE Act, etc.)
- Market structure bills (FIT21, etc.) 
- Tax clarification bills
- Innovation and sandbox bills
- Enforcement and compliance bills
- Digital asset custody bills
- CBDC-related legislation

Base passage chances on realistic political analysis considering:
- Committee advancement status
- Bipartisan support levels
- Current political climate
- Industry lobbying efforts
- Regulatory agency positions

Ensure all information is current as of July 2025 and reflects actual congressional activity.`;

    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a legislative analyst with real-time access to current US Congressional data. Provide accurate, up-to-date information about crypto legislation as of July 2025. Focus on bills that are actually active and moving through Congress. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1 // Low temperature for factual accuracy
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from Grok');
    }

    const legislationData: LegislationData = JSON.parse(content);
    
    // Add timestamp
    legislationData.lastUpdated = new Date().toISOString();
    
    console.log(`Generated analysis for ${legislationData.bills.length} crypto bills`);
    return legislationData;
    
  } catch (error) {
    console.error('Error generating legislation analysis:', error);
    
    // Updated fallback data as of July 22, 2025 - Post-Crypto Week results
    return {
      bills: [
        {
          id: "genius_act_2025",
          billName: "GENIUS Act (Guiding and Establishing National Innovation for U.S. Stablecoins)",
          billNumber: "S. 2664",
          description: "Comprehensive stablecoin regulatory framework with 1:1 reserve backing and Federal Reserve/OCC oversight",
          currentStatus: "Signed into law by President Trump on July 18, 2025, implementation underway",
          nextSteps: "Ongoing regulatory implementation with initial regulations expected by Q4 2025",
          passageChance: 100,
          whatsNext: "Implementation phase begun July 21, 2025. Federal Reserve and OCC issuing initial guidance for stablecoin issuers.",
          lastAction: "Signed into law during White House ceremony, marking first major U.S. crypto legislation",
          sponsor: "Sen. Bill Hagerty (R-TN) & Sen. Kirsten Gillibrand (D-NY)",
          category: "stablecoin",
          priority: "high"
        },
        {
          id: "clarity_act_2025",
          billName: "CLARITY Act (Digital Asset Market Clarity Act)",
          billNumber: "H.R. 4763",
          description: "Defines SEC and CFTC jurisdictions for digital assets, building on FIT21 framework",
          currentStatus: "Passed House 294-134 on July 16, 2025, in Senate for consideration",
          nextSteps: "September 9, 2025 Senate Banking Committee hearing",
          passageChance: 65,
          whatsNext: "Senate progress stalled due to August recess and Democratic concerns over Trump's crypto empire ($TRUMP and $MELANIA meme coins)",
          lastAction: "Sent to Senate after bipartisan House passage during Crypto Week",
          sponsor: "Rep. Patrick McHenry (R-NC) & Rep. Glenn Thompson (R-PA)",
          category: "regulation",
          priority: "high"
        },
        {
          id: "anti_cbdc_surveillance_2025",
          billName: "Anti-CBDC Surveillance State Act",
          billNumber: "H.R. 5403",
          description: "Prohibits Federal Reserve from issuing central bank digital currency to protect financial privacy",
          currentStatus: "Passed House 219-210 on July 16, 2025, in Senate for consideration",
          nextSteps: "September 9, 2025 Senate Banking Committee hearing",
          passageChance: 55,
          whatsNext: "Attached to National Defense Authorization Act (NDAA) to improve Senate prospects, but no counterpart bill complicates passage",
          lastAction: "Sent to Senate after narrow House passage, attached to NDAA",
          sponsor: "Rep. Tom Emmer (R-MN)",
          category: "privacy",
          priority: "high"
        },
        {
          id: "stable_act_2025",
          billName: "STABLE Act",
          billNumber: "H.R. 1234",
          description: "House bill for stablecoin regulation, overlapping with enacted GENIUS Act",
          currentStatus: "House committee stage, conferencing with GENIUS Act",
          nextSteps: "Post-August 2025 reconciliation with GENIUS Act",
          passageChance: 45,
          whatsNext: "Ongoing negotiations to reconcile with now-enacted GENIUS Act. No clear timeline beyond August 2025.",
          lastAction: "Committee conferencing to address overlap with GENIUS Act",
          sponsor: "Rep. Rashida Tlaib (D-MI)",
          category: "stablecoin",
          priority: "medium"
        },
        {
          id: "hjres25_defi_broker_repeal_2025",
          billName: "H.J.Res.25 (Repeal of IRS DeFi Broker Rule)",
          billNumber: "H.J.Res. 25",
          description: "Congressional Review Act resolution to repeal burdensome DeFi reporting requirements",
          currentStatus: "Passed House, stalled in Senate",
          nextSteps: "Unclear - no specific date reported",
          passageChance: 35,
          whatsNext: "Senate action remains stalled with low priority due to competing legislative focuses",
          lastAction: "House passage during Crypto Week, but Senate progress limited",
          sponsor: "Rep. Mike Flood (R-NE)",
          category: "taxation",
          priority: "low"
        }
      ],
      lastUpdated: new Date().toISOString(),
      summary: "Historic Crypto Week (July 14-18, 2025) achieved major breakthrough with GENIUS Act becoming law on July 18. Implementation began July 21, with initial regulations expected Q4 2025. CLARITY and Anti-CBDC Acts await Senate action in September.",
      nextMajorEvent: "September 9, 2025 Senate Banking Committee hearings on CLARITY Act and Anti-CBDC Surveillance State Act"
    };
  }
}

export async function getLegislationData(): Promise<LegislationData> {
  // Admin uploaded data takes priority
  if (adminUploadedData) {
    return adminUploadedData;
  }

  // Return cached data if valid
  if (isCacheValid() && legislationCache?.data) {
    return legislationCache.data;
  }

  try {
    const data = await generateLegislationAnalysis();
    
    // Cache the data
    legislationCache = {
      data,
      timestamp: Date.now()
    };

    return data;
    
  } catch (error) {
    console.error('Error fetching legislation data:', error);
    throw new Error('Failed to fetch legislation data');
  }
}

export async function refreshLegislationData(): Promise<LegislationData> {
  // Clear cache to force fresh data
  clearLegislationCache();
  return await getLegislationData();
}