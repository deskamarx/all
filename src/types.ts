// Types for the AMAYA Apps Script Intelligence Hub

export interface OrderRecord {
  id: string;
  sourceSheet: string;
  sourceType?: string;
  date: string;
  rep: string;
  email: string;
  product: string;
  brand: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  clientName: string;
  address: string;
  phone: string;
  details: string;
  paymentMethod: string;
  notes: string;
  syncTs: string;
}

export interface ProductStat {
  name: string;
  count: number;
  revenue: number;
  qty: number;
  brand: string;
}

export interface ClientStat {
  name: string;
  count: number;
  revenue: number;
  address: string;
  phone: string;
}

export interface RepStat {
  name: string;
  count: number;
  revenue: number;
}

export interface SourceHealth {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'protected' | 'error';
  recordsCount: number;
  lastSynced: string;
  message: string;
}

export interface AppMeta {
  endpoint: string;
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  topProducts: ProductStat[];
  topClients: ClientStat[];
  topReps: RepStat[];
  paymentMethods: Record<string, number>;
  brands: Record<string, number>;
  sources?: SourceHealth[];
  builtAt: string;
}

export interface SourcesConfig {
  endpoint: string;
  accessEmail: string;
  lastUpdated: string;
  mode: string;
  sourcesList?: SourceHealth[];
}

export interface AppData {
  meta: AppMeta;
  orders: OrderRecord[];
  sources: SourcesConfig;
}

export type PageId = 'overview' | 'orders' | 'products' | 'clients' | 'api';
