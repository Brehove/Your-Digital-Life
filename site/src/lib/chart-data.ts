import globalDemand from "../data/charts/global-demand.json";
import promptComparison from "../data/charts/prompt-comparison.json";
import scenarioComparison from "../data/charts/scenario-comparison.json";
import waterFootprint from "../data/charts/water-footprint.json";

type ChartScale = "linear" | "log";

export type ChartSeriesItem = {
  label: string;
  value: number;
  displayValue: string;
  detail?: string;
  highlight?: boolean;
};

export type ChartInsight = {
  label: string;
  value: string;
};

export type ResolvedChart = {
  items: ChartSeriesItem[];
  metricLabel: string;
  scale: ChartScale;
  scaleNote?: string;
  takeaway?: string;
  insights?: ChartInsight[];
};

export function resolveChartData(slug: string): ResolvedChart {
  switch (slug) {
    case "global-demand":
      const baseline = globalDemand.find((item) => item.label === "2024")?.twh ?? 415;
      const projection = globalDemand.find((item) => item.label === "2030")?.twh ?? 945;
      const increase = projection - baseline;

      return {
        metricLabel: "Electricity demand",
        scale: "linear",
        takeaway: "The current planning frame is roughly 415 TWh in 2024 rising to 945 TWh by 2030, a steep buildout rather than a marginal increase.",
        insights: [
          { label: "Increase", value: `+${increase} TWh` },
          { label: "Growth", value: `${(projection / baseline).toFixed(1)}x` },
          { label: "2024 share", value: "~1.5% of world electricity" }
        ],
        items: globalDemand.map((item) => ({
          label: item.label,
          value: item.twh,
          displayValue: `${item.twh} TWh`,
          detail:
            item.label === "2024"
              ? "Current global baseline used across the site"
              : "IEA-based 2030 planning projection",
          highlight: item.label === "2030"
        }))
      };
    case "prompt-comparison":
      const promptBaseline = promptComparison.find((item) => item.label === "Text prompt")?.wh ?? 0.3;

      return {
        metricLabel: "Server-side energy",
        scale: "log",
        scaleNote: "Log scale used so low-cost prompts and high-cost coding-agent sessions remain visible on the same chart.",
        takeaway: "The phrase 'prompt cost' hides orders-of-magnitude differences. A basic text prompt, a reasoning query, and an hour of coding-agent use are not remotely the same event.",
        insights: [
          { label: "Image vs. text", value: `${(1.7 / promptBaseline).toFixed(1)}x` },
          { label: "High reasoning vs. text", value: `${(33.8 / promptBaseline).toFixed(0)}x` },
          { label: "Coding hour vs. text", value: `${(325 / promptBaseline).toFixed(0)}x` }
        ],
        items: promptComparison.map((item) => ({
          label: item.label,
          value: item.wh,
          displayValue: `${item.wh} Wh`,
          detail:
            item.label === "Text prompt"
              ? "Baseline everyday query"
              : `${(item.wh / promptBaseline).toFixed(item.wh / promptBaseline < 10 ? 1 : 0)}x a basic text prompt`,
          highlight: item.label === "Vibe coding hour"
        }))
      };
    case "scenario-comparison":
      return {
        metricLabel: "Cloud/source-side energy estimate",
        scale: "linear",
        takeaway: "In the current model, heavy-use AI and hosted Zoom are the big outliers. Moderate AI use stays below the non-AI media day.",
        insights: [
          { label: "Highest server load", value: "Vibe coder" },
          { label: "Moderate AI result", value: "Below non-AI day" },
          { label: "Zoom effect", value: "Hosted meeting is a major outlier" }
        ],
        items: [...scenarioComparison]
          .sort((left, right) => right.serverEnergyWh - left.serverEnergyWh)
          .map((item) => ({
            label: item.scenario,
            value: item.serverEnergyWh,
            displayValue: `${item.serverEnergyWh} Wh/day`,
            highlight: item.scenario === "Gen Z Heavy AI User (Vibe Coder)"
          }))
      };
    case "water-footprint":
      const direct = waterFootprint.find((item) => item.type === "Direct cooling water")?.litersPerKwh ?? 1.15;
      const indirect = waterFootprint.find((item) => item.type === "Indirect electricity water")?.litersPerKwh ?? 4.52;

      return {
        metricLabel: "Water intensity",
        scale: "linear",
        takeaway: "Even in the simplified benchmark, indirect water from electricity generation outweighs the direct cooling-water number most people picture first.",
        insights: [
          { label: "Indirect/direct ratio", value: `${(indirect / direct).toFixed(1)}x` },
          { label: "Direct benchmark", value: `${direct} L/kWh` },
          { label: "Indirect benchmark", value: `${indirect} L/kWh` }
        ],
        items: waterFootprint.map((item) => ({
          label: item.type,
          value: item.litersPerKwh,
          displayValue: `${item.litersPerKwh} L/kWh`,
          detail:
            item.type === "Direct cooling water"
              ? "Facility-side cooling benchmark"
              : "Water embedded in electricity supply",
          highlight: item.type === "Indirect electricity water"
        }))
      };
    default:
      return {
        metricLabel: "Value",
        scale: "linear",
        items: []
      };
  }
}
