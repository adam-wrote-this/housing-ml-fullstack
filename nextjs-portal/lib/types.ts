export type HousingFeatures = {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
};

export type App1PredictionResponse = {
  predicted_price: number;
  status: string;
  message: string;
};

export type PredictionHistoryItem = {
  id: string;
  createdAt: string;
  inputs: HousingFeatures;
  predictedPrice: number;
};

export type PropertyComparisonItem = {
  id: string;
  label: string;
  inputs: HousingFeatures;
  predictedPrice: number;
};

export type MarketSegment = {
  segment: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  avgSquareFootage: number;
};

export type MarketProperty = {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
};

export type MarketSummary = {
  totalProperties: number;
  averagePrice: number;
  medianPrice: number;
  averageSquareFootage: number;
  averageSchoolRating: number;
  minPrice: number;
  maxPrice: number;
};

export type MarketDashboard = {
  summary: MarketSummary;
  segments: MarketSegment[];
  properties: MarketProperty[];
};

export type WhatIfRequest = {
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  baselineSquareFootage?: number;
};

export type WhatIfResponse = {
  predictedPrice: number;
  baselinePrice?: number | null;
  priceDifference?: number | null;
  status: string;
  message: string;
};

export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  status?: string;
};
