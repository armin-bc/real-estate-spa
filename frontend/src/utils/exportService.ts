import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";

export interface ExportData {
  propertyAddress: string;
  propertyId: string;
  analysisDate: string;
  dataSource: "api" | "fallback";
  metrics: {
    capRate: number;
    cashOnCash: number;
    monthlyCashFlow: number;
    roi: number;
    onePercentRule: boolean;
    debtServiceCoverage: number;
    grossRentMultiplier: number;
    breakEvenRatio: number;
    pricePerSquareFoot: number | null;
  };
  financial: {
    price: number;
    downPayment: number;
    monthlyRent: number;
    monthlyExpenses: number;
    annualNetIncome: number;
  };
  propertyDetails: {
    squareFeet: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    yearBuilt: number | null;
  };
  marketData: {
    averageCapRate: number;
    marketTrend: string;
    competitiveRating: string;
  } | null;
  riskAssessment: {
    level: string;
    score: number;
    factors: string[];
  } | null;
  recommendations: string[];
}

export class ExportService {
  /**
   * Export analysis to PDF with comprehensive formatting
   */
  static async exportToPDF(data: ExportData): Promise<void> {
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = doc.internal.pageSize.width - margin * 2;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Helper function to add text with automatic line wrapping
      const addText = (
        text: string,
        fontSize: number = 12,
        isBold: boolean = false
      ) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }

        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.35;

