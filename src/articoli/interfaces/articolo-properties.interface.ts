export interface PhTerreno {
  min?: number;
  max?: number;
  ottimale?: number;
}

export interface InfoCura {
  frequenzaInnaffiatura?: string;
  esposizioneSole?: string;
  tipoTerreno?: string;
  phTerreno?: PhTerreno;
  concimazione?: string;
  potatura?: string;
  cureAggiuntive?: string;
}

export interface CondizioniCrescita {
  rusticita?: string;
  temperaturaIdeale?: string;
  umidita?: string;
  velocitaCrescita?: string;
  livelloDifficolta?: string;
  internoEsterno?: string;
}

export interface InfoParassitiMalattie {
  parassitiComuni?: string[];
  malattieComuni?: string[];
  metodiPrevenzione?: string[];
  trattamenti?: string[];
}

export interface CaratteristichePianta {
  commestibile?: boolean;
  partiCommestibili?: string[];
  tossicaUmani?: boolean;
  tossicaAnimali?: boolean;
  infestante?: boolean;
  potenzialeInvasivo?: string;
  stagioneFioritura?: string;
  coloriFiori?: string[];
}
