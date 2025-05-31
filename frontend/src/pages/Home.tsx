import PropertyForm from "@/components/forms/PropertyForm";
import { BarChart3, Calculator, Shield, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calculator,
      title: t("home.features.smartAnalysis.title"),
      description: t("home.features.smartAnalysis.description"),
    },
    {
      icon: BarChart3,
      title: t("home.features.visualInsights.title"),
      description: t("home.features.visualInsights.description"),
    },
    {
      icon: TrendingUp,
      title: t("home.features.roiOptimization.title"),
      description: t("home.features.roiOptimization.description"),
    },
    {
      icon: Shield,
      title: t("home.features.riskAssessment.title"),
      description: t("home.features.riskAssessment.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("home.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t("home.subtitle")}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <feature.icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Property Analysis Form */}
        <div className="mb-12">
          <PropertyForm />
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t("home.sections.trustedBy")}
          </p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {/* TODO: Add actual company logos */}
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t("home.sections.makeInformedDecisions")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t("home.sections.platformDescription")}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("home.benefits.realTimeAnalysis")}
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("home.benefits.financialModeling")}
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("home.benefits.riskTools")}
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("home.benefits.professionalReports")}
                  </span>
                </li>
              </ul>
            </div>
            <div className="lg:text-center">
              {/* TODO: Add actual screenshot or demo */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-8 text-white">
                <h3 className="text-xl font-semibold mb-4">
                  {t("home.sections.comingSoon")}
                </h3>
                <p className="mb-4">{t("home.sections.mlPredictions")}</p>
                <div className="bg-white/20 rounded p-4">
                  <div className="h-4 bg-white/40 rounded mb-2"></div>
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