        checkPageBreak(lines.length * lineHeight + 5);

        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 5; // Add some spacing after text
      };

      // Header
      addText("REAL ESTATE INVESTMENT ANALYSIS", 20, true);
      yPosition += 5;

      // Property Information
      addText(`Property Address: ${data.propertyAddress}`, 14, true);
      addText(`Analysis Date: ${data.analysisDate}`, 12);
      addText(`Property ID: ${data.propertyId}`, 12);
      addText(
        `Analysis Type: ${
          data.dataSource === "api" ? "Enhanced API Analysis" : "Basic Analysis"
        }`,
        12
      );
      yPosition += 10;

      // Executive Summary
      addText("EXECUTIVE SUMMARY", 16, true);
      const capRateStatus =
        data.metrics.capRate >= 8
          ? "Excellent"
          : data.metrics.capRate >= 5
          ? "Good"
          : "Below Target";
      const cashFlowStatus =
        data.metrics.monthlyCashFlow >= 500
          ? "Strong"
          : data.metrics.monthlyCashFlow >= 0
          ? "Positive"
          : "Negative";

      addText(
        `• Cap Rate: ${data.metrics.capRate.toFixed(2)}% (${capRateStatus})`
      );
      addText(
        `• Monthly Cash Flow: $${data.metrics.monthlyCashFlow.toLocaleString()} (${cashFlowStatus})`
      );
      addText(`• Cash-on-Cash ROI: ${data.metrics.cashOnCash.toFixed(2)}%`);
      addText(`• 1% Rule: ${data.metrics.onePercentRule ? "PASS" : "FAIL"}`);
      yPosition += 10;

      // Financial Details
      addText("FINANCIAL OVERVIEW", 16, true);
      addText(`Purchase Price: $${data.financial.price.toLocaleString()}`);
      addText(`Down Payment: $${data.financial.downPayment.toLocaleString()}`);
      addText(`Monthly Rent: $${data.financial.monthlyRent.toLocaleString()}`);
      addText(
        `Monthly Expenses: $${data.financial.monthlyExpenses.toLocaleString()}`
      );
      addText(
        `Annual Net Income: $${data.financial.annualNetIncome.toLocaleString()}`
      );
      yPosition += 10;

      // Advanced Metrics
      addText("ADVANCED METRICS", 16, true);
      addText(
        `Debt Service Coverage: ${data.metrics.debtServiceCoverage.toFixed(2)}`
      );
      addText(
        `Gross Rent Multiplier: ${data.metrics.grossRentMultiplier.toFixed(1)}`
      );
      addText(
        `Break-even Ratio: ${(data.metrics.breakEvenRatio * 100).toFixed(1)}%`
      );
      if (data.metrics.pricePerSquareFoot !== null) {
        addText(
          `Price per Square Foot: $${data.metrics.pricePerSquareFoot.toFixed(
            0
          )}`
        );
      }
      yPosition += 10;

      // Property Details (if available)
      if (
        data.propertyDetails.squareFeet ||
        data.propertyDetails.bedrooms ||
        data.propertyDetails.bathrooms
      ) {
        addText("PROPERTY DETAILS", 16, true);
        if (data.propertyDetails.squareFeet !== null) {
          addText(
            `Square Feet: ${data.propertyDetails.squareFeet.toLocaleString()}`
          );
        }
        if (data.propertyDetails.bedrooms !== null) {
          addText(`Bedrooms: ${data.propertyDetails.bedrooms}`);
        }
        if (data.propertyDetails.bathrooms !== null) {
          addText(`Bathrooms: ${data.propertyDetails.bathrooms}`);
        }
        if (data.propertyDetails.yearBuilt !== null) {
          addText(`Year Built: ${data.propertyDetails.yearBuilt}`);
        }
        yPosition += 10;
      }

      // Market Analysis (if available)
      if (data.marketData) {
        addText("MARKET ANALYSIS", 16, true);
        addText(`Market Average Cap Rate: ${data.marketData.averageCapRate}%`);
        addText(`Market Trend: ${data.marketData.marketTrend}`);
        addText(`Competitive Rating: ${data.marketData.competitiveRating}`);
        yPosition += 10;
      }

      // Risk Assessment (if available)
      if (data.riskAssessment) {
        addText("RISK ASSESSMENT", 16, true);
        addText(`Risk Level: ${data.riskAssessment.level.toUpperCase()}`);
        addText(`Risk Score: ${data.riskAssessment.score}/100`);
        if (data.riskAssessment.factors.length > 0) {
          addText("Risk Factors:", 12, true);
          data.riskAssessment.factors.forEach((factor) => {
            addText(`• ${factor}`);
          });
        }
        yPosition += 10;
      }

      // Recommendations
      if (data.recommendations.length > 0) {
        addText("RECOMMENDATIONS", 16, true);
        data.recommendations.forEach((rec, index) => {
          addText(`${index + 1}. ${rec}`);
        });
      }

      // Footer
      checkPageBreak(30);
      yPosition = pageHeight - 30;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by RealEstate Pro Platform", margin, yPosition);
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        margin,
        yPosition + 10
      );

      // Save the PDF
      const fileName = `${data.propertyAddress
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_analysis.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      throw new Error("Failed to export PDF. Please try again.");
    }
  }

  /**
   * Export analysis to Word document with professional formatting
   */
  static async exportToWord(data: ExportData): Promise<void> {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: "REAL ESTATE INVESTMENT ANALYSIS",
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 },
              }),

              // Property Information
              new Paragraph({
                children: [
                  new TextRun({ text: "Property Address: ", bold: true }),
                  new TextRun({ text: data.propertyAddress }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Analysis Date: ", bold: true }),
                  new TextRun({ text: data.analysisDate }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Property ID: ", bold: true }),
                  new TextRun({ text: data.propertyId }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Analysis Type: ", bold: true }),
                  new TextRun({
                    text:
                      data.dataSource === "api"
                        ? "Enhanced API Analysis"
                        : "Basic Analysis",
                    color: data.dataSource === "api" ? "008000" : "0066CC",
                  }),
                ],
                spacing: { after: 400 },
              }),

              // Executive Summary
              new Paragraph({
                text: "EXECUTIVE SUMMARY",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              }),

              // Create a table for key metrics
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Metric",
                            heading: HeadingLevel.HEADING_3,
                          }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Value",
                            heading: HeadingLevel.HEADING_3,
                          }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Cap Rate")] }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `${data.metrics.capRate.toFixed(2)}%`,
                                color:
                                  data.metrics.capRate >= 8
                                    ? "008000"
                                    : data.metrics.capRate >= 5
                                    ? "FF8800"
                                    : "CC0000",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Monthly Cash Flow")],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `$${data.metrics.monthlyCashFlow.toLocaleString()}`,
                                color:
                                  data.metrics.monthlyCashFlow >= 500
                                    ? "008000"
                                    : data.metrics.monthlyCashFlow >= 0
                                    ? "FF8800"
                                    : "CC0000",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Cash-on-Cash ROI")],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            `${data.metrics.cashOnCash.toFixed(2)}%`
                          ),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("1% Rule")] }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: data.metrics.onePercentRule
                                  ? "PASS"
                                  : "FAIL",
                                color: data.metrics.onePercentRule
                                  ? "008000"
                                  : "CC0000",
                                bold: true,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Financial Overview
              new Paragraph({
                text: "FINANCIAL OVERVIEW",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 600, after: 200 },
              }),
              new Paragraph(
                `Purchase Price: $${data.financial.price.toLocaleString()}`
              ),
              new Paragraph(
                `Down Payment: $${data.financial.downPayment.toLocaleString()}`
              ),
              new Paragraph(
                `Monthly Rent: $${data.financial.monthlyRent.toLocaleString()}`
              ),
              new Paragraph(
                `Monthly Expenses: $${data.financial.monthlyExpenses.toLocaleString()}`
              ),
              new Paragraph(
                `Annual Net Income: $${data.financial.annualNetIncome.toLocaleString()}`
              ),

              // Advanced Metrics
              new Paragraph({
                text: "ADVANCED METRICS",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 600, after: 200 },
              }),
              new Paragraph(
                `Debt Service Coverage Ratio: ${data.metrics.debtServiceCoverage.toFixed(
                  2
                )}`
              ),
              new Paragraph(
                `Gross Rent Multiplier: ${data.metrics.grossRentMultiplier.toFixed(
                  1
                )}`
              ),
              new Paragraph(
                `Break-even Ratio: ${(
                  data.metrics.breakEvenRatio * 100
                ).toFixed(1)}%`
              ),
              ...(data.metrics.pricePerSquareFoot !== null
                ? [
                    new Paragraph(
                      `Price per Square Foot: $${data.metrics.pricePerSquareFoot.toFixed(
                        0
                      )}`
                    ),
                  ]
                : []),

              // Property Details
              ...(data.propertyDetails.squareFeet ||
              data.propertyDetails.bedrooms ||
              data.propertyDetails.bathrooms
                ? [
                    new Paragraph({
                      text: "PROPERTY DETAILS",
                      heading: HeadingLevel.HEADING_1,
                      spacing: { before: 600, after: 200 },
                    }),
                    ...(data.propertyDetails.squareFeet !== null
                      ? [
                          new Paragraph(
                            `Square Feet: ${data.propertyDetails.squareFeet.toLocaleString()}`
                          ),
                        ]
                      : []),
                    ...(data.propertyDetails.bedrooms !== null
                      ? [
                          new Paragraph(
                            `Bedrooms: ${data.propertyDetails.bedrooms}`
                          ),
                        ]
                      : []),
                    ...(data.propertyDetails.bathrooms !== null
                      ? [
                          new Paragraph(
                            `Bathrooms: ${data.propertyDetails.bathrooms}`
                          ),
                        ]
                      : []),
                    ...(data.propertyDetails.yearBuilt !== null
                      ? [
                          new Paragraph(
                            `Year Built: ${data.propertyDetails.yearBuilt}`
                          ),
                        ]
                      : []),
                  ]
                : []),

              // Market Analysis
              ...(data.marketData
                ? [
                    new Paragraph({
                      text: "MARKET ANALYSIS",
                      heading: HeadingLevel.HEADING_1,
                      spacing: { before: 600, after: 200 },
                    }),
                    new Paragraph(
                      `Market Average Cap Rate: ${data.marketData.averageCapRate}%`
                    ),
                    new Paragraph(
                      `Market Trend: ${data.marketData.marketTrend}`
                    ),
                    new Paragraph(
                      `Competitive Rating: ${data.marketData.competitiveRating}`
                    ),
                  ]
                : []),

              // Risk Assessment
              ...(data.riskAssessment
                ? [
                    new Paragraph({
                      text: "RISK ASSESSMENT",
                      heading: HeadingLevel.HEADING_1,
                      spacing: { before: 600, after: 200 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Risk Level: ", bold: true }),
                        new TextRun({
                          text: data.riskAssessment.level.toUpperCase(),
                          color:
                            data.riskAssessment.level === "low"
                              ? "008000"
                              : data.riskAssessment.level === "medium"
                              ? "FF8800"
                              : "CC0000",
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph(
                      `Risk Score: ${data.riskAssessment.score}/100`
                    ),
                    ...(data.riskAssessment.factors.length > 0
                      ? [
                          new Paragraph({
                            text: "Risk Factors:",
                            spacing: { before: 200, after: 100 },
                          }),
                          ...data.riskAssessment.factors.map(
                            (factor) => new Paragraph(`• ${factor}`)
                          ),
                        ]
                      : []),
                  ]
                : []),

              // Recommendations
              ...(data.recommendations.length > 0
                ? [
                    new Paragraph({
                      text: "RECOMMENDATIONS",
                      heading: HeadingLevel.HEADING_1,
                      spacing: { before: 600, after: 200 },
                    }),
                    ...data.recommendations.map(
                      (rec, index) => new Paragraph(`${index + 1}. ${rec}`)
                    ),
                  ]
                : []),

              // Footer
              new Paragraph({
                text: "Generated by RealEstate Pro Platform",
                spacing: { before: 800 },
              }),
              new Paragraph({
                text: `Generated on ${new Date().toLocaleString()}`,
                spacing: { after: 200 },
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.propertyAddress
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_analysis.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Word:", error);
      // Fallback to text export
      this.exportToText(data);
    }
  }

  /**
   * Fallback export to text file
   */
  private static exportToText(data: ExportData): void {
    const content = `
