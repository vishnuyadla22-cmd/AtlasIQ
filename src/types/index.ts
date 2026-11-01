export type ModuleId =
  | 'climate'
  | 'agriculture'
  | 'water'
  | 'energy'
  | 'environment'
  | 'natural-resources'
  | 'economy'
  | 'healthcare-education'
  | 'infrastructure';

export type DataStatus = 'measured' | 'estimated' | 'simulation' | 'unavailable';

export interface LocationItem {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
}

export interface IntelligenceModuleMeta {
  id: ModuleId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  path: string;
  iconName: string;
  indicatorCount: number;
  plannedDataSources: string[];
  reportingPeriod: string;
  sampleIndicators: {
    name: string;
    description: string;
    unit: string;
    status: DataStatus;
  }[];
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: DataStatus;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  isNotice?: boolean;
}

export interface ScenarioParameter {
  id: string;
  name: string;
  description: string;
  defaultValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export interface ResourceGapCategory {
  id: string;
  name: string;
  unit: string;
  description: string;
}
