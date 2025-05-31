import PropertyChart from "@/components/charts/PropertyChart";
//import { ExportService } from "@/utils/exportService";
import {
  AlertTriangle,
  ArrowLeft,
  BookmarkPlus,
  CheckCircle,
  Download,
  FileText,
  Share2,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface EnhancedAnalysisData {
  propertyId: string;
  address: string;
  inputData: {
    price: number;
    monthlyRent: number;
    monthlyExpenses: number;
    downPayment: number;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
  };
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

const Results: React.FC = () => {
  const { t } = useTranslation();
  const [analysisData, setAnalysisData] = useState<EnhancedAnalysisData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<
    "roi" | "cashflow" | "comparison" | "market-trends"
  >("roi");
  const [dataSource, setDataSource] = useState<"api" | "fallback">("fallback");

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    setIsLoading(true);

    try {
      // First try to get API analysis result
      const savedApiResult = localStorage.getItem("analysisResult");

      if (savedApiResult) {
        const apiData = JSON.parse(savedApiResult);
        setAnalysisData(apiData);
        setDataSource("api");
      } else {
        // Fallback to form data with basic calculations
        const savedFormData = localStorage.getItem("propertyAnalysisData");

        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          const fallbackAnalysis = createFallbackAnalysis(formData);
          setAnalysisData(fallbackAnalysis);
          setDataSource("fallback");
        } else {
          // No data available
          setAnalysisData(null);
        }
      }
    } catch (error) {
      console.error("Error loading analysis data:", error);
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createFallbackAnalysis = (formData: any): EnhancedAnalysisData => {
    const price = Number(formData.price);
    const monthlyRent = Number(formData.monthlyRent);
    const monthlyExpenses = Number(formData.monthlyExpenses);
    const downPayment = Number(formData.downPayment);

    const annualRent = monthlyRent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualIncome = annualRent - annualExpenses;
    const monthlyCashFlow = monthlyRent - monthlyExpenses;

    const capRate = (annualIncome / price) * 100;
    const cashOnCash = (annualIncome / downPayment) * 100;
    const breakEvenRatio = monthlyExpenses / monthlyRent;
    const onePercentRule = monthlyRent >= price * 0.01;

    return {
      propertyId: `fallback_${Date.now()}`,
      address: formData.address,
      inputData: formData,
      calculatedMetrics: {
        capRate,
        cashOnCash,
        monthlyCashFlow,
        annualIncome,
        roi: cashOnCash,
        breakEvenRatio,
        onePercentRule,
        debtServiceCoverage: 1.2, // Estimated
        grossRentMultiplier: price / annualRent,
        pricePerSquareFoot: formData.squareFeet
          ? price / formData.squareFeet
          : undefined,
      },
      marketComparison: {
        averageCapRate: 6.5, // Default market average
        marketTrend: "stable",
        competitiveRating:
          capRate >= 8 ? "excellent" : capRate >= 6 ? "good" : "average",
      },
      recommendations: generateBasicRecommendations(
        capRate,
        monthlyCashFlow,
        onePercentRule
      ),
      riskAssessment: {
        level:
          capRate < 4 || monthlyCashFlow < 0
            ? "high"
            : capRate >= 8 && monthlyCashFlow > 500
            ? "low"
            : "medium",
        factors: [],
        score: Math.max(
          0,
          Math.min(100, 50 + (capRate - 6) * 5 + monthlyCashFlow / 100)
        ),
      },
      timestamp: new Date().toISOString(),
    };
  };

  const generateBasicRecommendations = (
    capRate: number,
    cashFlow: number,
    onePercentRule: boolean
  ): string[] => {
    const recommendations: string[] = [];

    if (capRate < 5) {
      recommendations.push(
        "Consider negotiating a lower purchase price due to low cap rate."
      );
    }
    if (cashFlow < 0) {
      recommendations.push(
        "Property has negative cash flow. Review expenses or rental income."
      );
    }
    if (!onePercentRule) {
      recommendations.push(
        "Property does not meet the 1% rule for optimal cash flow."
      );
    }
    if (capRate >= 8 && cashFlow > 500) {
      recommendations.push(
        "Excellent investment opportunity with strong fundamentals."
      );
    }

    return recommendations;
  };

  const getMetricColor = (
    value: number,
    type: "capRate" | "cashFlow" | "roi"
  ) => {
    switch (type) {
      case "capRate":
        if (value >= 8) return "text-green-600";
        if (value >= 5) return "text-yellow-600";
        return "text-red-600";
      case "cashFlow":
        if (value >= 500) return "text-green-600";
        if (value >= 0) return "text-yellow-600";
        return "text-red-600";
      case "roi":
        if (value >= 15) return "text-green-600";
        if (value >= 10) return "text-yellow-600";
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleExportPDF = async () => {
    // if (!analysisData) return;
    // try {
    //   const exportData = ExportService.prepareExportData(analysisData);
    //   await ExportService.exportToPDF(exportData);
    // } catch (error) {
    //   console.error("PDF export error:", error);
    //   alert("PDF export failed. Please try again.");
    // }
    console.log("PDF export - coming soon!");
    alert("PDF export functionality coming soon!");
  };

  const handleExportWord = async () => {
    // if (!analysisData) return;
    // try {
    //   const exportData = ExportService.prepareExportData(analysisData);
    //   await ExportService.exportToWord(exportData);
    // } catch (error) {
    //   console.error("Word export error:", error);
    //   alert("Word export failed. Please try again.");
    // }
    console.log("Word export - coming soon!");
    alert("Word export functionality coming soon!");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCompetitiveRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "average":
        return "text-yellow-600";
      case "below-average":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {t("results.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t("results.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t("results.noData")}
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("results.backToForm")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 flex items-center mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("results.backToAnalysis")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("results.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {analysisData.address}
          </p>
          {/* Data Source Indicator */}
          <div className="flex items-center mt-2">
            {dataSource === "api" ? (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>{t("results.enhancedApiAnalysis")}</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{t("results.basicAnalysisMode")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{t("results.exportPdf")}</span>
          </button>
          <button
            onClick={handleExportWord}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>{t("results.exportWord")}</span>
          </button>
          <button className="btn-secondary">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="btn-secondary">
            <BookmarkPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("results.capRate")}
          </h3>
          <p
            className={`text-2xl font-bold ${getMetricColor(
              analysisData.calculatedMetrics.capRate,
              "capRate"
            )}`}
          >
            {analysisData.calculatedMetrics.capRate.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t("results.vsMarketAvg", {
              percent: analysisData.marketComparison.averageCapRate,
            })}
          </p>
        </div>

        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("results.monthlyCashFlow")}
          </h3>
          <p
            className={`text-2xl font-bold ${getMetricColor(
              analysisData.calculatedMetrics.monthlyCashFlow,
              "cashFlow"
            )}`}
          >
            ${analysisData.calculatedMetrics.monthlyCashFlow.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analysisData.calculatedMetrics.monthlyCashFlow >= 500
              ? t("results.strong")
              : analysisData.calculatedMetrics.monthlyCashFlow >= 0
              ? t("results.positive")
              : t("results.negative")}
          </p>
        </div>

        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("results.cashOnCashROI")}
          </h3>
          <p
            className={`text-2xl font-bold ${getMetricColor(
              analysisData.calculatedMetrics.roi,
              "roi"
            )}`}
          >
            {analysisData.calculatedMetrics.cashOnCash.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t("results.annualReturn")}
          </p>
        </div>

        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("results.riskLevel")}
          </h3>
          <p
            className={`text-lg font-bold px-2 py-1 rounded ${getRiskColor(
              analysisData.riskAssessment.level
            )}`}
          >
            {t(`results.riskLevels.${analysisData.riskAssessment.level}`)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t("results.score")}: {analysisData.riskAssessment.score}/100
          </p>
        </div>
      </div>

      {/* Market Comparison Card */}
      {dataSource === "api" && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("results.marketAnalysis")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("results.marketTrend")}
              </p>
              <p
                className={`font-semibold text-lg ${
                  analysisData.marketComparison.marketTrend === "rising"
                    ? "text-green-600"
                    : analysisData.marketComparison.marketTrend === "stable"
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {t(
                  `results.marketTrendValues.${analysisData.marketComparison.marketTrend}`
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("results.competitiveRating")}
              </p>
              <p
                className={`font-semibold text-lg ${getCompetitiveRatingColor(
                  analysisData.marketComparison.competitiveRating
                )}`}
              >
                {t(
                  `results.competitiveRatingValues.${analysisData.marketComparison.competitiveRating.replace(
                    "-",
                    ""
                  )}`
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("results.marketAverageCapRate")}
              </p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {analysisData.marketComparison.averageCapRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: "roi", label: t("results.chartTabs.roiAnalysis") },
              { key: "cashflow", label: t("results.chartTabs.cashFlow") },
              {
                key: "comparison",
                label: t("results.chartTabs.metricsComparison"),
              },
              {
                key: "market-trends",
                label: t("results.chartTabs.marketTrends"),
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveChartTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeChartTab === tab.key
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Chart Display */}
      <div className="mb-8">
        <PropertyChart type={activeChartTab} data={analysisData} />
      </div>

      {/* Enhanced Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Financial Summary */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("results.sections.financialSummary")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.purchasePrice")}:
              </span>
              <span className="font-medium">
                ${analysisData.inputData.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.downPayment")}:
              </span>
              <span className="font-medium">
                ${analysisData.inputData.downPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.monthlyRent")}:
              </span>
              <span className="font-medium">
                ${analysisData.inputData.monthlyRent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.monthlyExpenses")}:
              </span>
              <span className="font-medium">
                ${analysisData.inputData.monthlyExpenses.toLocaleString()}
              </span>
            </div>
            {analysisData.calculatedMetrics.pricePerSquareFoot && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("results.fields.pricePerSqFt")}:
                </span>
                <span className="font-medium">
                  $
                  {analysisData.calculatedMetrics.pricePerSquareFoot.toFixed(0)}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                {t("results.fields.annualNetIncome")}:
              </span>
              <span className="font-bold text-primary-600">
                ${analysisData.calculatedMetrics.annualIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("results.sections.advancedMetrics")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.onePercentRule")}:
              </span>
              <span
                className={`font-medium ${
                  analysisData.calculatedMetrics.onePercentRule
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {analysisData.calculatedMetrics.onePercentRule
                  ? t("results.pass")
                  : t("results.fail")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.debtServiceCoverage")}:
              </span>
              <span className="font-medium">
                {analysisData.calculatedMetrics.debtServiceCoverage.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.grossRentMultiplier")}:
              </span>
              <span className="font-medium">
                {analysisData.calculatedMetrics.grossRentMultiplier.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("results.fields.breakEvenRatio")}:
              </span>
              <span className="font-medium">
                {(analysisData.calculatedMetrics.breakEvenRatio * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recommendations */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {dataSource === "api"
            ? t("results.aiPoweredRecommendations")
            : t("results.sections.basicRecommendations")}
        </h3>
        <div className="space-y-3">
          {analysisData.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {recommendation}
              </p>
            </div>
          ))}

          {analysisData.recommendations.length === 0 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>{t("results.goodInvestment")}:</strong>{" "}
                {t("results.solidFundamentals")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment (API only) */}
      {dataSource === "api" &&
        analysisData.riskAssessment.factors.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("results.riskAssessment")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("results.overallRiskLevel")}:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                    analysisData.riskAssessment.level
                  )}`}
                >
                  {t(`results.riskLevels.${analysisData.riskAssessment.level}`)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analysisData.riskAssessment.level === "low"
                      ? "bg-green-500"
                      : analysisData.riskAssessment.level === "medium"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${analysisData.riskAssessment.score}%` }}
                ></div>
              </div>

              {analysisData.riskAssessment.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {factor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Property Details (if available) */}
      {(analysisData.inputData.squareFeet ||
        analysisData.inputData.bedrooms ||
        analysisData.inputData.bathrooms) && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("results.sections.propertyDetails")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analysisData.inputData.squareFeet && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("results.fields.squareFeet")}
                </p>
                <p className="font-semibold text-lg">
                  {analysisData.inputData.squareFeet.toLocaleString()}
                </p>
              </div>
            )}
            {analysisData.inputData.bedrooms && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("results.fields.bedrooms")}
                </p>
                <p className="font-semibold text-lg">
                  {analysisData.inputData.bedrooms}
                </p>
              </div>
            )}
            {analysisData.inputData.bathrooms && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("results.fields.bathrooms")}
                </p>
                <p className="font-semibold text-lg">
                  {analysisData.inputData.bathrooms}
                </p>
              </div>
            )}
            {analysisData.inputData.yearBuilt && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("results.fields.yearBuilt")}
                </p>
                <p className="font-semibold text-lg">
                  {analysisData.inputData.yearBuilt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          {t("results.analysisCompleted", {
            date: new Date(analysisData.timestamp).toLocaleDateString(),
            time: new Date(analysisData.timestamp).toLocaleTimeString(),
          })}
        </p>
        <p className="mt-1">
          {t("results.propertyId")}: {analysisData.propertyId}
        </p>
        {dataSource === "fallback" && (
          <p className="mt-2 text-blue-600 dark:text-blue-400">
            {t("results.connectToApi")}
          </p>
        )}
      </div>

      {/* TODO: Add comparison with similar properties */}
      {/* TODO: Add financing options calculator */}
      {/* TODO: Add scenario analysis (what-if calculations) */}
    </div>
  );
};

export default Results;
