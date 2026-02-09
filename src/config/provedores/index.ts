// Re-export types
export type { ProviderConfig, Panel } from "./types";

// Re-export configs individuais
export { SIGMA_CONFIG } from "./sigma";
export { KOFFICE_API_CONFIG } from "./koffice-api";
export { KOFFICE_V2_CONFIG } from "./koffice-v2";
export { PROVEDORES_NAO_INTEGRADOS } from "./outros";

// Importações para montar a lista unificada
import { SIGMA_CONFIG } from "./sigma";
import { KOFFICE_API_CONFIG } from "./koffice-api";
import { KOFFICE_V2_CONFIG } from "./koffice-v2";
import { PROVEDORES_NAO_INTEGRADOS } from "./outros";
import { ProviderConfig } from "./types";

// Lista unificada de todos os provedores
export const PROVEDORES: ProviderConfig[] = [
  KOFFICE_API_CONFIG,
  KOFFICE_V2_CONFIG,
  SIGMA_CONFIG,
  ...PROVEDORES_NAO_INTEGRADOS,
];
