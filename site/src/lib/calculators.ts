import { getCollection, type CollectionEntry } from "astro:content";

export type CalculatorEntry = CollectionEntry<"calculators">;
export type CalculatorActivity = CalculatorEntry["data"]["activities"][number];
export type CalculatorPreset = CalculatorEntry["data"]["presets"][number];
export type CalculatorMethodSection = CalculatorEntry["data"]["methodSections"][number];
export type CalculatorSource = CalculatorEntry["data"]["sourceCatalog"][number];

export async function getCalculatorById(id: string) {
  const calculators = await getCollection("calculators");
  return calculators.find((calculator) => calculator.id === id || calculator.data.calculatorId === id);
}

export function createCalculatorSourceMap(calculator: CalculatorEntry) {
  return new Map(calculator.data.sourceCatalog.map((source) => [source.id, source]));
}

export function resolveCalculatorSources(
  sourceIds: string[],
  sourceMap: Map<string, CalculatorSource>,
  context: string
) {
  const missing: string[] = [];
  const sources: CalculatorSource[] = [];

  for (const sourceId of sourceIds) {
    const source = sourceMap.get(sourceId);

    if (!source) {
      missing.push(sourceId);
      continue;
    }

    sources.push(source);
  }

  if (missing.length > 0) {
    throw new Error(`Missing calculator source record(s) for ${context}: ${missing.join(", ")}`);
  }

  return sources;
}