REAL ESTATE INVESTMENT ANALYSIS
===============================

Property Address: ${data.propertyAddress}
Analysis Date: ${data.analysisDate}
Property ID: ${data.propertyId}
Analysis Type: ${
      data.dataSource === "api" ? "Enhanced API Analysis" : "Basic Analysis"
    }

EXECUTIVE SUMMARY
-----------------
Cap Rate: ${data.metrics.capRate.toFixed(2)}%
Monthly Cash Flow: $${data.metrics.monthlyCashFlow.toLocaleString()}
Cash-on-Cash ROI: ${data.metrics.cashOnCash.toFixed(2)}%
1% Rule: ${data.metrics.onePercentRule ? "PASS" : "FAIL"}

FINANCIAL OVERVIEW
------------------
Purchase Price: $${data.financial.price.toLocaleString()}
Down Payment: $${data.financial.downPayment.toLocaleString()}
Monthly Rent: $${data.financial.monthlyRent.toLocaleString()}
Monthly Expenses: $${data.financial.monthlyExpenses.toLocaleString()}
Annual Net Income: $${data.financial.annualNetIncome.toLocaleString()}

ADVANCED METRICS
----------------
Debt Service Coverage: ${data.metrics.debtServiceCoverage.toFixed(2)}
Gross Rent Multiplier: ${data.metrics.grossRentMultiplier.toFixed(1)}
Break-even Ratio: ${(data.metrics.breakEvenRatio * 100).toFixed(1)}%
${
  data.metrics.pricePerSquareFoot !== null
    ? `Price per Square Foot: $${data.metrics.pricePerSquareFoot.toFixed(0)}`
    : ""
}

