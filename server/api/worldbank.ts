// World Bank Open Data API Integration
// API Documentation: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information

interface WorldBankDataPoint {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  decimal: number;
}

interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

interface WorldBankApiResponse extends Array<WorldBankResponse | WorldBankDataPoint[]> {}

interface EconomicIndicator {
  id: string;
  name: string;
  value: number | null;
  date: string;
  unit: string;
  change: number | null;
  description: string;
}

interface GlobalEconomicData {
  lastUpdated: string;
  usIndicators: EconomicIndicator[];
  globalIndicators: EconomicIndicator[];
  keyMetrics: {
    usgdp: EconomicIndicator | null;
    inflation: EconomicIndicator | null;
    unemployment: EconomicIndicator | null;
    moneySupply: EconomicIndicator | null;
  };
}

// Key economic indicators relevant to Bitcoin and crypto markets
const ECONOMIC_INDICATORS = {
  // US Indicators
  US_GDP: 'NY.GDP.MKTP.CD',                    // GDP (current US$)
  US_GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',          // GDP growth (annual %)
  US_INFLATION: 'FP.CPI.TOTL.ZG',              // Inflation, consumer prices (annual %)
  US_UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',           // Unemployment, total (% of total labor force)
  US_INTEREST_RATE: 'FR.INR.RINR',             // Real interest rate (%)
  US_MONEY_SUPPLY: 'FM.LBL.BMNY.GD.ZS',       // Broad money (% of GDP)
  US_DEBT_TO_GDP: 'GC.DOD.TOTL.GD.ZS',        // Central government debt, total (% of GDP)
  US_CURRENCY_SUPPLY: 'FM.LBL.MQMY.GD.ZS',    // Money and quasi money (M2) as % of GDP
  
  // Global Indicators
  GLOBAL_GDP: 'NY.GDP.MKTP.CD',                // World GDP
  GLOBAL_INFLATION: 'FP.CPI.TOTL.ZG',          // Global inflation
  GLOBAL_TRADE: 'NE.TRD.GNFS.ZS',             // Trade (% of GDP)
  GLOBAL_FDI: 'BX.KLT.DINV.WD.GD.ZS',         // Foreign direct investment, net inflows (% of GDP)
};

// Countries of interest
const COUNTRIES = {
  US: 'USA',
  CHINA: 'CHN', 
  EU: 'EMU',  // Euro area
  WORLD: 'WLD'
};

let economicDataCache: GlobalEconomicData | null = null;
let lastEconomicUpdate = 0;
const ECONOMIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (World Bank data is typically updated daily)

// Base URL for World Bank API v2
const BASE_URL = 'https://api.worldbank.org/v2';

/**
 * Fetch data from World Bank API for a specific indicator and country
 */
async function fetchWorldBankData(
  countryCode: string, 
  indicatorCode: string, 
  years: number = 5
): Promise<WorldBankDataPoint[]> {
  try {
    // Use mrv (most recent values) without mrnev for better compatibility
    const url = `${BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&mrv=${years}`;
    
    console.log(`🌍 Fetching World Bank data: ${indicatorCode} for ${countryCode}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BitcoinHub/1.0 (Economic Data Integration)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ World Bank API returned ${response.status}: ${response.statusText} for ${url}`);
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }

    const data: WorldBankApiResponse = await response.json();
    
    // World Bank API returns array with metadata at index 0 and data at index 1
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      const indicators = data[1] as WorldBankDataPoint[];
      const validIndicators = indicators.filter(item => item.value !== null);
      console.log(`✅ Retrieved ${validIndicators.length} valid data points for ${indicatorCode}`);
      return validIndicators;
    }
    
    console.log(`⚠️ No data returned for ${indicatorCode}`);
    return [];
  } catch (error) {
    console.error(`❌ Error fetching World Bank data for ${indicatorCode}:`, error);
    return [];
  }
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get proper unit for World Bank indicator based on indicator code
 */
function getIndicatorUnit(indicatorCode: string, originalUnit: string): string {
  // GDP indicators use current US dollars
  if (indicatorCode.includes('NY.GDP.MKTP.CD')) {
    return 'USD';
  }
  
  // Percentage indicators
  if (indicatorCode.includes('.ZG') || indicatorCode.includes('.ZS')) {
    return '%';
  }
  
  // Interest rate indicators
  if (indicatorCode.includes('FR.INR') || indicatorCode.includes('RINR')) {
    return '%';
  }
  
  // Use original unit if available, otherwise default to empty string
  return originalUnit || '';
}

/**
 * Format World Bank data into standardized indicator format
 */
function formatIndicator(
  data: WorldBankDataPoint[], 
  name: string, 
  description: string
): EconomicIndicator | null {
  if (!data || data.length === 0) return null;
  
  // Sort by date descending to get most recent data first
  const sortedData = data.sort((a, b) => parseInt(b.date) - parseInt(a.date));
  const latest = sortedData[0];
  const previous = sortedData[1];
  
  let change = null;
  if (previous && latest.value !== null && previous.value !== null) {
    change = calculateChange(latest.value, previous.value);
  }
  
  // Get proper unit based on indicator code
  const unit = getIndicatorUnit(latest.indicator.id, latest.unit);
  
  return {
    id: latest.indicator.id,
    name,
    value: latest.value,
    date: latest.date,
    unit,
    change,
    description
  };
}

