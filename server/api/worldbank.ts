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
  liquidityIndicators: EconomicIndicator[];
  debasementIndicators: EconomicIndicator[];
  capitalFlowIndicators: EconomicIndicator[];
  financialStressIndicators: EconomicIndicator[];
  keyMetrics: {
    usgdp: EconomicIndicator | null;
    inflation: EconomicIndicator | null;
    unemployment: EconomicIndicator | null;
    moneySupply: EconomicIndicator | null;
    m2Growth: EconomicIndicator | null;
    fiscalBalance: EconomicIndicator | null;
  };
}

// Key economic indicators relevant to Bitcoin and crypto markets
const ECONOMIC_INDICATORS = {
  // Core US Indicators
  US_GDP: 'NY.GDP.MKTP.CD',                    // GDP (current US$)
  US_GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',          // GDP growth (annual %)
  US_INFLATION: 'FP.CPI.TOTL.ZG',              // Inflation, consumer prices (annual %)
  US_UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',           // Unemployment, total (% of total labor force)
  US_INTEREST_RATE: 'FR.INR.RINR',             // Real interest rate (%)
  US_MONEY_SUPPLY: 'FM.LBL.BMNY.GD.ZS',       // Broad money (% of GDP)
  US_DEBT_TO_GDP: 'GC.DOD.TOTL.GD.ZS',        // Central government debt, total (% of GDP)
  
  // Core Global Indicators
  GLOBAL_GDP: 'NY.GDP.MKTP.CD',                // World GDP
  GLOBAL_INFLATION: 'FP.CPI.TOTL.ZG',          // Global inflation
  GLOBAL_TRADE: 'NE.TRD.GNFS.ZS',             // Trade (% of GDP)

  // Global Liquidity Conditions
  GLOBAL_M2_GROWTH: 'FM.LBL.MQMY.ZG',         // Money and quasi money (M2) growth (annual %)
  GLOBAL_M2_GDP: 'FM.LBL.MQMY.GD.ZS',         // Money and quasi money (M2) as % of GDP
  GLOBAL_CREDIT_PRIVATE: 'FS.AST.PRVT.GD.ZS', // Domestic credit to private sector (% of GDP)
  GLOBAL_CREDIT_DOMESTIC: 'FS.AST.DOMS.GD.ZS', // Domestic credit provided by financial sector (% of GDP)
  GLOBAL_LENDING_RATE: 'FR.INR.LEND',         // Lending interest rate (%)
  GLOBAL_DEPOSIT_RATE: 'FR.INR.DPST',         // Deposit interest rate (%)

  // Currency Debasement Signals
  GLOBAL_GDP_DEFLATOR: 'NY.GDP.DEFL.KD.ZG',   // GDP deflator (annual %)
  GLOBAL_FISCAL_BALANCE: 'GC.BAL.CASH.GD.ZS', // Central government cash surplus/deficit (% of GDP)
  GLOBAL_GOV_EXPENSE: 'GC.XPN.TOTL.GD.ZS',    // Expense (% of GDP)
  GLOBAL_GOV_REVENUE: 'GC.REV.XGRT.GD.ZS',    // Revenue, excluding grants (% of GDP)
  GLOBAL_EXCHANGE_RATE: 'PA.NUS.FCRF',        // Official exchange rate (LCU per US$, period average)

  // Capital Flow Patterns
  GLOBAL_CURRENT_ACCOUNT: 'BN.CAB.XOKA.GD.ZS', // Current account balance (% of GDP)
  GLOBAL_RESERVES_TOTAL: 'FI.RES.TOTL.CD',    // Total reserves including gold (current US$)
  GLOBAL_RESERVES_MONTHS: 'FI.RES.TOTL.MO',   // Total reserves in months of imports
  GLOBAL_FDI_INFLOWS: 'BX.KLT.DINV.WD.GD.ZS', // Foreign direct investment, net inflows (% of GDP)
  GLOBAL_PORTFOLIO_EQUITY: 'BX.PEF.TOTL.CD',  // Portfolio equity, net inflows (BoP, current US$)
  GLOBAL_REMITTANCES: 'BX.TRF.PWKR.DT.GD.ZS', // Personal remittances, received (% of GDP)

  // Financial System Stress
  GLOBAL_NPL_RATIO: 'FB.AST.NPER.ZS',         // Bank nonperforming loans to total gross loans (%)
  GLOBAL_BANK_ZSCORE: 'GFDD.SI.01',           // Bank Z-score
  GLOBAL_BANK_LIQUIDITY: 'GFDD.LI.02',        // Bank liquid reserves to bank assets ratio (%)
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
  
  // Reserves and portfolio flows use current US dollars
  if (indicatorCode.includes('FI.RES.TOTL.CD') || indicatorCode.includes('BX.PEF.TOTL.CD')) {
    return 'USD';
  }
  
  // Exchange rate indicators
  if (indicatorCode.includes('PA.NUS.FCRF')) {
    return 'LCU/USD';
  }
  
  // Months indicators
  if (indicatorCode.includes('FI.RES.TOTL.MO')) {
    return 'months';
  }
  
  // Percentage indicators
  if (indicatorCode.includes('.ZG') || indicatorCode.includes('.ZS')) {
    return '%';
  }
  
  // Interest rate indicators
  if (indicatorCode.includes('FR.INR') || indicatorCode.includes('RINR') || 
      indicatorCode.includes('LEND') || indicatorCode.includes('DPST')) {
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
  
  console.log('🔄 Fetching comprehensive World Bank economic data...');
  
  try {
    // Fetch core US economic indicators
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

    // Fetch core global indicators
    const [
      globalGdpData,
      globalInflationData,
      globalTradeData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_GDP, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_INFLATION, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_TRADE, 3)
    ]);

    // Fetch global liquidity indicators
    const [
      m2GrowthData,
      m2GdpData,
      creditPrivateData,
      creditDomesticData,
      lendingRateData,
      depositRateData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_M2_GROWTH, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_M2_GDP, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_CREDIT_PRIVATE, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_CREDIT_DOMESTIC, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_LENDING_RATE, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_DEPOSIT_RATE, 3)
    ]);

    // Fetch debasement indicators
    const [
      gdpDeflatorData,
      fiscalBalanceData,
      govExpenseData,
      govRevenueData,
      exchangeRateData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_GDP_DEFLATOR, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_FISCAL_BALANCE, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_GOV_EXPENSE, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_GOV_REVENUE, 3),
      fetchWorldBankData(COUNTRIES.US, ECONOMIC_INDICATORS.GLOBAL_EXCHANGE_RATE, 3) // USD exchange rate
    ]);

    // Fetch capital flow indicators
    const [
      currentAccountData,
      reservesTotalData,
      reservesMonthsData,
      fdiInflowsData,
      portfolioEquityData,
      remittancesData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_CURRENT_ACCOUNT, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_RESERVES_TOTAL, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_RESERVES_MONTHS, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_FDI_INFLOWS, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_PORTFOLIO_EQUITY, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_REMITTANCES, 3)
    ]);

    // Fetch financial stress indicators
    const [
      nplRatioData,
      bankZScoreData,
      bankLiquidityData
    ] = await Promise.all([
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_NPL_RATIO, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_BANK_ZSCORE, 3),
      fetchWorldBankData(COUNTRIES.WORLD, ECONOMIC_INDICATORS.GLOBAL_BANK_LIQUIDITY, 3)
    ]);

    // Format core indicators
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

    // Format liquidity indicators
    const m2Growth = formatIndicator(m2GrowthData, 'Global M2 Growth', 'Money supply expansion rate - key Bitcoin liquidity driver');
    const m2Gdp = formatIndicator(m2GdpData, 'Global M2/GDP', 'Money supply relative to economic output - liquidity abundance');
    const creditPrivate = formatIndicator(creditPrivateData, 'Credit to Private Sector', 'Credit expansion to private sector - risk appetite proxy');
    const creditDomestic = formatIndicator(creditDomesticData, 'Domestic Credit', 'Total domestic credit by financial sector');
    const lendingRate = formatIndicator(lendingRateData, 'Global Lending Rates', 'Cost of borrowing - liquidity accessibility');
    const depositRate = formatIndicator(depositRateData, 'Global Deposit Rates', 'Savings yield vs inflation - Bitcoin opportunity cost');

    // Format debasement indicators
    const gdpDeflator = formatIndicator(gdpDeflatorData, 'Global GDP Deflator', 'Broad price level changes - monetary debasement signal');
    const fiscalBalance = formatIndicator(fiscalBalanceData, 'Global Fiscal Balance', 'Government budget surplus/deficit - monetization pressure');
    const govExpense = formatIndicator(govExpenseData, 'Government Spending', 'Government expenditure as % of GDP - fiscal expansion');
    const govRevenue = formatIndicator(govRevenueData, 'Government Revenue', 'Tax revenue capacity vs spending needs');
    const exchangeRate = formatIndicator(exchangeRateData, 'USD Exchange Rate', 'Local currency vs USD - devaluation indicator');

    // Format capital flow indicators
    const currentAccount = formatIndicator(currentAccountData, 'Current Account Balance', 'External funding needs - currency vulnerability');
    const reservesTotal = formatIndicator(reservesTotalData, 'Total Reserves', 'Foreign exchange reserves including gold');
    const reservesMonths = formatIndicator(reservesMonthsData, 'Import Cover', 'Reserve adequacy in months of imports');
    const fdiInflows = formatIndicator(fdiInflowsData, 'FDI Inflows', 'Foreign direct investment - long-term capital');
    const portfolioEquity = formatIndicator(portfolioEquityData, 'Portfolio Flows', 'Equity portfolio flows - risk sentiment indicator');
    const remittances = formatIndicator(remittancesData, 'Remittances', 'Cross-border personal transfers - crypto adoption driver');

    // Format financial stress indicators
    const nplRatio = formatIndicator(nplRatioData, 'Non-Performing Loans', 'Banking system health - crisis probability');
    const bankZScore = formatIndicator(bankZScoreData, 'Bank Z-Score', 'Banking system stability - default probability');
    const bankLiquidity = formatIndicator(bankLiquidityData, 'Bank Liquidity', 'Banking sector liquid reserves ratio');

    // Build indicator arrays
    const usIndicators: EconomicIndicator[] = [
      usGdp, usGdpGrowth, usInflation, usUnemployment, usInterestRate, usMoneySupply, usDebt
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const globalIndicators: EconomicIndicator[] = [
      globalGdp, globalInflation, globalTrade
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const liquidityIndicators: EconomicIndicator[] = [
      m2Growth, m2Gdp, creditPrivate, creditDomestic, lendingRate, depositRate
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const debasementIndicators: EconomicIndicator[] = [
      gdpDeflator, fiscalBalance, govExpense, govRevenue, exchangeRate
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const capitalFlowIndicators: EconomicIndicator[] = [
      currentAccount, reservesTotal, reservesMonths, fdiInflows, portfolioEquity, remittances
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const financialStressIndicators: EconomicIndicator[] = [
      nplRatio, bankZScore, bankLiquidity
    ].filter((indicator): indicator is EconomicIndicator => indicator !== null);

    const economicData: GlobalEconomicData = {
      lastUpdated: new Date().toISOString(),
      usIndicators,
      globalIndicators,
      liquidityIndicators,
      debasementIndicators,
      capitalFlowIndicators,
      financialStressIndicators,
      keyMetrics: {
        usgdp: usGdp,
        inflation: usInflation,
        unemployment: usUnemployment,
        moneySupply: usMoneySupply,
        m2Growth: m2Growth,
        fiscalBalance: fiscalBalance
      }
    };

    // Cache the result
    economicDataCache = economicData;
    lastEconomicUpdate = now;

    console.log(`✅ Comprehensive World Bank data retrieved: ${usIndicators.length} US, ${globalIndicators.length} global, ${liquidityIndicators.length} liquidity, ${debasementIndicators.length} debasement, ${capitalFlowIndicators.length} capital flow, ${financialStressIndicators.length} stress indicators`);
    
    return economicData;

  } catch (error) {
    console.error('❌ Error fetching World Bank economic data:', error);
    
    // Return fallback empty data structure
    const fallbackData: GlobalEconomicData = {
      lastUpdated: new Date().toISOString(),
      usIndicators: [],
      globalIndicators: [],
      liquidityIndicators: [],
      debasementIndicators: [],
      capitalFlowIndicators: [],
      financialStressIndicators: [],
      keyMetrics: {
        usgdp: null,
        inflation: null,
        unemployment: null,
        moneySupply: null,
        m2Growth: null,
        fiscalBalance: null
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