${
  data.propertyDetails.squareFeet ||
  data.propertyDetails.bedrooms ||
  data.propertyDetails.bathrooms
    ? `
PROPERTY DETAILS
----------------
${
  data.propertyDetails.squareFeet !== null
    ? `Square Feet: ${data.propertyDetails.squareFeet.toLocaleString()}`
    : ""
}
${
  data.propertyDetails.bedrooms !== null
    ? `Bedrooms: ${data.propertyDetails.bedrooms}`
    : ""
}
${
  data.propertyDetails.bathrooms !== null
    ? `Bathrooms: ${data.propertyDetails.bathrooms}`
    : ""
}
${
  data.propertyDetails.yearBuilt !== null
    ? `Year Built: ${data.propertyDetails.yearBuilt}`
    : ""
}
`
    : ""
}

${
  data.marketData
    ? `
MARKET ANALYSIS
---------------
Market Average Cap Rate: ${data.marketData.averageCapRate}%
Market Trend: ${data.marketData.marketTrend}
Competitive Rating: ${data.marketData.competitiveRating}
`
    : ""
}

${
  data.riskAssessment
    ? `
RISK ASSESSMENT
---------------
Risk Level: ${data.riskAssessment.level.toUpperCase()}
Risk Score: ${data.riskAssessment.score}/100
${
  data.riskAssessment.factors.length > 0
    ? `
Risk Factors:
${data.riskAssessment.factors.map((factor) => `• ${factor}`).join("\n")}
`
    : ""
}
`
    : ""
}

