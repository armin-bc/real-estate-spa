export interface Property {
  id: string;
  address: string;
  price: number;
}

export interface AnalysisResult {
  propertyId: string;
  score: number;
  recommendations: string[];
}
