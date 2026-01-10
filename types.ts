
export enum OSStatus {
  ORCAMENTO = 'Orçamento',
  EM_ANDAMENTO = 'Em Execução',
  FINALIZADO = 'Finalizado',
  CANCELADO = 'Cancelado'
}

export enum PaymentStatus {
  PAGO = 'Pago',
  PENDENTE = 'Pendente',
  ATRASADO = 'Atrasado'
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  document: string;
  observations: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  model: string;
  brand: string;
  year: string;
  plate: string;
  km: number;
  observations?: string;
}

export interface OSItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'PART' | 'SERVICE';
}

export interface BillingContact {
  date: string;
  user: string;
  level: string;
}

export interface VehicleChecklist {
  id: string;
  vehicleId: string;
  plate: string;
  clientName: string;
  clientPhone: string;
  km: string;
  fuelLevel: string;
  damages: string[]; // List of areas with damage (e.g. 'front-left', 'rear-bumper')
  items: Record<string, boolean>; // Record of checked items
  observations: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  clientId: string;
  clientName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleKm?: string;
  problem: string;
  items: OSItem[];
  laborValue: number;
  discount: number;
  totalValue: number;
  status: OSStatus;
  paymentStatus: PaymentStatus;
  dueDate?: string;
  billingHistory?: BillingContact[];
  createdAt: string;
  updatedAt: string;
}
