export type IngredientRole = 'active' | 'filler' | 'lubricant' | 'glidant' | 'dry-binder';

import type { Paddle } from "@paddle/paddle-js";

declare global {
  interface Window {
    Paddle?: Paddle;
    PaddleBillingV1?: Paddle;
  }
}

export type SeverityType = 'low' | 'medium' | 'high';

export interface SideEffect {
  name: string;
  frequency: string; // e.g. "common", "rare"
  severity: SeverityType;
}

export interface ActiveMolecule {
  id: string;
  name: string;
  casNumber?: string;
  chemicalClassId: number;
}

export interface Ingredient {
  id: number | string;
  name: string;
  casNumber?: string;
  activeMolecules?: ActiveMolecule[];
  role: IngredientRole;
  chemicalClassId: number;
  looseBulkDensity: number;
  tappedBulkDensity: number;
  trueDensity?: number;
  averageParticleSizeUm?: number;
  isAllergen?: boolean;
  costPerKgUsd: number;
  maxSafePercentage: number;

  // Knowledge Base fields
  benefit?: number;
  risk?: number;
  cost?: number;
  stability?: number;
  manufacturability?: number;

  // Level 1 Homeopathic / Complex Formulation fields
  source?: string;
  dilutionScale?: string;
  dosageForm?: string;
  applicationArea?: string;
  processingTech?: string;

  // Level 2 Supplements and OTC fields
  effects?: string[];
  contraindications?: string[];
  sideEffects?: SideEffect[];
}



export interface SegregationRiskResult {
  maxBulkDensityDifference: number;
  bulkDensityRatio: number;
  maxParticleSizeDifference: number;
  particleSizeRatio: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  warnings: string[];
}

export interface SpreadingCoefficientResult {
  spreadingCoefficient: number;
  rating: 'Spontaneous' | 'Non-Spontaneous';
}

export interface PKDoseResult {
  dSR: number;
  releaseRate: number;
  loadingDose: number;
  maintenanceDose: number;
}

export interface WetGranulationInputs {
  targetTabletWeightMg: number;
  apiPercentage: number;
  intragranularPercentage: number;
  moistureContentLod: number;
  binderSolutionAddedPercentage: number;
  expectedLossPercentage: number;
  batchSizeTablets: number;
}

export interface WetGranulationResult {
  totalDryBatchWeightKg: number;
  pureApiWeightKg: number;
  intragranularDryWeightKg: number;
  extragranularDryWeightKg: number;
  wetGranulesWeightBeforeDryingKg: number;
  granuleFillWeightPerTabletMg: number;
  finalFillWeightPerTabletMg: number;
  expectedLossWeightKg: number;
}

export interface PunchDimensions {
  shape: 'round' | 'shaped';
  diameterMm?: number;
  lengthMm?: number;
  widthMm?: number;
}

export interface FillCamResult {
  punchAreaMm2: number;
  theoreticalFillDepthMm: number;
  recommendedFillDepthMm: number;
  closestStandardCamMm: number;
}

export interface PressPresetsResult {
  fetteFillDepthMm: number;
  geaCourtoyFillDepthMm: number;
}

export type TariffType = 'hobby' | 'professional';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  tariff: TariffType;
  provider: string;
  renewsAt?: string | null;
}

export interface EditorNode {
  id: string;
  type: 'ingredient' | 'blending' | 'press' | 'cost-optimizer' | 'output';
  position: { x: number; y: number };
  data: {
    ingredientId?: number | string;
    percentage?: number;
    diameterCm?: number;
    depthCm?: number;
    activeRawWeightG?: number;
    [key: string]: number | string | boolean | null | undefined;
  };
}

export interface EditorConnection {
  id: string;
  source: string;
  target: string;
}

export interface HistoryState {
  nodes: EditorNode[];
  connections: EditorConnection[];
}





export interface CompatibilityWarning {
  type: 'compatibility' | 'limit';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  ingredientId?: number | string;
  relatedIngredientId?: number | string;
}
