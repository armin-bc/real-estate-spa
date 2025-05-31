export interface PropertyFormData {
  address: string;
  price: number;
  monthlyRent: number;
  monthlyExpenses: number;
  downPayment: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}

export interface AnalysisResult {
  propertyId: string;
  address: string;
  inputData: PropertyFormData;
  calculatedMetrics: {
    capRate: number;
    cashOnCash: number;
    monthlyCashFlow: number;
    annualIncome: number;
    roi: number;
    breakEvenRatio: number;
    onePercentRule: boolean;
    debtServiceCoverage: number;
    grossRentMultiplier: number;
    pricePerSquareFoot?: number;
  };
  marketComparison: {
    averageCapRate: number;
    marketTrend: "rising" | "stable" | "declining";
    competitiveRating: "excellent" | "good" | "average" | "below-average";
  };
  recommendations: string[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
    score: number;
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Frontend API Service for Real Estate Analysis
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface PropertyFormData {
  address: string;
  price: number;
  monthlyRent: number;
  monthlyExpenses: number;
  downPayment: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}

export interface AnalysisResult {
  propertyId: string;
  address: string;
  inputData: PropertyFormData;
  calculatedMetrics: {
    capRate: number;
    cashOnCash: number;
    monthlyCashFlow: number;
    annualIncome: number;
    roi: number;
    breakEvenRatio: number;
    onePercentRule: boolean;
    debtServiceCoverage: number;
    grossRentMultiplier: number;
    pricePerSquareFoot?: number;
  };
  marketComparison: {
    averageCapRate: number;
    marketTrend: "rising" | "stable" | "declining";
    competitiveRating: "excellent" | "good" | "average" | "below-average";
  };
  recommendations: string[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
    score: number;
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError("Network error or server unavailable", 0, error);
  }
}

// API Service object
const ApiService = {
  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return apiRequest("/health");
  },

  // Analyze property
  async analyzeProperty(
    propertyData: PropertyFormData
  ): Promise<ApiResponse<AnalysisResult>> {
    return apiRequest("/analyze", {
      method: "POST",
      body: JSON.stringify(propertyData),
    });
  },

  // Get analysis by ID
  async getAnalysis(analysisId: string): Promise<ApiResponse<AnalysisResult>> {
    return apiRequest(`/analysis/${analysisId}`);
  },

  // Get user's analysis history
  async getUserAnalyses(): Promise<ApiResponse<AnalysisResult[]>> {
    return apiRequest("/analyses");
  },

  // Utility method to handle common API errors
  handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return error.message || "Invalid input data";
        case 404:
          return "Resource not found";
        case 500:
          return "Server error. Please try again later.";
        case 0:
          return "Unable to connect to server. Please check your internet connection.";
        default:
          return error.message || "An unexpected error occurred";
      }
    }

    return "An unexpected error occurred";
  },

  // Validate property data before sending - returns field-mapped errors
  validatePropertyData(
    data: PropertyFormData
  ): { field: keyof PropertyFormData | "general"; message: string }[] {
    const errors: {
      field: keyof PropertyFormData | "general";
      message: string;
    }[] = [];

    if (!data.address?.trim()) {
      errors.push({
        field: "address",
        message: "Property address is required",
      });
    }

    if (!data.price || data.price <= 0) {
      errors.push({
        field: "price",
        message: "Valid purchase price is required",
      });
    }

    if (!data.monthlyRent || data.monthlyRent <= 0) {
      errors.push({
        field: "monthlyRent",
        message: "Valid monthly rent is required",
      });
    }

    if (data.monthlyExpenses === undefined || data.monthlyExpenses < 0) {
      errors.push({
        field: "monthlyExpenses",
        message: "Valid monthly expenses amount is required",
      });
    }

    if (!data.downPayment || data.downPayment < 0) {
      errors.push({
        field: "downPayment",
        message: "Valid down payment amount is required",
      });
    }

    // Business logic validations
    if (data.price && data.downPayment && data.downPayment > data.price) {
      errors.push({
        field: "downPayment",
        message: "Down payment cannot exceed purchase price",
      });
    }

    if (
      data.monthlyRent &&
      data.monthlyExpenses &&
      data.monthlyExpenses > data.monthlyRent * 2
    ) {
      errors.push({
        field: "monthlyExpenses",
        message: "Monthly expenses seem unusually high compared to rent",
      });
    }

    if (data.squareFeet && data.squareFeet <= 0) {
      errors.push({
        field: "squareFeet",
        message: "Square footage must be a positive number",
      });
    }

    if (data.bedrooms && data.bedrooms < 0) {
      errors.push({
        field: "bedrooms",
        message: "Number of bedrooms cannot be negative",
      });
    }

    if (data.bathrooms && data.bathrooms < 0) {
      errors.push({
        field: "bathrooms",
        message: "Number of bathrooms cannot be negative",
      });
    }

    if (
      data.yearBuilt &&
      (data.yearBuilt < 1800 || data.yearBuilt > new Date().getFullYear())
    ) {
      errors.push({
        field: "yearBuilt",
        message: "Please enter a valid year built",
      });
    }

    return errors;
  },
};

export default ApiService;
