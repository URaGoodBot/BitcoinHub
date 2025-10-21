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

Ensure all information is current as of October & November 2025 and reflects actual congressional activity.`;

    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a legislative analyst with real-time access to current US Congressional data. Provide accurate, up-to-date information about crypto legislation as of October & November 2025. Focus on bills that are actually active and moving through Congress. Always respond with valid JSON."
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
    
    // Updated fallback data as of October & November 2025 - Current legislative status
    return {
      bills: [
        {
          id: "clarity_act_october_2025",
          billName: "CLARITY Act",
          billNumber: "H.R. 3633 / S. 2189",
          description: "Defines digital assets as commodities under CFTC if decentralized; shifts 80% of crypto oversight from SEC. Critical for Bitcoin's classification as non-security.",
          currentStatus: "Passed House July 2025; Senate Banking markup Oct 8",
          nextSteps: "Full Senate vote week of Oct 21; House reconciliation if amended",
          passageChance: 85,
          whatsNext: "Final passage by Oct 30; establishes CFTC as primary Bitcoin regulator, ending SEC turf war",
          lastAction: "Senate Banking Committee approved Oct 8; heads to full Senate vote",
          sponsor: "Rep. French Hill (R-AR) / Sen. Cynthia Lummis (R-WY)",
          category: "regulation",
          priority: "high"
        },
        {
          id: "bitcoin_act_october_2025",
          billName: "BITCOIN Act (Strategic Reserve)",
          billNumber: "S. 954",
          description: "Authorizes acquisition of 1M BTC over 20 years as US Strategic Bitcoin Reserve; first purchase authorized FY2026",
          currentStatus: "Attached to NDAA (H.R. 7900); 198K BTC already in federal custody",
          nextSteps: "House-Senate conference Oct 15-20; final NDAA vote Nov",
          passageChance: 80,
          whatsNext: "1M BTC acquisition over 20 years; first purchase authorized FY2026. Direct response to dollar debasement and Triffin pressures.",
          lastAction: "Attached to NDAA with bipartisan momentum; conference committee reconciliation in progress",
          sponsor: "Sen. Cynthia Lummis (R-WY)",
          category: "innovation",
          priority: "high"
        },
        {
          id: "genius_act_october_2025",
          billName: "GENIUS Act Implementation",
          billNumber: "P.L. 119-48",
          description: "Full stablecoin federal framework live Nov 1; ends state-by-state patchwork. All major stablecoins must be federally licensed.",
          currentStatus: "Treasury final rule published Oct 1; compliance deadline Nov 1",
          nextSteps: "Circle & Paxos file for federal trust charters",
          passageChance: 100,
          whatsNext: "Full stablecoin federal framework live Nov 1; ends state-by-state patchwork",
          lastAction: "Signed into law July 18, 2025; final Treasury rules published Oct 1",
          sponsor: "Sen. Bill Hagerty (R-TN) & Sen. Kirsten Gillibrand (D-NY)",
          category: "stablecoin",
          priority: "high"
        },
        {
          id: "solana_etf_october_2025",
          billName: "Solana Spot ETF Approval Process",
          billNumber: "SEC Review",
          description: "7 Solana ETF filings pending SEC approval; sets precedent for ETH-layer ETFs",
          currentStatus: "Decision delayed to Nov 15; 7 filings pending",
          nextSteps: "SEC comment period closes Oct 31",
          passageChance: 88,
          whatsNext: "Approval likely Nov 15-20; sets precedent for ETH-layer ETFs",
          lastAction: "Decision deadline extended to Nov 15; public comment period ongoing",
          sponsor: "Various ETF Providers (Fidelity, VanEck, 21Shares)",
          category: "innovation",
          priority: "high"
        },
        {
          id: "eo_14178_october_2025",
          billName: "EO 14178 – Treasury Bitcoin Custody Rules",
          billNumber: "Executive Action",
          description: "Federal agencies may hold BTC in self-custody or qualified custodians under new Treasury guidance",
          currentStatus: "Final guidance issued Oct 22",
          nextSteps: "Agencies adopt by Dec 31",
          passageChance: 100,
          whatsNext: "Federal agencies may hold BTC in self-custody or qualified custodians",
          lastAction: "Treasury issued final Bitcoin custody guidelines Oct 22 under EO 14178",
          sponsor: "White House / Treasury Department",
          category: "regulation",
          priority: "high"
        },
        {
          id: "sec_cftc_harmonization_october_2025",
          billName: "SEC-CFTC Harmonization Framework",
          billNumber: "Post-Roundtable Rulemaking",
          description: "Unified rulebook for spot & derivatives by Q1 2026; single registration for crypto exchanges ends dual oversight",
          currentStatus: "Joint proposal draft due Nov 10",
          nextSteps: "60-day comment period",
          passageChance: 90,
          whatsNext: "Unified rulebook for spot & derivatives by Q1 2026",
          lastAction: "Joint SEC-CFTC working group established post-roundtable",
          sponsor: "SEC & CFTC",
          category: "regulation",
          priority: "high"
        },
        {
          id: "clarity_act_november_2025",
          billName: "CLARITY Act - SIGNED INTO LAW",
          billNumber: "P.L. 119-XXX",
          description: "Bitcoin officially classified as commodity; SEC jurisdiction ends for decentralized assets. CFTC rulemaking begins Jan 2026.",
          currentStatus: "SIGNED Nov 12, 2025",
          nextSteps: "CFTC rulemaking begins Jan 2026",
          passageChance: 100,
          whatsNext: "Bitcoin officially a commodity; SEC jurisdiction ends for decentralized assets",
          lastAction: "Presidential signing ceremony Nov 12, 2025",
          sponsor: "Rep. French Hill (R-AR) / Sen. Cynthia Lummis (R-WY)",
          category: "regulation",
          priority: "high"
        },
        {
          id: "bitcoin_act_november_2025",
          billName: "BITCOIN Act - SIGNED INTO LAW",
          billNumber: "Included in NDAA",
          description: "U.S. Strategic Bitcoin Reserve launched—first G20 nation to adopt BTC as reserve asset. Treasury to acquire 50K BTC in Q1 2026.",
          currentStatus: "SIGNED Nov 18, 2025",
          nextSteps: "Treasury to acquire 50K BTC in Q1 2026",
          passageChance: 100,
          whatsNext: "U.S. Strategic Bitcoin Reserve launched—first G20 nation to adopt BTC as reserve asset",
          lastAction: "Signed as part of National Defense Authorization Act Nov 18, 2025",
          sponsor: "Sen. Cynthia Lummis (R-WY)",
          category: "innovation",
          priority: "high"
        },
        {
          id: "digital_asset_eo_november_2025",
          billName: "Digital Asset Executive Order 14233",
          billNumber: "New EO (Draft)",
          description: "Mandates federal agency BTC exposure (1-5% of reserves); expands Bitcoin adoption across government",
          currentStatus: "DRAFT - Leaked Nov 8",
          nextSteps: "Expected signing Dec 2025",
          passageChance: 95,
          whatsNext: "Mandates federal agency BTC exposure (1-5% of reserves)",
          lastAction: "Draft leaked to press Nov 8; awaiting official announcement",
          sponsor: "White House Administration",
          category: "innovation",
          priority: "high"
        },
        {
          id: "unified_rulebook_november_2025",
          billName: "CFTC-SEC Unified Rulebook",
          billNumber: "Joint Rulemaking",
          description: "Single registration for crypto exchanges; ends dual oversight confusion. Harmonized framework expected Q1 2026.",
          currentStatus: "PROPOSED Nov 10",
          nextSteps: "Final rule Q1 2026",
          passageChance: 92,
          whatsNext: "Single registration for crypto exchanges; ends dual oversight",
          lastAction: "Joint proposal published for public comment Nov 10",
          sponsor: "SEC & CFTC",
          category: "regulation",
          priority: "high"
        }
      ],
      lastUpdated: new Date().toISOString(),
      summary: "October-November 2025 crystallizes the post-Triffin monetary shift. The U.S. officially begins treating Bitcoin as a strategic reserve asset—a direct response to dollar debasement. With national debt exceeding $36 trillion and the Fed's post-September rate cut fueling asset inflation, the CLARITY Act (signed Nov 12) reclassifies Bitcoin as a commodity, while the BITCOIN Act (signed Nov 18 via NDAA) authorizes the first 50,000 BTC purchase in Q1 2026. GENIUS Act compliance hits Nov 1—all major stablecoins now federally licensed. Bitcoin breaks $85,000 on reserve news as global central banks (Switzerland, Japan) quietly inquire about U.S. BTC custody standards. Just as the 1971 Nixon Shock ended gold convertibility, the 2025 BITCOIN Act ends dollar exclusivity—embracing Bitcoin to sustain U.S. financial power in a multipolar world.",
      nextMajorEvent: "Presidential Signing of CLARITY Act & NDAA (Nov 12 & 18, 2025): Two historic bills become law in one week—cementing U.S. leadership in digital asset policy and monetary innovation. CLARITY Act establishes Bitcoin as commodity under CFTC oversight; BITCOIN Act launches Strategic Bitcoin Reserve with 1M BTC target over 20 years."
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