/**
 * Fetch comprehensive economic data from World Bank
 */
export async function getWorldBankEconomicData(): Promise<GlobalEconomicData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (economicDataCache && (now - lastEconomicUpdate) < ECONOMIC_CACHE_DURATION) {
    console.log('📊 Returning cached World Bank economic data');
    return economicDataCache;
  }
  
  console.log('🔄 Fetching fresh World Bank economic data...');
  
  try {
    // Fetch US economic indicators
    const [
      usGdpData,
      usGdpGrowthData,
      usInflationData,
      usUnemploymentData,
      usInterestRateData,
      usMoneySupplyData,
      usDebtData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_GDP, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_GDP_GROWTH, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_INFLATION, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_UNEMPLOYMENT, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_INTEREST_RATE, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_MONEY_SUPPLY, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.US_DEBT_TO_GDP, 3)
    ]);

    // Fetch global indicators
    const [
      globalGdpData,
      globalInflationData,
      globalTradeData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_GDP, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_INFLATION, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_TRADE, 3)
    ]);

    // Format indicators
    const usGdp = formatIndicator(usGdpData, 'US GDP', 'United States Gross Domestic Product (current US$)');
    const usGdpGrowth = formatIndicator(usGdpGrowthData, 'US GDP Growth', 'United States GDP growth rate (annual %)');
    const usInflation = formatIndicator(usInflationData, 'US Inflation', 'United States consumer price inflation (annual %)');
    const usUnemployment = formatIndicator(usUnemploymentData, 'US Unemployment', 'United States unemployment rate (% of labor force)');
    const usInterestRate = formatIndicator(usInterestRateData, 'US Interest Rate', 'United States real interest rate (%)');
    const usMoneySupply = formatIndicator(usMoneySupplyData, 'US Money Supply', 'United States broad money (% of GDP)');
    const usDebt = formatIndicator(usDebtData, 'US Government Debt', 'United States central government debt (% of GDP)');

    const globalGdp = formatIndicator(globalGdpData, 'Global GDP', 'World Gross Domestic Product (current US$)');
    const globalInflation = formatIndicator(globalInflationData, 'Global Inflation', 'World consumer price inflation (annual %)');
    const globalTrade = formatIndicator(globalTradeData, 'Global Trade', 'World trade as percentage of GDP');

    // Build US indicators array
    const usIndicators: EconomicIndicator[] = [
      usGdp,
      usGdpGrowth,
      usInflation,
      usUnemployment,
      usInterestRate,
      usMoneySupply,
      usDebt
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    // Build global indicators array
    const globalIndicators: EconomicIndicator[] = [
      globalGdp,
      globalInflation,
      globalTrade
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const economicData: GlobalEconomicData = {
      lastUpdated: new Date().toISOString(),
      usIndicators,
      globalIndicators,
      keyMetrics: {
        usgdp: usGdp,
        inflation: usInflation,
        unemployment: usUnemployment,
        moneySupply: usMoneySupply
      }
    };

    // Cache the result
    economicDataCache = economicData;
    lastEconomicUpdate = now;

    console.log(`✅ World Bank economic data retrieved: ${usIndicators.length} US indicators, ${globalIndicators.length} global indicators`);
    
    return economicData;

  } catch (error) {
    console.error('❌ Error fetching World Bank economic data:', error);
    
    // Return fallback empty data structure
    const fallbackData: GlobalEconomicData = {
      lastUpdated: new Date().toISOString(),
      usIndicators: [],
      globalIndicators: [],
      keyMetrics: {
        usgdp: null,
        inflation: null,
        unemployment: null,
        moneySupply: null
      }
    };

    return fallbackData;
  }
}

/**
 * Get specific economic indicator by country and indicator code
 */
export async function getSpecificIndicator(
  countryCode: string, 
  indicatorCode: string,
  years: number = 10
): Promise<EconomicIndicator | null> {
  try {
    const data = await fetchWorldBankData(countryCode, indicatorCode, years);
    if (data.length === 0) return null;
    
    return formatIndicator(data, `${countryCode} ${indicatorCode}`, `Economic indicator ${indicatorCode} for ${countryCode}`);
  } catch (error) {
    console.error(`❌ Error fetching specific indicator ${indicatorCode} for ${countryCode}:`, error);
    return null;
  }
}

/**
 * Get historical time series data for an indicator
 */
export async function getIndicatorTimeSeries(
  countryCode: string,
  indicatorCode: string,
  years: number = 20
): Promise<Array<{date: string; value: number}>> {
  try {
    const data = await fetchWorldBankData(countryCode, indicatorCode, years);
    
    return data
      .filter(item => item.value !== null)
      .map(item => ({
        date: item.date,
        value: item.value as number
      }))
      .sort((a, b) => parseInt(a.date) - parseInt(b.date));
  } catch (error) {
    console.error(`❌ Error fetching time series for ${indicatorCode}:`, error);
    return [];
  }
}