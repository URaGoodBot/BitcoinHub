import axios from 'axios';

const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY;
const LEGISCAN_BASE_URL = 'https://api.legiscan.com';

interface LegiScanBill {
  bill_id: number;
  number: string;
  change_hash: string;
  url: string;
  status_date: string;
  status: number;
  last_action_date: string;
  last_action: string;
  title: string;
  description: string;
}

interface LegiScanBillDetail {
  bill_id: number;
  bill_number: string;
  bill_type: string;
  title: string;
  description: string;
  state: string;
  session: {
    session_id: number;
    session_name: string;
  };
  status: number;
  status_date: string;
  history: Array<{
    date: string;
    action: string;
    chamber: string;
  }>;
  sponsors: Array<{
    people_id: number;
    name: string;
    party: string;
    role: string;
  }>;
  texts: Array<{
    doc_id: number;
    date: string;
    type: string;
  }>;
  votes: Array<{
    roll_call_id: number;
    date: string;
    desc: string;
    yea: number;
    nay: number;
  }>;
}

interface LegislationBill {
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

let legiscanCache: { data: LegislationBill[]; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000;

const STATUS_MAP: Record<number, string> = {
  1: 'Introduced',
  2: 'Engrossed',
  3: 'Enrolled',
  4: 'Passed',
  5: 'Vetoed',
  6: 'Failed',
};

function categorizeByKeywords(title: string, description: string): 'regulation' | 'taxation' | 'stablecoin' | 'innovation' | 'enforcement' {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('stablecoin') || text.includes('stable coin')) return 'stablecoin';
  if (text.includes('tax') || text.includes('irs') || text.includes('reporting')) return 'taxation';
  if (text.includes('enforcement') || text.includes('compliance') || text.includes('penalty')) return 'enforcement';
  if (text.includes('innovation') || text.includes('sandbox') || text.includes('reserve') || text.includes('etf')) return 'innovation';
  return 'regulation';
}

function calculatePassageChance(status: number, history: Array<{ action: string }>): number {
  if (status === 4) return 100;
  if (status === 5 || status === 6) return 0;
  
  let baseChance = 30;
  const historyText = history.map(h => h.action.toLowerCase()).join(' ');
  
  if (historyText.includes('passed house') || historyText.includes('passed senate')) baseChance += 25;
  if (historyText.includes('committee') && historyText.includes('reported')) baseChance += 15;
  if (historyText.includes('bipartisan')) baseChance += 10;
  if (historyText.includes('referred to')) baseChance -= 5;
  
  return Math.min(95, Math.max(5, baseChance));
}

function determinePriority(title: string, description: string): 'high' | 'medium' | 'low' {
  const text = (title + ' ' + description).toLowerCase();
  const highPriorityTerms = ['bitcoin', 'cryptocurrency', 'digital asset', 'stablecoin', 'cftc', 'sec', 'market structure'];
  const mediumPriorityTerms = ['blockchain', 'crypto', 'virtual currency', 'token'];
  
  if (highPriorityTerms.some(term => text.includes(term))) return 'high';
  if (mediumPriorityTerms.some(term => text.includes(term))) return 'medium';
  return 'low';
}

function generateNextSteps(status: number, lastAction: string): string {
  const actionLower = lastAction.toLowerCase();
  
  if (status === 4) return 'Signed into law; implementation underway';
  if (status === 5) return 'Veto override vote possible';
  if (status === 6) return 'Bill failed; may be reintroduced next session';
  
  if (actionLower.includes('introduced')) return 'Awaiting committee assignment';
  if (actionLower.includes('referred to committee')) return 'Committee review and hearings expected';
  if (actionLower.includes('reported') && actionLower.includes('committee')) return 'Floor vote scheduling pending';
  if (actionLower.includes('passed house')) return 'Senate consideration pending';
  if (actionLower.includes('passed senate')) return 'Conference committee or House vote pending';
  
  return 'Awaiting next legislative action';
}

async function fetchBillDetails(billId: number): Promise<LegiScanBillDetail | null> {
  if (!LEGISCAN_API_KEY) return null;
  
  try {
    const response = await axios.get(`${LEGISCAN_BASE_URL}/?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`);
    if (response.data.status === 'OK') {
      return response.data.bill;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching bill ${billId} details:`, error);
    return null;
  }
}

export async function searchCryptoBills(): Promise<LegislationBill[]> {
  if (!LEGISCAN_API_KEY) {
    console.log('LegiScan API key not configured, using fallback data');
    return [];
  }

  if (legiscanCache && Date.now() - legiscanCache.timestamp < CACHE_DURATION) {
    console.log('Returning cached LegiScan data');
    return legiscanCache.data;
  }

  const searchTerms = [
    'cryptocurrency',
    'bitcoin',
    'digital asset',
    'stablecoin',
    'blockchain'
  ];

  const allBills: Map<number, LegiScanBill> = new Map();

  try {
    for (const term of searchTerms) {
      const url = `${LEGISCAN_BASE_URL}/?key=${LEGISCAN_API_KEY}&op=search&query=${encodeURIComponent(term)}&state=US&year=2`;
      console.log(`Searching LegiScan for: ${term}`);
      
      const response = await axios.get(url);
      
      if (response.data.status === 'OK' && response.data.searchresult) {
        const results = response.data.searchresult;
        Object.keys(results).forEach(key => {
          if (key !== 'summary' && results[key].bill_id) {
            allBills.set(results[key].bill_id, results[key]);
          }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Found ${allBills.size} unique crypto-related bills`);

    const sortedBills = Array.from(allBills.values())
      .sort((a, b) => new Date(b.last_action_date).getTime() - new Date(a.last_action_date).getTime())
      .slice(0, 15);

    const detailedBills: LegislationBill[] = [];

    for (const bill of sortedBills) {
      const details = await fetchBillDetails(bill.bill_id);
      
      if (details) {
        const sponsors = details.sponsors.map(s => `${s.name} (${s.party})`).join(', ') || 'Unknown';
        const lastHistoryAction = details.history.length > 0 
          ? details.history[details.history.length - 1].action 
          : bill.last_action;

        detailedBills.push({
          id: `legiscan_${bill.bill_id}`,
          billName: details.title.slice(0, 100),
          billNumber: details.bill_number,
          description: details.description || bill.title,
          currentStatus: STATUS_MAP[details.status] || `Status ${details.status}`,
          nextSteps: generateNextSteps(details.status, lastHistoryAction),
          passageChance: calculatePassageChance(details.status, details.history),
          whatsNext: `Last action: ${lastHistoryAction}. ${generateNextSteps(details.status, lastHistoryAction)}`,
          lastAction: `${bill.last_action_date}: ${lastHistoryAction}`,
          sponsor: sponsors,
          category: categorizeByKeywords(details.title, details.description || ''),
          priority: determinePriority(details.title, details.description || '')
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    legiscanCache = {
      data: detailedBills,
      timestamp: Date.now()
    };

    console.log(`Processed ${detailedBills.length} bills with full details`);
    return detailedBills;

  } catch (error) {
    console.error('Error searching LegiScan:', error);
    return [];
  }
}

export function clearLegiScanCache(): void {
  legiscanCache = null;
}

export function isLegiScanConfigured(): boolean {
  return !!LEGISCAN_API_KEY;
}
