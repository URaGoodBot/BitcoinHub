export interface CryptoEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  url: string;
  category: 'conference' | 'webinar' | 'workshop' | 'meetup' | 'launch';
  priority: 'high' | 'medium' | 'low';
}

let eventsCache: {
  timestamp: number;
  data: CryptoEvent[];
} | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(): boolean {
  return !!(eventsCache && Date.now() - eventsCache.timestamp < CACHE_DURATION);
}

function calculateDaysUntil(date: Date): number {
  const now = new Date();
  const timeDiff = date.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Generate dynamic events based on current date
function generateUpcomingEvents(): CryptoEvent[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const events: CryptoEvent[] = [];

  // Calculate next upcoming events from current date
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // July 2025 Events
  if (currentMonth === 6) { // July (0-indexed)
    // MY Blockchain Week 2025
    const mybwStart = new Date(2025, 6, 21); // July 21
    const mybwEnd = new Date(2025, 6, 22); // July 22
    
    if (mybwStart > now) {
      events.push({
        id: 'mybw2025',
        title: 'MY Blockchain Week 2025',
        description: 'Malaysia\'s premier blockchain and cryptocurrency conference featuring industry leaders and innovators.',
        startDate: mybwStart,
        endDate: mybwEnd,
        location: 'Kuala Lumpur, Malaysia',
        isVirtual: false,
        url: 'https://mybw2025.com/',
        category: 'conference',
        priority: 'high'
      });
    }

    // IVS Crypto 2025 KYOTO
    const ivsStart = new Date(2025, 6, 2); // July 2
    const ivsEnd = new Date(2025, 6, 4); // July 4
    
    if (ivsStart > now) {
      events.push({
        id: 'ivs2025',
        title: 'IVS Crypto 2025 KYOTO',
        description: 'Cryptocurrency and blockchain innovation conference in Asia\'s cultural capital.',
        startDate: ivsStart,
        endDate: ivsEnd,
        location: 'Kyoto, Japan',
        isVirtual: false,
        url: 'https://ivs.events/crypto2025/',
        category: 'conference',
        priority: 'medium'
      });
    }
  }

  // August 2025 Events
  const crypto2025Start = new Date(2025, 7, 17); // August 17
  const crypto2025End = new Date(2025, 7, 21); // August 21
  
  if (crypto2025Start > now) {
    events.push({
      id: 'crypto2025',
      title: 'Crypto 2025 Conference',
      description: '45th annual international cryptology conference by IACR featuring cutting-edge research.',
      startDate: crypto2025Start,
      endDate: crypto2025End,
      location: 'Santa Barbara, CA',
      isVirtual: false,
      url: 'https://crypto.iacr.org/2025/',
      category: 'conference',
      priority: 'high'
    });
  }

  // Coinfest Asia
  const coinfestStart = new Date(2025, 7, 21); // August 21
  const coinfestEnd = new Date(2025, 7, 22); // August 22
  
  if (coinfestStart > now) {
    events.push({
      id: 'coinfest2025',
      title: 'Coinfest Asia 2025',
      description: 'Largest crypto festival in Asia with 10,000+ participants from 90+ countries.',
      startDate: coinfestStart,
      endDate: coinfestEnd,
      location: 'Bali, Indonesia',
      isVirtual: false,
      url: 'https://coinfest.asia/',
      category: 'conference',
      priority: 'high'
    });
  }

  // September/October Events
  const token2049Start = new Date(2025, 9, 1); // October 1
  const token2049End = new Date(2025, 9, 2); // October 2
  
  if (token2049Start > now) {
    events.push({
      id: 'token2049singapore',
      title: 'Token2049 Singapore',
      description: 'World\'s largest crypto event with 25,000+ attendees and 400+ exhibitors.',
      startDate: token2049Start,
      endDate: token2049End,
      location: 'Marina Bay Sands, Singapore',
      isVirtual: false,
      url: 'https://www.asia.token2049.com/',
      category: 'conference',
      priority: 'high'
    });
  }

  // Add recurring monthly events
  const nextMonthStart = new Date(currentYear, currentMonth + 1, 15);
  const nextMonthEnd = new Date(currentYear, currentMonth + 1, 16);
  
  if (nextMonthStart > now) {
    events.push({
      id: `bitcoin_meetup_${currentMonth + 1}`,
      title: 'Bitcoin Developers Meetup',
      description: 'Monthly gathering of Bitcoin developers, entrepreneurs, and enthusiasts.',
      startDate: nextMonthStart,
      endDate: nextMonthEnd,
      location: 'San Francisco, CA',
      isVirtual: true,
      url: 'https://www.meetup.com/bitcoin-developers/',
      category: 'meetup',
      priority: 'medium'
    });
  }

  // Add weekly webinars
  const nextWeek = addDays(now, 7 - now.getDay() + 3); // Next Wednesday
  events.push({
    id: `weekly_webinar_${nextWeek.getTime()}`,
    title: 'Bitcoin Technical Analysis Webinar',
    description: 'Weekly analysis of Bitcoin price movements and market trends.',
    startDate: nextWeek,
    endDate: nextWeek,
    location: 'Online',
    isVirtual: true,
    url: 'https://bitcoin-analysis.com/webinar',
    category: 'webinar',
    priority: 'low'
  });

  // Sort by date and return top 3-4 upcoming events
  return events
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 4);
}

export async function getUpcomingEvents(): Promise<CryptoEvent[]> {
  try {
    if (isCacheValid()) {
      return eventsCache!.data;
    }

    const events = generateUpcomingEvents();

    // Update cache
    eventsCache = {
      timestamp: Date.now(),
      data: events
    };

    return events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

export function formatEventDate(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const end = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const year = startDate.getFullYear();

  if (startDate.toDateString() === endDate.toDateString()) {
    return `${start}, ${year}`;
  }

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${start}-${endDate.getDate()}, ${year}`;
  }

  return `${start} - ${end}, ${year}`;
}

export function getDaysUntilEvent(eventDate: Date): string {
  const days = calculateDaysUntil(eventDate);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}