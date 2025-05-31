import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Types
interface PropertyData {
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

interface AnalysisResult {
  propertyId: string;
  address: string;
  inputData: PropertyData;
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
    score: number; // 1-100
  };
  timestamp: string;
}

// Analysis calculation functions
const calculateRealEstateMetrics = (data: PropertyData) => {
  const { price, monthlyRent, monthlyExpenses, downPayment, squareFeet } = data;

  // Basic calculations
  const annualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualIncome = annualRent - annualExpenses;
  const monthlyCashFlow = monthlyRent - monthlyExpenses;

  // Key metrics
  const capRate = (annualIncome / price) * 100;
  const cashOnCash = (annualIncome / downPayment) * 100;
  const roi = cashOnCash; // Simplified
  const breakEvenRatio = monthlyExpenses / monthlyRent;
  const onePercentRule = monthlyRent >= price * 0.01;

  // Advanced metrics
  const loanAmount = price - downPayment;
  const monthlyLoanPayment = calculateMortgagePayment(loanAmount, 0.065, 30); // 6.5% for 30 years
  const debtServiceCoverage = monthlyCashFlow / monthlyLoanPayment;
  const grossRentMultiplier = price / annualRent;
  const pricePerSquareFoot = squareFeet ? price / squareFeet : undefined;

  return {
    capRate,
    cashOnCash,
    monthlyCashFlow,
    annualIncome,
    roi,
    breakEvenRatio,
    onePercentRule,
    debtServiceCoverage,
    grossRentMultiplier,
    pricePerSquareFoot,
  };
};

const calculateMortgagePayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return monthlyPayment;
};

const generateMarketComparison = (capRate: number, location: string) => {
  // TODO: Integrate with real market data APIs
  // For now, using mock data based on typical market ranges

  const marketData = {
    urban: { avgCapRate: 5.5, trend: "rising" as const },
    suburban: { avgCapRate: 7.2, trend: "stable" as const },
    rural: { avgCapRate: 8.1, trend: "declining" as const },
    default: { avgCapRate: 6.5, trend: "stable" as const },
  };

  // Simple location classification (in real app, use geocoding)
  const locationKey = location.toLowerCase().includes("city")
    ? "urban"
    : "default";
  const market = marketData[locationKey] || marketData.default;

  let competitiveRating: "excellent" | "good" | "average" | "below-average";

  if (capRate >= market.avgCapRate + 2) competitiveRating = "excellent";
  else if (capRate >= market.avgCapRate) competitiveRating = "good";
  else if (capRate >= market.avgCapRate - 1) competitiveRating = "average";
  else competitiveRating = "below-average";

  return {
    averageCapRate: market.avgCapRate,
    marketTrend: market.trend,
    competitiveRating,
  };
};

const generateRecommendations = (
  metrics: any,
  data: PropertyData
): string[] => {
  const recommendations: string[] = [];

  // Cap rate analysis
  if (metrics.capRate < 4) {
    recommendations.push(
      "Consider negotiating a lower purchase price. Cap rate below 4% indicates potential overvaluation."
    );
  } else if (metrics.capRate > 10) {
    recommendations.push(
      "Excellent cap rate! Verify property condition and local market stability."
    );
  }

  // Cash flow analysis
  if (metrics.monthlyCashFlow < 0) {
    recommendations.push(
      "Negative cash flow detected. Consider increasing rent, reducing expenses, or renegotiating purchase price."
    );
  } else if (metrics.monthlyCashFlow > 500) {
    recommendations.push(
      "Strong positive cash flow. This property shows excellent income potential."
    );
  }

  // 1% rule
  if (!metrics.onePercentRule) {
    recommendations.push(
      "Property does not meet the 1% rule. Consider if the location justifies lower rental yield."
    );
  }

  // Debt service coverage
  if (metrics.debtServiceCoverage < 1.2) {
    recommendations.push(
      "Low debt service coverage ratio. Consider larger down payment or better financing terms."
    );
  }

  // Price per square foot
  if (metrics.pricePerSquareFoot && metrics.pricePerSquareFoot > 200) {
    recommendations.push(
      "High price per square foot. Verify this is justified by location and property quality."
    );
  }

  // Break-even ratio
  if (metrics.breakEvenRatio > 0.8) {
    recommendations.push(
      "High expense ratio. Look for opportunities to reduce operating costs."
    );
  }

  return recommendations;
};

const assessRisk = (metrics: any, data: PropertyData) => {
  let riskScore = 50; // Start neutral
  const riskFactors: string[] = [];

  // Cap rate risk
  if (metrics.capRate < 4) {
    riskScore += 20;
    riskFactors.push("Low cap rate increases investment risk");
  } else if (metrics.capRate > 12) {
    riskScore += 15;
    riskFactors.push(
      "Very high cap rate may indicate market or property issues"
    );
  }

  // Cash flow risk
  if (metrics.monthlyCashFlow < 0) {
    riskScore += 25;
    riskFactors.push("Negative cash flow requires ongoing capital injection");
  }

  // Debt coverage risk
  if (metrics.debtServiceCoverage < 1.2) {
    riskScore += 15;
    riskFactors.push("Low debt service coverage increases financial risk");
  }

  // Market risk
  if (metrics.breakEvenRatio > 0.85) {
    riskScore += 10;
    riskFactors.push("High expense ratio reduces profit margins");
  }

  // Property age risk (if provided)
  if (data.yearBuilt && new Date().getFullYear() - data.yearBuilt > 50) {
    riskScore += 10;
    riskFactors.push("Older property may require significant maintenance");
  }

  // Determine risk level
  let level: "low" | "medium" | "high";
  if (riskScore <= 40) level = "low";
  else if (riskScore <= 70) level = "medium";
  else level = "high";

  return {
    level,
    factors: riskFactors,
    score: Math.min(100, Math.max(0, riskScore)),
  };
};

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Real Estate Analysis API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.post("/api/analyze", (req: Request, res: Response) => {
  try {
    const propertyData: PropertyData = req.body;

    // Basic validation (server-side)
    if (
      !propertyData.address ||
      !propertyData.price ||
      !propertyData.monthlyRent
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: address, price, and monthlyRent are required",
      });
    }

    if (propertyData.price <= 0 || propertyData.monthlyRent <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price and monthly rent must be positive numbers",
      });
    }

    // Generate unique property ID
    const propertyId = `prop_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate metrics
    const calculatedMetrics = calculateRealEstateMetrics(propertyData);

    // Generate market comparison
    const marketComparison = generateMarketComparison(
      calculatedMetrics.capRate,
      propertyData.address
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      calculatedMetrics,
      propertyData
    );

    // Assess risk
    const riskAssessment = assessRisk(calculatedMetrics, propertyData);

    const analysisResult: AnalysisResult = {
      propertyId,
      address: propertyData.address,
      inputData: propertyData,
      calculatedMetrics,
      marketComparison,
      recommendations,
      riskAssessment,
      timestamp: new Date().toISOString(),
    };

    // TODO: Save to database
    console.log(`Analysis completed for property: ${propertyData.address}`);

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during analysis",
    });
  }
});

// Get analysis by ID (placeholder for future implementation)
app.get("/api/analysis/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Retrieve from database
  res.status(404).json({
    success: false,
    error: "Analysis not found. Database integration pending.",
  });
});

// List user's analyses (placeholder for future implementation)
app.get("/api/analyses", (req: Request, res: Response) => {
  // TODO: Implement user authentication and retrieve user's analyses
  res.json({
    success: true,
    data: [],
    message: "User analysis history. Authentication system pending.",
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Real Estate Analysis API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔗 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
});

export default app;
