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

Ensure all information is current as of September 2025 and reflects actual congressional activity.`;

    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a legislative analyst with real-time access to current US Congressional data. Provide accurate, up-to-date information about crypto legislation as of September 2025. Focus on bills that are actually active and moving through Congress. Always respond with valid JSON."
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
    
    // Updated fallback data as of September 5, 2025 - Current legislative status
    return {
      bills: [
        {
          id: "white_house_crypto_policy_2025",
          billName: "White House Crypto Policy Report Implementation",
          billNumber: "Executive Order 14178",
          description: "Comprehensive crypto policy addressing regulatory clarity, consumer protections, stablecoin reforms, potential CBDC ban, and DeFi integration",
          currentStatus: "Report released July 30, 2025, implementation ongoing",
          nextSteps: "September focuses on broader agency implementations and potential Treasury actions",
          passageChance: 100,
          whatsNext: "August saw key takeaways published and initial follow-up discussions on market structure; September implementation accelerating across agencies",
          lastAction: "Report released per Executive Order 14178 with comprehensive policy framework",
          sponsor: "White House Administration",
          category: "regulation",
          priority: "high"
        },
        {
          id: "solana_etf_approval_2025",
          billName: "Solana Spot ETF Approval Process",
          billNumber: "SEC Review Process",
          description: "SEC reviewing Solana ETF filings including Invesco Galaxy and Grayscale submissions",
          currentStatus: "Under SEC review with high market odds (95-99%) for October decision",
          nextSteps: "Continue monitoring sec.gov for S-1 amendments and final approvals",
          passageChance: 90,
          whatsNext: "September sees continued regulatory discussions amid Alpenglow upgrade hype, with October decision likely",
          lastAction: "Filings remain under review with no final approvals yet in August",
          sponsor: "Various ETF Providers (Invesco Galaxy, Grayscale)",
          category: "innovation",
          priority: "high"
        },
        {
          id: "genius_act_2025",
          billName: "GENIUS Act Implementation",
          billNumber: "S. 2664",
          description: "Stablecoin regulation with full reserves and federal licenses, signed into law July 18, 2025",
          currentStatus: "Implementation phase with Treasury comment requests and state alignments",
          nextSteps: "September may see issuer compliance announcements and effective date progress",
          passageChance: 100,
          whatsNext: "August included Treasury comment requests and state alignments (e.g., Illinois oversight laws); monitoring stablecoin issuers for compliance",
          lastAction: "Law signed and implementation accelerating with Treasury and issuer activity",
          sponsor: "Sen. Bill Hagerty (R-TN) & Sen. Kirsten Gillibrand (D-NY)",
          category: "stablecoin",
          priority: "high"
        },
        {
          id: "clarity_act_2025",
          billName: "CLARITY Act Senate Progress",
          billNumber: "H.R. 4763",
          description: "Defines crypto as securities or commodities and shifts oversight to the CFTC",
          currentStatus: "Passed House July 17, 2025, Senate Banking Committee aims for completion by September 30",
          nextSteps: "Senate Banking Committee market structure completion by September 30, 2025",
          passageChance: 75,
          whatsNext: "August clarifications emerged; Senate Banking Committee aims for market structure completion amid bipartisan support despite lingering opposition",
          lastAction: "House passage with Senate deadlines and draft releases increasing momentum",
          sponsor: "Rep. Patrick McHenry (R-NC) & Rep. Glenn Thompson (R-PA)",
          category: "regulation",
          priority: "high"
        },
        {
          id: "sec_cftc_roundtable_2025",
          billName: "SEC-CFTC Joint Roundtable",
          billNumber: "Joint Regulatory Initiative",
          description: "Joint roundtable on regulatory harmonization for crypto, building on August initiatives",
          currentStatus: "Scheduled for September 29, 2025",
          nextSteps: "Monitor sec.gov and cftc.gov for agenda and post-event analysis",
          passageChance: 100,
          whatsNext: "Event scheduled to focus on outcomes for market structure and innovation promotion",
          lastAction: "Joint announcement building on August initiatives to revamp crypto rules",
          sponsor: "SEC & CFTC Joint Initiative",
          category: "regulation",
          priority: "high"
        },
        {
          id: "fomc_meeting_september_2025",
          billName: "FOMC Meeting Impact on Crypto Markets",
          billNumber: "Federal Reserve Policy",
          description: "FOMC addresses interest rates amid easing inflation, with August minutes hinting at 25-basis-point cut",
          currentStatus: "Meeting scheduled September 16-17, 2025",
          nextSteps: "Monitor federalreserve.gov for statements and crypto market reactions",
          passageChance: 100,
          whatsNext: "Crypto markets anticipate dovish signals boosting risk assets including Bitcoin",
          lastAction: "August minutes hint at rate cut with crypto market implications",
          sponsor: "Federal Reserve",
          category: "policy",
          priority: "high"
        },
        {
          id: "defi_protocol_launches_2025",
          billName: "DeFi Protocol Launches & Token Unlocks",
          billNumber: "Market Events",
          description: "September features $4.5B in unlocks (Sui, Aptos, Arbitrum) and launches like Pascal Protocol on September 9",
          currentStatus: "Multiple scheduled events throughout September",
          nextSteps: "Track CoinMarketCap for listings and monitor unlock schedules on Tokenomist.ai",
          passageChance: 90,
          whatsNext: "High due to scheduled unlocks and launches with expected market volatility",
          lastAction: "August saw protocol activity with September events scheduled",
          sponsor: "Various DeFi Protocols",
          category: "innovation",
          priority: "medium"
        },
        {
          id: "world_liberty_financial_2025",
          billName: "World Liberty Financial Token Launch",
          billNumber: "Market Launch",
          description: "WLFI token launched September 1, 2025, with immediate volatility, 47M token burn, and governance controversies",
          currentStatus: "Launch completed with ongoing trading stability issues",
          nextSteps: "Monitor CoinGecko for $WLFI price stability and governance developments",
          passageChance: 100,
          whatsNext: "Focus on trading stability and governance issues following controversial launch",
          lastAction: "September 1 launch with immediate market volatility and Justin Sun frozen holdings controversy",
          sponsor: "World Liberty Financial",
          category: "innovation",
          priority: "medium"
        },
        {
          id: "bitcoin_strategic_reserve_2025",
          billName: "Bitcoin Strategic Reserve Developments",
          billNumber: "S.954 (BITCOIN Act)",
          description: "US holds ~198,000 BTC via March 6 EO using seized assets, with state expansions and federal management progress",
          currentStatus: "Ongoing developments with state expansions and federal bill progress",
          nextSteps: "Monitor congress.gov for BITCOIN Act updates and state reserve announcements",
          passageChance: 80,
          whatsNext: "August/September sees state expansions (e.g., New Hampshire reserve) and BITCOIN Act progress for federal management",
          lastAction: "Established via March 6, 2025 EO with ongoing state and federal developments",
          sponsor: "Sen. Cynthia Lummis (R-WY)",
          category: "policy",
          priority: "high"
        }
      ],
      lastUpdated: new Date().toISOString(),
      summary: "September 2025 brings key crypto developments: GENIUS Act implementation accelerating, Solana ETF decisions expected in October, CLARITY Act Senate progress by month-end, and SEC-CFTC joint roundtable on September 29.",
      nextMajorEvent: "September 29, 2025 SEC-CFTC Joint Roundtable on regulatory harmonization and FOMC meeting September 16-17"
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

// Crypto Catalysts Data - September 2025
export function getCryptoCatalysts(): CatalystsData {
  return {
    catalysts: [
      {
        id: "white_house_crypto_policy_implementation",
        event: "White House Crypto Policy Report Implementation",
        description: "The White House released its comprehensive crypto policy report on July 30, 2025, per Executive Order 14178, addressing regulatory clarity, consumer protections, stablecoin reforms, a potential CBDC ban, and DeFi integration. August saw key takeaways published and initial follow-up discussions on market structure; September focuses on broader agency implementations and potential Treasury actions.",
        probability: 100,
        nextSteps: [
          "Monitor whitehouse.gov and sec.gov for regulatory follow-ups",
          "Check CoinDesk and Bloomberg for implementation updates",
          "Search X for 'White House crypto implementation' for progress updates",
          "Ask Grok for updates (e.g., 'What Treasury actions from White House crypto report?')"
        ],
        category: 'policy',
        impact: 'high',
        dueDate: "September 30, 2025"
      },
      {
        id: "solana_spot_etf_approval",
        event: "Solana Spot ETF Approval",
        description: "The SEC reviewed Solana ETF filings in August with no final approvals; filings like Invesco Galaxy and Grayscale remain under review. High market odds (95-99%) point to potential decisions by mid-October 2025, with September seeing continued regulatory discussions amid Alpenglow upgrade hype.",
        probability: 90,
        nextSteps: [
          "Monitor sec.gov for S-1 amendments and final approvals",
          "Check CoinDesk and Bloomberg for ETF approval news",
          "Search X for 'Solana ETF' for community insights",
          "Ask Grok for updates (e.g., 'Any Solana ETF approval news?')"
        ],
        category: 'etf',
        impact: 'high',
        dueDate: "October 15, 2025"
      },
      {
        id: "genius_act_implementation",
        event: "GENIUS Act Implementation",
        description: "Signed into law on July 18, 2025, the GENIUS Act regulates stablecoins with full reserves and federal licenses. August included Treasury comment requests and state alignments (e.g., Illinois oversight laws); September may see issuer compliance announcements and effective date progress.",
        probability: 100,
        nextSteps: [
          "Track stablecoin issuers (e.g., Circle, Tether) on CoinDesk or Reuters for compliance announcements",
          "Monitor Treasury guidance releases on treasury.gov",
          "Check X for 'GENIUS Act implementation' updates"
        ],
        category: 'regulatory',
        impact: 'high',
        dueDate: "September 30, 2025"
      },
      {
        id: "clarity_act_senate_progress",
        event: "CLARITY Act Senate Progress",
        description: "Passed by the House on July 17, 2025, the CLARITY Act defines crypto as securities or commodities and shifts oversight to the CFTC. August clarifications emerged; Senate Banking Committee aims for market structure completion by September 30, 2025, amid bipartisan support.",
        probability: 75,
        nextSteps: [
          "Check Reuters or CNBC for Senate updates",
          "Monitor X for 'CLARITY Act' Senate progress sentiment",
          "Review Senate Banking Committee statements",
          "Ask Grok for progress (e.g., 'CLARITY Act Senate Banking Committee updates?')"
        ],
        category: 'regulatory',
        impact: 'high',
        dueDate: "September 30, 2025"
      },
      {
        id: "sec_cftc_joint_roundtable",
        event: "SEC-CFTC Joint Roundtable",
        description: "New: The SEC and CFTC announced a joint roundtable on regulatory harmonization for September 29, 2025, building on August initiatives to revamp crypto rules and promote innovation.",
        probability: 100,
        nextSteps: [
          "Monitor sec.gov and cftc.gov for agenda and statements",
          "Check CoinDesk for post-event analysis",
          "Search X for 'SEC CFTC roundtable' reactions",
          "Ask Grok for updates (e.g., 'What happened at the SEC CFTC roundtable?')"
        ],
        category: 'regulatory',
        impact: 'high',
        dueDate: "September 29, 2025"
      },
      {
        id: "fomc_meeting_september",
        event: "FOMC Meeting (September 16–17, 2025)",
        description: "The FOMC will address interest rates amid easing inflation. August minutes hinted at a 25-basis-point cut; crypto markets anticipate dovish signals boosting risk assets.",
        probability: 100,
        nextSteps: [
          "Monitor federalreserve.gov for statements and minutes",
          "Check Bloomberg for crypto reactions",
          "Search X for 'FOMC crypto impact' sentiment",
          "Assess stocks like COIN on Yahoo Finance"
        ],
        category: 'market',
        impact: 'high',
        dueDate: "September 17, 2025"
      },
      {
        id: "defi_protocol_launches_september",
        event: "DeFi Protocol Launches & Token Unlocks",
        description: "August saw protocol activity; September features $4.5B in unlocks (e.g., Sui, Aptos, Arbitrum) and launches like Pascal Protocol on September 9, driving DeFi interest.",
        probability: 90,
        nextSteps: [
          "Track CoinMarketCap for listings and prices",
          "Check X for specific protocol announcements (e.g., 'Pascal Protocol launch')",
          "Monitor unlock schedules on Tokenomist.ai",
          "Ask Grok for DeFi updates (e.g., 'Any new DeFi launches in September 2025?')"
        ],
        category: 'defi',
        impact: 'medium',
        dueDate: "September 30, 2025"
      },
      {
        id: "world_liberty_financial_wlfi",
        event: "World Liberty Financial ($WLFI) Token Launch",
        description: "Expected in July/August but delayed; launched September 1, 2025, with immediate volatility, 47M token burn, and controversies (e.g., Justin Sun's frozen holdings).",
        probability: 100,
        nextSteps: [
          "Monitor CoinGecko or CoinMarketCap for $WLFI price and status",
          "Search X for '$WLFI launch' for updates and sentiment",
          "Check Reuters for related news",
          "Ask Grok for status (e.g., 'How is $WLFI performing post-launch?')"
        ],
        category: 'market',
        impact: 'medium',
        dueDate: "September 30, 2025"
      },
      {
        id: "bitcoin_strategic_reserve_developments",
        event: "Bitcoin Strategic Reserve Developments",
        description: "Established via March 6, 2025, EO using seized assets; US holds ~198,000 BTC. August/September sees state expansions (e.g., New Hampshire reserve) and BITCOIN Act (S.954) progress for federal management.",
        probability: 80,
        nextSteps: [
          "Monitor congress.gov for BITCOIN Act updates",
          "Check Chainalysis or VanEck for reserve analyses",
          "Search X for 'Bitcoin Strategic Reserve' sentiment",
          "Ask Grok for reserve news (e.g., 'Any Bitcoin reserve state expansions?')"
        ],
        category: 'policy',
        impact: 'high',
        dueDate: "September 30, 2025"
      }
    ],
    lastUpdated: "September 5, 2025",
    marketImpact: "Positive outcomes (e.g., Solana ETF approvals, dovish FOMC signals, successful DeFi launches) could drive 5-20% crypto market rallies and 5-15% gains in crypto stocks (e.g., COIN, MSTR). Token unlocks or regulatory delays may cause 5-10% dips.",
    riskFactors: "Verify X posts against primary sources (whitehouse.gov, sec.gov, cftc.gov) to avoid misinformation. Large token unlocks ($4.5B in September) and regulatory uncertainties may create volatility. Monitor Justin Sun's WLFI holdings for market impact."
  };
}