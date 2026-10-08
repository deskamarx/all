// Types for the AMAYA Intelligence Hub

export interface MetaSource {
  name: string;
  url: string;
}

export interface MetaDerived {
  undatedEvents: number;
  eventsWithoutProduct: number;
  invalidImeiAssets: number;
  assetsWithoutCitation: number;
  assetsWithoutDate: number;
  assetsWithoutTerminalState: number;
  resolvedUnknown: number;
  unresolvedBecauseNeverClassified: number;
  unresolvedDespiteTerminalState: number;
  unmappedStateTokens: string[];
  tabsWithEvents: number;
  maxTabs: number;
  maxOccurrences: number;
}

export interface AppMeta {
  generatedFrom: string;
  assets: number;
  events: number;
  sources: Record<string, MetaSource>;
  stateCounts: Record<string, number>;
  topTabs: [string, number][];
  repeatIds: number;
  conflicts: number;
  reviewQueue: number;
  errorTokens: number;
  emptyTabs: number;
  states: string[];
  dataVersion: string;
  dataSeq: number;
  builtAt: string;
  derived: MetaDerived;
}

export interface AssetsData {
  count: number;
  imeis: string[];
}

export interface EventsData {
  count: number;
  tabDict: string[];
  row: number[];
  col?: number[];
  imei?: string[];
  state?: string[];
  tab?: number[];
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  docId: string;
  gid: string;
  category: 'Finance' | 'Logistics' | 'Operations';
  responsible: string;
  color: string;
  enabled: boolean;
}

export interface SourcesConfig {
  sources: DataSource[];
  accessEmail: string;
  lastUpdated: string;
}

export interface AppData {
  meta: AppMeta;
  assets: AssetsData;
  events: EventsData;
  sources: SourcesConfig;
}

export type PageId = 'overview' | 'imei' | 'stock' | 'sources' | 'conflicts';
