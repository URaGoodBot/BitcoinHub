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

export interface CryptoCatalyst {
  id: string;
  event: string;
  description: string;
  probability: number;
  nextSteps: string[];
  category: 'policy' | 'regulatory' | 'market' | 'legal' | 'defi' | 'etf';
  impact: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface CatalystsData {
  catalysts: CryptoCatalyst[];
  lastUpdated: string;
  marketImpact: string;
  riskFactors: string;
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

// Crypto Catalysts Data - August 2025
export function getCryptoCatalysts(): CatalystsData {
  return {
    catalysts: [
      {
        id: "white_house_crypto_policy_impact",
        event: "White House Crypto Policy Report Impact",
        description: "The White House released its comprehensive crypto policy report on July 30, 2025, per Executive Order 14178, addressing regulatory clarity, consumer protections, stablecoin reforms, a potential CBDC ban, and DeFi integration. It omitted new Bitcoin reserve details. August may see regulatory actions or market reactions based on the report.",
        probability: 100,
        nextSteps: [
          "Monitor whitehouse.gov and sec.gov for regulatory follow-ups",
          "Check CoinDesk and Bloomberg for market reactions to the report",
          "Search X for 'White House crypto report' for ongoing sentiment",
          "Ask Grok for updates (e.g., 'Any regulatory actions from the White House crypto report?')"
        ],
        category: 'policy',
        impact: 'high',
        dueDate: "August 15, 2025"
      },
      {
        id: "solana_spot_etf_approval",
        event: "Solana Spot ETF Approval",
        description: "The SEC is reviewing Solana ETF filings, with decisions likely in August 2025 after July's progress (e.g., Invesco Galaxy Solana ETF filing). Grayscale's Solana ETF decision is due by October 11, 2025, but accelerated reviews suggest earlier action.",
        probability: 85,
        nextSteps: [
          "Monitor sec.gov for S-1 filing updates or press releases",
          "Check CoinDesk and Bloomberg for ETF approval news",
          "Search X for 'Solana ETF' for community insights",
          "Ask Grok for updates (e.g., 'Any Solana ETF approval news?')"
        ],
        category: 'etf',
        impact: 'high',
        dueDate: "August 20, 2025"
      },
      {
        id: "genius_act_implementation",
        event: "GENIUS Act Implementation",
        description: "Signed into law on July 18, 2025, the GENIUS Act regulates stablecoins, requiring full reserves and federal licenses. August may see further issuer announcements or corporate stablecoin launches.",
        probability: 100,
        nextSteps: [
          "Track announcements from stablecoin issuers (e.g., Tether, Circle) on CoinDesk or Reuters",
          "Monitor corporate stablecoin launches (e.g., Walmart, Amazon) on Bloomberg",
          "Check X for 'GENIUS Act' updates on progress"
        ],
        category: 'regulatory',
        impact: 'medium',
        dueDate: "August 31, 2025"
      },
      {
        id: "clarity_act_senate_progress",
        event: "CLARITY Act Senate Progress",
        description: "The CLARITY Act, passed by the House on July 17, 2025, defines crypto as securities or commodities and shifts oversight to the CFTC. Senate action remains pending, with potential updates in August during congressional sessions.",
        probability: 60,
        nextSteps: [
          "Check Reuters or CNBC for Senate vote updates",
          "Monitor X for 'CLARITY Act' to gauge sentiment",
          "Review Senate Banking Committee statements on sec.gov",
          "Ask Grok for progress (e.g., 'Any CLARITY Act Senate updates?')"
        ],
        category: 'regulatory',
        impact: 'high',
        dueDate: "August 25, 2025"
      },
      {
        id: "sec_meeting_outcomes_july",
        event: "SEC Meeting Outcomes (July 24, 2025)",
        description: "The July 24 SEC meeting addressed Solana ETF approvals and lawsuit appeal withdrawals (e.g., Ripple's XRP case). August may see follow-up actions or additional ETF filings.",
        probability: 100,
        nextSteps: [
          "Check sec.gov for new ETF filings or press releases",
          "Monitor CoinDesk for ETF or lawsuit updates",
          "Search X for 'SEC crypto' for reactions",
          "Ask Grok for updates (e.g., 'Any SEC crypto updates post-July 24?')"
        ],
        category: 'regulatory',
        impact: 'high',
        dueDate: "August 10, 2025"
      },
      {
        id: "fomc_meeting_july_impact",
        event: "FOMC Meeting (July 29–30, 2025)",
        description: "The FOMC meeting addressed interest rates, with a dovish outlook boosting crypto markets. August may see sustained market reactions or new economic data influencing crypto.",
        probability: 100,
        nextSteps: [
          "Monitor Bloomberg for crypto market reactions post-meeting",
          "Check federalreserve.gov for new economic statements",
          "Search X for 'FOMC crypto' for sentiment",
          "Assess crypto stock movements (e.g., COIN, MSTR) on Yahoo Finance"
        ],
        category: 'market',
        impact: 'medium',
        dueDate: "August 5, 2025"
      },
      {
        id: "defi_protocol_launches_august",
        event: "DeFi Protocol Launches & Token Unlocks",
        description: "New DeFi protocols (e.g., Hyperliquid, Ethena) and token unlocks (e.g., $ENA $11M unlock on July 2) drove interest in July. August may see additional launches or unlocks.",
        probability: 85,
        nextSteps: [
          "Track CoinMarketCap for new protocol listings or price movements",
          "Check X for 'Hyperliquid' or 'Ethena' for launch announcements",
          "Monitor unlock schedules on CoinGecko",
          "Ask Grok for DeFi updates (e.g., 'Any new DeFi launches in August 2025?')"
        ],
        category: 'defi',
        impact: 'medium',
        dueDate: "August 15, 2025"
      },
      {
        id: "world_liberty_financial_wlfi",
        event: "World Liberty Financial ($WLFI) Token Launch",
        description: "The Trump-backed $WLFI token was expected to become tradable in July 2025 but saw no confirmed launch. August may bring trading status updates.",
        probability: 65,
        nextSteps: [
          "Monitor CoinGecko or CoinMarketCap for $WLFI trading status",
          "Search X for '$WLFI' for launch updates",
          "Check Reuters for Trump-related crypto news",
          "Ask Grok for $WLFI status (e.g., 'Is $WLFI tradable yet?')"
        ],
        category: 'market',
        impact: 'medium',
        dueDate: "August 20, 2025"
      },
      {
        id: "bitcoin_strategic_reserve_developments",
        event: "Bitcoin Strategic Reserve Developments",
        description: "The March 6, 2025, EO established a Strategic Bitcoin Reserve using seized assets (approx. 198,012 BTC, per BitcoinTreasuries). The July 30 report omitted new details, but August may bring Treasury updates or reserve expansion strategies.",
        probability: 55,
        nextSteps: [
          "Check whitehouse.gov and treasury.gov for reserve announcements",
          "Monitor X for 'Bitcoin strategic reserve' sentiment",
          "Review CoinDesk for policy updates",
          "Ask Grok for reserve news (e.g., 'Any Bitcoin reserve updates?')"
        ],
        category: 'policy',
        impact: 'high',
        dueDate: "August 31, 2025"
      }
    ],
    lastUpdated: "August 1, 2025",
    marketImpact: "Positive outcomes (e.g., ETF approvals, dovish FOMC follow-ups) could drive 5-20% crypto market rallies and 5-15% gains in crypto stocks (e.g., COIN, MSTR). Restrictive policies may cause 5-10% dips.",
    riskFactors: "Verify X posts against primary sources (whitehouse.gov, sec.gov) to avoid misinformation. Regulatory delays or lawsuits (e.g., SEC vs. Coinbase) may impact ETF approvals."
  };
}