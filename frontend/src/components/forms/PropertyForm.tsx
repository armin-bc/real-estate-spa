import type { PropertyFormData } from "@/utils/api";
import ApiService from "@/utils/api";
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  DollarSign,
  MapPin,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface PropertyFormProps {
  onSubmit?: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  onSubmit,
  isLoading: externalLoading = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PropertyFormData>({
    address: "",
    price: 0,
    monthlyRent: 0,
    monthlyExpenses: 0,
    downPayment: 0,
    squareFeet: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Check API connection on component mount
  React.useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await ApiService.healthCheck();
      setConnectionStatus("connected");
    } catch (error) {
      setConnectionStatus("disconnected");
      console.warn("API connection failed:", error);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    const numericValue =
      field === "address" ? value : value === "" ? 0 : Number(value);

    setFormData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear API error when user makes changes
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = ApiService.validatePropertyData(formData);

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};

      // Map errors to their designated fields with translations
      validationErrors.forEach((error) => {
        if (error.field === "general") {
          errorMap.general = error.message;
        } else {
          // Use translation keys for form errors
          const errorKey = `form.errors.${error.field}`;
          errorMap[error.field] = t(errorKey, { defaultValue: error.message });
        }
      });

      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      if (onSubmit) {
        // Custom submit handler
        await onSubmit(formData);
      } else {
        // Default API submission
        const response = await ApiService.analyzeProperty(formData);

        if (response.success && response.data) {
          // Store analysis result for results page
          localStorage.setItem("analysisResult", JSON.stringify(response.data));
          localStorage.setItem(
            "propertyAnalysisData",
            JSON.stringify(formData)
          );

          // Navigate to results
          navigate("/results");
        } else {
          throw new Error(response.error || "Analysis failed");
        }
      }
    } catch (error) {
      const errorMessage = ApiService.handleApiError(error);
      setApiError(errorMessage);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePreviewMetrics = () => {
    if (!formData.price || !formData.monthlyRent || !formData.monthlyExpenses) {
      return null;
    }

    const annualRent = formData.monthlyRent * 12;
    const annualExpenses = formData.monthlyExpenses * 12;
    const netIncome = annualRent - annualExpenses;
    const capRate = (netIncome / formData.price) * 100;
    const monthlyCashFlow = formData.monthlyRent - formData.monthlyExpenses;

    return { capRate, monthlyCashFlow, netIncome };
  };

  const previewMetrics = calculatePreviewMetrics();
  const isLoading = isSubmitting || externalLoading;

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("form.title")}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {connectionStatus === "connected" && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{t("home.apiConnected")}</span>
            </div>
          )}
          {connectionStatus === "disconnected" && (
            <div className="flex items-center text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{t("home.offlineMode")}</span>
            </div>
          )}
        </div>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-medium">
                {t("home.analysisError")}
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {apiError}
              </p>
              {connectionStatus === "disconnected" && (
                <button
                  onClick={checkApiConnection}
                  className="text-red-800 dark:text-red-200 underline text-sm mt-2"
                >
                  {t("home.retryConnection")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Details Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {t("form.propertyDetails")}
          </h4>

          <div>
            <input
              type="text"
              placeholder={t("form.addressPlaceholder")}
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`input-field ${
                errors.address ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                placeholder={t("form.squareFeetPlaceholder")}
                value={formData.squareFeet || ""}
                onChange={(e) =>
                  handleInputChange("squareFeet", e.target.value)
                }
                className={`input-field ${
                  errors.squareFeet ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.squareFeet && (
                <p className="text-red-500 text-sm mt-1">{errors.squareFeet}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder={t("form.bedroomsPlaceholder")}
                value={formData.bedrooms || ""}
                onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                className={`input-field ${
                  errors.bedrooms ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.bedrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder={t("form.bathroomsPlaceholder")}
                step="0.5"
                value={formData.bathrooms || ""}
                onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                className={`input-field ${
                  errors.bathrooms ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.bathrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="number"
              placeholder={t("form.yearBuiltPlaceholder")}
              value={formData.yearBuilt || ""}
              onChange={(e) => handleInputChange("yearBuilt", e.target.value)}
              className={`input-field ${
                errors.yearBuilt ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.yearBuilt && (
              <p className="text-red-500 text-sm mt-1">{errors.yearBuilt}</p>
            )}
          </div>
        </div>

        {/* Financial Details Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            {t("form.financialInformation")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder={t("form.pricePlaceholder")}
                value={formData.price || ""}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={`input-field ${
                  errors.price ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder={t("form.downPaymentPlaceholder")}
                value={formData.downPayment || ""}
                onChange={(e) =>
                  handleInputChange("downPayment", e.target.value)
                }
                className={`input-field ${
                  errors.downPayment ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.downPayment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.downPayment}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder={t("form.rentPlaceholder")}
                value={formData.monthlyRent || ""}
                onChange={(e) =>
                  handleInputChange("monthlyRent", e.target.value)
                }
                className={`input-field ${
                  errors.monthlyRent ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.monthlyRent && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.monthlyRent}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder={t("form.expensesPlaceholder")}
                value={formData.monthlyExpenses || ""}
                onChange={(e) =>
                  handleInputChange("monthlyExpenses", e.target.value)
                }
                className={`input-field ${
                  errors.monthlyExpenses ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.monthlyExpenses && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.monthlyExpenses}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Metrics */}
        {previewMetrics && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("form.quickPreview")}
            </h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t("home.capRate")}
                </p>
                <p
                  className={`font-semibold text-lg ${
                    previewMetrics.capRate >= 8
                      ? "text-green-600"
                      : previewMetrics.capRate >= 5
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {previewMetrics.capRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t("home.monthlyCashFlow")}
                </p>
                <p
                  className={`font-semibold text-lg ${
                    previewMetrics.monthlyCashFlow >= 500
                      ? "text-green-600"
                      : previewMetrics.monthlyCashFlow >= 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  ${previewMetrics.monthlyCashFlow.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t("home.annualNetIncome")}
                </p>
                <p className="font-semibold text-lg text-primary-600">
                  ${previewMetrics.netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General errors */}
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {errors.general}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>
                {connectionStatus === "connected"
                  ? t("results.loading")
                  : t("common.loading")}
              </span>
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              <span>{t("home.analyze")}</span>
            </>
          )}
        </button>

        {/* Connection status note */}
        {connectionStatus === "disconnected" && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("home.runningOfflineMode")}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertyForm;