${
  data.recommendations.length > 0
    ? `
RECOMMENDATIONS
---------------
${data.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}
`
    : ""
}

---
Generated by RealEstate Pro Platform
Generated on ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.propertyAddress
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Prepare data for export from analysis result
   */
  static prepareExportData(
    analysisData: any,
    dataSource: "api" | "fallback" = "fallback"
  ): ExportData {
    // Safely extract values with fallbacks
    const inputData = analysisData.inputData || {};
    const calculatedMetrics = analysisData.calculatedMetrics || {};
    const marketComparison = analysisData.marketComparison || null;
    const riskAssessment = analysisData.riskAssessment || null;

    return {
      propertyAddress:
        analysisData.address || inputData.address || "Unknown Property",
      propertyId: analysisData.propertyId || `property_${Date.now()}`,
      analysisDate: new Date().toLocaleDateString(),
      dataSource,
      metrics: {
        capRate: Number(calculatedMetrics.capRate) || 0,
        cashOnCash: Number(calculatedMetrics.cashOnCash) || 0,
        monthlyCashFlow: Number(calculatedMetrics.monthlyCashFlow) || 0,
        roi:
          Number(calculatedMetrics.roi) ||
          Number(calculatedMetrics.cashOnCash) ||
          0,
        onePercentRule: Boolean(calculatedMetrics.onePercentRule),
        debtServiceCoverage:
          Number(calculatedMetrics.debtServiceCoverage) || 1.0,
        grossRentMultiplier: Number(calculatedMetrics.grossRentMultiplier) || 0,
        breakEvenRatio: Number(calculatedMetrics.breakEvenRatio) || 0,
        pricePerSquareFoot: calculatedMetrics.pricePerSquareFoot
          ? Number(calculatedMetrics.pricePerSquareFoot)
          : null,
      },
      financial: {
        price: Number(inputData.price) || 0,
        downPayment: Number(inputData.downPayment) || 0,
        monthlyRent: Number(inputData.monthlyRent) || 0,
        monthlyExpenses: Number(inputData.monthlyExpenses) || 0,
        annualNetIncome: Number(calculatedMetrics.annualIncome) || 0,
      },
      propertyDetails: {
        squareFeet: inputData.squareFeet ? Number(inputData.squareFeet) : null,
        bedrooms: inputData.bedrooms ? Number(inputData.bedrooms) : null,
        bathrooms: inputData.bathrooms ? Number(inputData.bathrooms) : null,
        yearBuilt: inputData.yearBuilt ? Number(inputData.yearBuilt) : null,
      },
      marketData: marketComparison
        ? {
            averageCapRate: Number(marketComparison.averageCapRate) || 0,
            marketTrend: String(marketComparison.marketTrend) || "Unknown",
            competitiveRating:
              String(marketComparison.competitiveRating) || "Unknown",
          }
        : null,
      riskAssessment: riskAssessment
        ? {
            level: String(riskAssessment.level) || "Unknown",
            score: Number(riskAssessment.score) || 0,
            factors: Array.isArray(riskAssessment.factors)
              ? riskAssessment.factors
              : [],
          }
        : null,
      recommendations: Array.isArray(analysisData.recommendations)
        ? analysisData.recommendations
        : [],
    };
  }
}
