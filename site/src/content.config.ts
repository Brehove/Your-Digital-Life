import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const statusSchema = z.enum(["verified", "inferred", "estimated", "contested"]);
const calculatorDeviceProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  note: z.string().optional()
});
const calculatorDeviceModeSchema = z.enum(["not-modeled", "fixed", "selectable"]);
const calculatorSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  authors: z.array(z.string()).default([]),
  url: z.url(),
  publishedDate: z.string(),
  sourceTier: z.enum(["Tier 1", "Tier 2", "Tier 3", "Tier 4"]),
  sourceType: z.string(),
  notes: z.string().optional(),
  usedFor: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),
    navLabel: z.string().optional(),
    order: z.number(),
    lastReviewed: z.string(),
    heroTitle: z.string().optional(),
    heroSummary: z.string().optional(),
    keyTakeaways: z.array(z.string()).default([]),
    toolIntroTitle: z.string().optional(),
    toolIntroBody: z.array(z.string()).default([]),
    toolIntroListTitle: z.string().optional(),
    toolIntroPrompts: z.array(z.string()).default([])
  })
});

const facts = defineCollection({
  loader: glob({ base: "./src/content/facts", pattern: "**/*.json" }),
  schema: z.object({
    section: z.string(),
    topic: z.string(),
    claim: z.string(),
    shortLabel: z.string(),
    value: z.union([z.number(), z.string()]),
    unit: z.string().optional(),
    displayValue: z.string(),
    comparisonContext: z.string().optional(),
    status: statusSchema,
    scopeNote: z.string().optional(),
    methodNote: z.string().optional(),
    sourceTier: z.enum(["Tier 1", "Tier 2", "Tier 3", "Tier 4"]),
    sourceTitle: z.string(),
    sourceOrg: z.string(),
    sourceUrl: z.url(),
    sourceDate: z.string(),
    lastVerified: z.string(),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([])
  })
});

const calculators = defineCollection({
  loader: glob({ base: "./src/content/calculators", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    calculatorId: z.string(),
    lastReviewed: z.string(),
    sourceFiles: z
      .array(
        z.object({
          title: z.string(),
          path: z.string(),
          sections: z.array(z.string()).default([]),
          notes: z.array(z.string()).default([])
        })
      )
      .default([]),
    sourceCatalog: z.array(calculatorSourceSchema).default([]),
    deviceProfiles: z.array(calculatorDeviceProfileSchema).default([]),
    updateInstructions: z.array(z.string()).default([]),
    activities: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        category: z.enum(["AI tasks", "Media and search", "Meetings"]),
        unitLabel: z.string(),
        unitHint: z.string(),
        step: z.number(),
        serverWhPerUnit: z.number(),
        totalWhPerUnit: z.number(),
        directWaterMlPerUnit: z.number(),
        totalWaterMlPerUnit: z.number(),
        status: statusSchema,
        note: z.string(),
        deviceMode: calculatorDeviceModeSchema.default("not-modeled"),
        defaultDeviceId: z.string().optional(),
        deviceSelectableIds: z.array(z.string()).default([]),
        deviceTotalWhOverrides: z.record(z.string(), z.number()).default({}),
        deviceSelectionAffects: z.array(z.string()).default([]),
        deviceNote: z.string().optional(),
        sourceIds: z.array(z.string()).default([])
      })
    ),
    presets: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          description: z.string(),
          values: z.record(z.string(), z.number()).default({}),
          deviceSelections: z.record(z.string(), z.string()).default({})
        })
      )
      .default([]),
    methodSections: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string().optional(),
          notes: z.array(z.string()).default([]),
          sourceIds: z.array(z.string()).default([]),
          tables: z
            .array(
              z.object({
                title: z.string(),
                columns: z.array(z.string()).default([]),
                rows: z.array(z.array(z.string())).default([])
              })
            )
            .default([])
        })
      )
      .default([])
  })
});

const scenarios = defineCollection({
  loader: glob({ base: "./src/content/scenarios", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    audienceLabel: z.string(),
    summary: z.string(),
    serverEnergyWh: z.number(),
    totalEnergyWh: z.number(),
    directWaterMl: z.number(),
    totalWaterMl: z.number(),
    confidence: z.enum(["high", "medium", "estimated"]),
    lastReviewed: z.string(),
    heroStat: z.string(),
    comparisonNote: z.string(),
    activities: z.array(
      z.object({
        label: z.string(),
        durationOrVolume: z.string(),
        serverEnergyWh: z.number(),
        totalEnergyWh: z.number(),
        directWaterMl: z.number(),
        totalWaterMl: z.number(),
        sourceIds: z.array(z.string()).default([]),
        estimated: z.boolean().default(false),
        note: z.string().optional()
      })
    )
  })
});

const charts = defineCollection({
  loader: glob({ base: "./src/content/charts", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    chartType: z.string(),
    summary: z.string(),
    dataFile: z.string(),
    xField: z.string(),
    yField: z.string(),
    seriesField: z.string().optional(),
    unit: z.string().optional(),
    sourceIds: z.array(z.string()).default([]),
    note: z.string().optional(),
    lastReviewed: z.string(),
    tags: z.array(z.string()).default([])
  })
});

const resources = defineCollection({
  loader: glob({ base: "./src/content/resources", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    resourceType: z.string(),
    url: z.url(),
    audience: z.string(),
    whyItMatters: z.string(),
    cautions: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(100)
  })
});

const updates = defineCollection({
  loader: glob({ base: "./src/content/updates", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string(),
    changedItems: z.array(z.string()).default([]),
    reason: z.string(),
    impactOnPublicCopy: z.string()
  })
});

const sources = defineCollection({
  loader: glob({ base: "./src/content/sources", pattern: "**/*.json" }),
  schema: calculatorSourceSchema.omit({ id: true, usedFor: true })
});

export const collections = {
  pages,
  calculators,
  facts,
  scenarios,
  charts,
  resources,
  updates,
  sources
};
