import React from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PropertyChartProps {
  data?: any; // Analysis data from API
  type: "roi" | "cashflow" | "comparison" | "market-trends";
}

const PropertyChart: React.FC<PropertyChartProps> = ({ data, type }) => {
  const { t } = useTranslation();

  // Transform real analysis data into chart-friendly format
  const generateChartData = () => {
    if (!data || !data.calculatedMetrics) {
      return getMockData(); // Fallback to mock data
    }

    const metrics = data.calculatedMetrics;
    const market = data.marketComparison || {};

    switch (type) {
      case "roi":
        return generateROIData(metrics, market);
      case "cashflow":
        return generateCashFlowData(data);
      case "comparison":
        return generateComparisonData(metrics, market);
      case "market-trends":
        return generateMarketTrendsData(data);
      default:
        return [];
    }
  };

  const generateROIData = (metrics: any, market: any) => {
    const currentYear = new Date().getFullYear();

    // Project ROI over 5 years with some realistic growth/variation
    return [
      {
        year: currentYear.toString(),
        roi: metrics.roi || metrics.cashOnCash,
        marketAvg: market.averageCapRate || 6.5,
        capRate: metrics.capRate,
      },
      {
        year: (currentYear + 1).toString(),
        roi: (metrics.roi || metrics.cashOnCash) * 1.05, // 5% growth assumption
        marketAvg: (market.averageCapRate || 6.5) * 1.03,
        capRate: metrics.capRate * 1.02,
      },
      {
        year: (currentYear + 2).toString(),
        roi: (metrics.roi || metrics.cashOnCash) * 1.12,
        marketAvg: (market.averageCapRate || 6.5) * 1.08,
        capRate: metrics.capRate * 1.05,
      },
      {
        year: (currentYear + 3).toString(),
        roi: (metrics.roi || metrics.cashOnCash) * 1.18,
        marketAvg: (market.averageCapRate || 6.5) * 1.12,
        capRate: metrics.capRate * 1.08,
      },
      {
        year: (currentYear + 4).toString(),
        roi: (metrics.roi || metrics.cashOnCash) * 1.25,
        marketAvg: (market.averageCapRate || 6.5) * 1.15,
        capRate: metrics.capRate * 1.1,
      },
    ];
  };

  const generateCashFlowData = (analysisData: any) => {
    const baseIncome = analysisData.inputData.monthlyRent;
    const baseExpenses = analysisData.inputData.monthlyExpenses;
    // const baseCashFlow = analysisData.calculatedMetrics.monthlyCashFlow;

    // Generate 12 months of data with some realistic variation
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month, index) => {
      // Add some realistic variation (±5% for income, ±15% for expenses)
      const incomeVariation = 1 + Math.sin(index * 0.5) * 0.05;
      const expenseVariation = 1 + (Math.random() * 0.3 - 0.15);

      const income = Math.round(baseIncome * incomeVariation);
      const expenses = Math.round(baseExpenses * expenseVariation);

      return {
        month: t(`chart.months.${month.toLowerCase()}`),
        income,
        expenses,
        cashflow: income - expenses,
        projected: index > 5, // Mark future months as projected
      };
    });
  };

  const generateComparisonData = (metrics: any, market: any) => {
    return [
      {
        name: t("chart.metrics.capRate"),
        value: parseFloat(metrics.capRate.toFixed(1)),
        color: "#3b82f6",
        benchmark: market.averageCapRate || 6.5,
      },
      {
        name: t("chart.metrics.cashOnCash"),
        value: parseFloat(metrics.cashOnCash.toFixed(1)),
        color: "#ef4444",
        benchmark: 12.0,
      },
      {
        name: "Debt Coverage",
        value: parseFloat(metrics.debtServiceCoverage.toFixed(1)),
        color: "#22c55e",
        benchmark: 1.2,
      },
      {
        name: "Break-even %",
        value: parseFloat((metrics.breakEvenRatio * 100).toFixed(1)),
        color: "#f59e0b",
        benchmark: 70.0,
      },
    ];
  };

  const generateMarketTrendsData = (analysisData: any) => {
    const basePrice = analysisData.inputData.price;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    // Generate market trend based on market comparison
    const trendMultiplier =
      analysisData.marketComparison?.marketTrend === "rising"
        ? 1.02
        : analysisData.marketComparison?.marketTrend === "declining"
        ? 0.98
        : 1.0;

    return months.map((month, index) => {
      const trendValue = Math.pow(trendMultiplier, index);
      const price = Math.round(
        basePrice * trendValue * (1 + (Math.random() * 0.04 - 0.02))
      ); // ±2% random variation

      return {
        month: t(`chart.months.${month.toLowerCase()}`),
        price,
        trend: analysisData.marketComparison?.marketTrend || "stable",
        propertyValue: Math.round(basePrice * trendValue),
      };
    });
  };

  // Fallback mock data when no real data available
  const getMockData = () => {
    switch (type) {
      case "roi":
        return [
          { year: "2024", roi: 8.5, marketAvg: 6.2, capRate: 7.1 },
          { year: "2025", roi: 9.2, marketAvg: 6.8, capRate: 7.5 },
          { year: "2026", roi: 10.1, marketAvg: 7.1, capRate: 7.8 },
          { year: "2027", roi: 11.3, marketAvg: 7.5, capRate: 8.2 },
          { year: "2028", roi: 12.0, marketAvg: 7.8, capRate: 8.5 },
        ];

      case "cashflow":
        return [
          {
            month: t("chart.months.jan"),
            income: 2500,
            expenses: 1800,
            cashflow: 700,
          },
          {
            month: t("chart.months.feb"),
            income: 2500,
            expenses: 1750,
            cashflow: 750,
          },
          {
            month: t("chart.months.mar"),
            income: 2500,
            expenses: 1900,
            cashflow: 600,
          },
          {
            month: t("chart.months.apr"),
            income: 2600,
            expenses: 1800,
            cashflow: 800,
          },
          {
            month: t("chart.months.may"),
            income: 2600,
            expenses: 1850,
            cashflow: 750,
          },
          {
            month: t("chart.months.jun"),
            income: 2700,
            expenses: 1800,
            cashflow: 900,
          },
        ];

      case "comparison":
        return [
          {
            name: t("chart.metrics.capRate"),
            value: 8.5,
            color: "#3b82f6",
            benchmark: 6.5,
          },
          {
            name: t("chart.metrics.cashOnCash"),
            value: 12.3,
            color: "#ef4444",
            benchmark: 12.0,
          },
          {
            name: "Debt Coverage",
            value: 1.8,
            color: "#22c55e",
            benchmark: 1.2,
          },
          {
            name: "Break-even %",
            value: 65.0,
            color: "#f59e0b",
            benchmark: 70.0,
          },
        ];

      case "market-trends":
        return [
          {
            month: t("chart.months.jan"),
            price: 350000,
            trend: "up",
            propertyValue: 350000,
          },
          {
            month: t("chart.months.feb"),
            price: 355000,
            trend: "up",
            propertyValue: 352000,
          },
          {
            month: t("chart.months.mar"),
            price: 352000,
            trend: "down",
            propertyValue: 348000,
          },
          {
            month: t("chart.months.apr"),
            price: 358000,
            trend: "up",
            propertyValue: 355000,
          },
          {
            month: t("chart.months.may"),
            price: 362000,
            trend: "up",
            propertyValue: 360000,
          },
          {
            month: t("chart.months.jun"),
            price: 365000,
            trend: "up",
            propertyValue: 365000,
          },
        ];

      default:
        return [];
    }
  };

  const chartData = generateChartData();

  const renderChart = () => {
    switch (type) {
      case "roi":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${parseFloat(value as string).toFixed(1)}%`,
                  name,
                ]}
              />
              <Legend />
              <Bar
                dataKey="roi"
                fill="#3b82f6"
                name={t("chart.legend.propertyROI")}
              />
              <Bar
                dataKey="capRate"
                fill="#22c55e"
                name={t("chart.legend.capRate")}
              />
              <Bar
                dataKey="marketAvg"
                fill="#64748b"
                name={t("chart.legend.marketAverage")}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "cashflow":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${parseFloat(value as string).toLocaleString()}`,
                  name,
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                name={t("chart.legend.income")}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                name={t("chart.legend.expenses")}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cashflow"
                stroke="#3b82f6"
                name={t("chart.legend.cashFlow")}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                formatter={(value, name, props) => [
                  `${parseFloat(value as string).toFixed(1)}${
                    props.payload.name.includes("%") ? "%" : ""
                  }`,
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Property Value" />
              <Bar dataKey="benchmark" fill="#64748b" name="Market Benchmark" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "market-trends":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${parseFloat(value as string).toLocaleString()}`,
                  name,
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                name={t("chart.legend.marketValue")}
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="propertyValue"
                stroke="#22c55e"
                name={t("chart.legend.propertyValue")}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>{t("chart.errors.unsupported")}</p>
          </div>
        );
    }
  };

  const getChartTitle = () => {
    const isRealData = data && data.calculatedMetrics;
    const dataSource = isRealData ? "" : " (Sample Data)";

    switch (type) {
      case "roi":
        return t("chart.titles.roiAnalysis") + dataSource;
      case "cashflow":
        return t("chart.titles.cashFlowProjection") + dataSource;
      case "comparison":
        return t("chart.titles.investmentMetrics") + dataSource;
      case "market-trends":
        return t("chart.titles.marketTrends") + dataSource;
      default:
        return t("chart.titles.analysisChart") + dataSource;
    }
  };

  const isRealData = data && data.calculatedMetrics;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getChartTitle()}
        </h3>

        <div className="flex items-center space-x-3">
          {isRealData && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Live Data
            </span>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("chart.period.lastSixMonths")}
          </div>
        </div>
      </div>

      <div className="w-full">{renderChart()}</div>

      {/* Data quality indicator */}
      {!isRealData && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Submit a property analysis to see your actual data in these
            charts
          </p>
        </div>
      )}

      {/* Chart controls */}
      <div className="mt-4 flex justify-end space-x-2">
        <button className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
          {t("chart.actions.exportData")}
        </button>
        <button className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
          {t("chart.actions.fullScreen")}
        </button>
      </div>
    </div>
  );
};

export default PropertyChart;
