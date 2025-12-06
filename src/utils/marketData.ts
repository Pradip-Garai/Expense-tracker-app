// Market data service for asset price estimates

export interface AssetData {
  type: 'car' | 'flat' | 'house' | 'land';
  location: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  appreciationRate: number; // Annual percentage
  description: string;
}

export interface LocationData {
  city: string;
  country: string;
  carPrice: { min: number; max: number; avg: number };
  flatPrice: { min: number; max: number; avg: number };
  housePrice: { min: number; max: number; avg: number };
  landPrice: { min: number; max: number; avg: number }; // per sq ft
  appreciationRates: {
    car: number;
    flat: number;
    house: number;
    land: number;
  };
}

// Market data for major Indian cities (prices in INR)
const marketData: Record<string, LocationData> = {
  'mumbai': {
    city: 'Mumbai',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 5000000, max: 50000000, avg: 15000000 },
    housePrice: { min: 10000000, max: 100000000, avg: 30000000 },
    landPrice: { min: 50000, max: 200000, avg: 100000 },
    appreciationRates: {
      car: -10, // Cars depreciate
      flat: 8,
      house: 10,
      land: 12,
    },
  },
  'delhi': {
    city: 'Delhi',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 4000000, max: 40000000, avg: 12000000 },
    housePrice: { min: 8000000, max: 80000000, avg: 25000000 },
    landPrice: { min: 40000, max: 150000, avg: 80000 },
    appreciationRates: {
      car: -10,
      flat: 7,
      house: 9,
      land: 11,
    },
  },
  'bangalore': {
    city: 'Bangalore',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 3500000, max: 35000000, avg: 10000000 },
    housePrice: { min: 7000000, max: 70000000, avg: 20000000 },
    landPrice: { min: 35000, max: 120000, avg: 70000 },
    appreciationRates: {
      car: -10,
      flat: 9,
      house: 11,
      land: 13,
    },
  },
  'hyderabad': {
    city: 'Hyderabad',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 3000000, max: 30000000, avg: 8000000 },
    housePrice: { min: 6000000, max: 60000000, avg: 15000000 },
    landPrice: { min: 25000, max: 100000, avg: 50000 },
    appreciationRates: {
      car: -10,
      flat: 8,
      house: 10,
      land: 12,
    },
  },
  'pune': {
    city: 'Pune',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 3000000, max: 30000000, avg: 9000000 },
    housePrice: { min: 6000000, max: 60000000, avg: 18000000 },
    landPrice: { min: 30000, max: 110000, avg: 60000 },
    appreciationRates: {
      car: -10,
      flat: 8,
      house: 10,
      land: 11,
    },
  },
  'chennai': {
    city: 'Chennai',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 3000000, max: 30000000, avg: 8500000 },
    housePrice: { min: 6000000, max: 60000000, avg: 16000000 },
    landPrice: { min: 28000, max: 105000, avg: 55000 },
    appreciationRates: {
      car: -10,
      flat: 7,
      house: 9,
      land: 10,
    },
  },
  'kolkata': {
    city: 'Kolkata',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 2500000, max: 25000000, avg: 7000000 },
    housePrice: { min: 5000000, max: 50000000, avg: 14000000 },
    landPrice: { min: 20000, max: 90000, avg: 45000 },
    appreciationRates: {
      car: -10,
      flat: 6,
      house: 8,
      land: 9,
    },
  },
  'default': {
    city: 'Other',
    country: 'India',
    carPrice: { min: 500000, max: 2000000, avg: 1000000 },
    flatPrice: { min: 2500000, max: 25000000, avg: 7000000 },
    housePrice: { min: 5000000, max: 50000000, avg: 15000000 },
    landPrice: { min: 25000, max: 100000, avg: 50000 },
    appreciationRates: {
      car: -10,
      flat: 7,
      house: 9,
      land: 10,
    },
  },
};

/**
 * Get market data for a specific location
 */
export function getLocationData(location: string): LocationData {
  const normalizedLocation = location.toLowerCase().trim();
  return marketData[normalizedLocation] || marketData['default'];
}

/**
 * Get asset price estimate
 */
export function getAssetPriceEstimate(
  assetType: 'car' | 'flat' | 'house' | 'land',
  location: string
): { min: number; max: number; avg: number } {
  const locationData = getLocationData(location);
  
  switch (assetType) {
    case 'car':
      return locationData.carPrice;
    case 'flat':
      return locationData.flatPrice;
    case 'house':
      return locationData.housePrice;
    case 'land':
      return locationData.landPrice;
    default:
      return { min: 0, max: 0, avg: 0 };
  }
}

/**
 * Get appreciation rate for asset type
 */
export function getAppreciationRate(
  assetType: 'car' | 'flat' | 'house' | 'land',
  location: string
): number {
  const locationData = getLocationData(location);
  return locationData.appreciationRates[assetType];
}

/**
 * Get asset description
 */
export function getAssetDescription(assetType: 'car' | 'flat' | 'house' | 'land'): string {
  const descriptions = {
    car: 'Personal vehicle for transportation',
    flat: 'Apartment or flat in a residential complex',
    house: 'Independent house with land',
    land: 'Plot of land for investment or construction',
  };
  return descriptions[assetType];
}

/**
 * Get all available cities
 */
export function getAvailableCities(): string[] {
  return Object.keys(marketData)
    .filter(key => key !== 'default')
    .map(key => marketData[key].city);
}

/**
 * Get asset types
 */
export function getAssetTypes(): Array<{ value: string; label: string; icon: string }> {
  return [
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'flat', label: 'Flat/Apartment', icon: '🏢' },
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'land', label: 'Land', icon: '🌳' },
  ];
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format large numbers in lakhs/crores
 */
export function formatLargeNumber(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else {
    return formatCurrency(amount);
  }
}
