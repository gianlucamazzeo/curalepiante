export interface PiantaImmagine {
  license: number;
  license_name: string;
  license_url: string;
  original_url: string;
  regular_url: string;
  medium_url: string;
  small_url: string;
  thumbnail: string;
}

export interface PiantaDimensions {
  min_height?: number;
  max_height?: number;
  height_unit?: string;
  min_width?: number;
  max_width?: number;
  width_unit?: string;
}

export interface PiantaHardiness {
  min?: string;
  max?: string;
}

export interface PiantaAnatomy {
  part?: string;
  color?: string[];
}

export interface PiantaWateringTemperature {
  unit?: string;
  min?: number;
  max?: number;
}

export interface PiantaWateringPhLevel {
  min?: number;
  max?: number;
}

export interface PiantaSunlightDuration {
  min?: string;
  max?: string;
  unit?: string;
}

export interface Pianta {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name: string[];
  cycle: string;
  watering: string;
  sunlight: string[];
  default_image: PiantaImmagine | null;
  indoor?: boolean;
  flowers?: boolean;
  fruits?: boolean;
  cuisine?: boolean;
  medicinal?: boolean;
  poisonous_to_pets?: boolean;
  edible?: boolean;
  pruning_count?: string;
  family?: string;
  origin?: string[];
  type?: string;
  dimensions?: PiantaDimensions;
  care_level?: string;
  growth_rate?: string;
  maintenance?: string;
  drought_tolerant?: boolean;
  salt_tolerant?: boolean;
  tropical?: boolean;
  rare?: boolean;
  invasive?: boolean;
  thorny?: boolean;
  hardiness?: PiantaHardiness;
  pruning_month?: string[];
  flowering_season?: string;
  fruiting_season?: string;
  harvest_season?: string;
  harvest_method?: string;
  attracts?: string[];
  propagation?: string[];
  plant_anatomy?: PiantaAnatomy[];
  poisonous_to_humans?: boolean;
  description?: string;
  xWateringQuality?: string[];
  xWateringAvgVolumeRequirement?: string[];
  xWateringDepthRequirement?: string[];
  xWateringBasedTemperature?: PiantaWateringTemperature;
  xWateringPhLevel?: PiantaWateringPhLevel;
  xSunlightDuration?: PiantaSunlightDuration;
}

export interface PianteListaResponse {
  data: Pianta[];
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

export interface PerenualPruningCount {
  amount: number;
  interval: string;
}

export interface PerenualDimensions {
  type: string | null;
  min_value: number;
  max_value: number;
  unit: string;
}

export interface PerenualHardiness {
  min: string;
  max: string;
}

export interface PerenualWateringTemperature {
  unit: string;
  min: number;
  max: number;
}

export interface PerenualWateringPhLevel {
  min: number;
  max: number;
}

export interface PerenualSunlightDuration {
  min: string;
  max: string;
  unit: string;
}

export interface PerenualPlantAnatomy {
  part: string;
  color: string[];
}

export interface PerenualApiResponse {
  id: number;
  common_name?: string | null;
  scientific_name?: string[];
  other_name?: string[];
  family?: string;
  origin?: string[] | null;
  type?: string;
  dimensions?: PerenualDimensions;
  cycle?: string;
  watering?: string;
  watering_general_benchmark?: {
    value: string;
    unit: string;
  };
  plant_anatomy?: PerenualPlantAnatomy[];
  sunlight?: string[];
  pruning_month?: string[];
  pruning_count?: PerenualPruningCount;
  seeds?: number;
  attracts?: string[];
  propagation?: string[];
  hardiness?: PerenualHardiness;
  hardiness_location?: {
    full_url: string;
    full_iframe: string;
  };
  flowers?: boolean;
  flowering_season?: string;
  soil?: string[];
  pest_susceptibility?: any;
  cones?: boolean;
  fruits?: boolean;
  edible_fruit?: boolean;
  fruiting_season?: string | null;
  harvest_season?: string | null;
  harvest_method?: string;
  leaf?: boolean;
  edible_leaf?: boolean;
  growth_rate?: string;
  maintenance?: string;
  medicinal?: boolean;
  poisonous_to_humans?: boolean;
  poisonous_to_pets?: boolean;
  drought_tolerant?: boolean;
  salt_tolerant?: boolean;
  thorny?: boolean;
  invasive?: boolean;
  rare?: boolean;
  tropical?: boolean;
  cuisine?: boolean;
  indoor?: boolean;
  care_level?: string;
  description?: string;
  default_image?: PiantaImmagine;
  other_images?: PiantaImmagine[];
  xWateringQuality?: string[];
  xWateringPeriod?: string[];
  xWateringAvgVolumeRequirement?: string[];
  xWateringDepthRequirement?: string[];
  xWateringBasedTemperature?: PerenualWateringTemperature;
  xWateringPhLevel?: PerenualWateringPhLevel;
  xSunlightDuration?: PerenualSunlightDuration;
}
