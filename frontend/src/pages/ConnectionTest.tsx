//import PropertyForm from "@/components/forms/PropertyForm";
import {
  //   BarChart3,
  //   Calculator,
  CheckCircle,
  Loader,
  //  Shield,
  //   TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";

// Define types for better type safety
type ConnectionStatus = "checking" | "connected" | "disconnected";

interface TestResult {
  test: string;
  status: "success" | "error";
  message: string;
}

interface HealthResponse {
  success?: boolean;
  data?: any;
  error?: string;
}

interface AnalysisResponse {
  success: boolean;
  data: {
    calculatedMetrics: {
      capRate: number;
    };
  } | null;
  error?: string;
}

// Connection Test Component (embedded)
const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("checking");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAnalysis, setIsTestingAnalysis] = useState(false);

  const testConnection = async () => {
    setConnectionStatus("checking");
    try {
      const response = await fetch("/api/health");
      const data: HealthResponse = await response.json();

      if (response.ok) {
        setConnectionStatus("connected");
        return { success: true, data };
      } else {
        setConnectionStatus("disconnected");
        return { success: false, error: "Health check failed" };
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const testAnalysisEndpoint = async () => {
    setIsTestingAnalysis(true);

    const testProperty = {
      address: "123 Test Property Lane, Demo City",
      price: 350000,
      monthlyRent: 2800,
      monthlyExpenses: 1200,
      downPayment: 70000,
      squareFeet: 1500,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2015,
    };

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testProperty),
      });

      const data: AnalysisResponse = await response.json();

      if (
        response.ok &&
        data.success &&
        data.data &&
        data.data.calculatedMetrics
      ) {
        const capRate = data.data.calculatedMetrics.capRate;
        setTestResults((prev) => [
          ...prev,
          {
            test: "Property Analysis",
            status: "success",
            message: `Analysis completed! Cap Rate: ${capRate.toFixed(2)}%`,
          },
        ]);
      } else {
        setTestResults((prev) => [
          ...prev,
          {
            test: "Property Analysis",
            status: "error",
            message: data.error || "Analysis failed",
          },
        ]);
      }
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: "Property Analysis",
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      ]);
    } finally {
      setIsTestingAnalysis(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case "checking":
        return <Loader className="h-5 w-5 animate-spin text-blue-500" />;
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
        🔧 Connection Test (Remove this after testing)
      </h3>

      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon(connectionStatus)}
        <span className="font-medium">
          {connectionStatus === "checking" && "Checking connection..."}
          {connectionStatus === "connected" && "API Connected!"}
          {connectionStatus === "disconnected" && "API Disconnected"}
        </span>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={testConnection}
          disabled={connectionStatus === "checking"}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
        >
          Test Health
        </button>
        <button
          onClick={testAnalysisEndpoint}
          disabled={connectionStatus !== "connected" || isTestingAnalysis}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
        >
          {isTestingAnalysis ? "Testing..." : "Test Analysis"}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-2 rounded text-sm ${
                result.status === "success"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
              }`}
            >
              <strong>{result.test}:</strong> {result.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <ConnectionTest />
    </div>
  );
};

export default Home;
