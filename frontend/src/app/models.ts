export type EquipmentStatus = 'ONLINE' | 'OFFLINE';
export type AlertLevel = 'NONE' | 'WARNING' | 'CRITICAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export interface Equipment {
  id: string;
  name: string;
  site: string;
  status: EquipmentStatus;
  temperature: number;
  unit: string;
  alertLevel: AlertLevel;
  lastSeen: string;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  title: string;
  priority: Priority;
  assignee: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  equipmentTotal: number;
  online: number;
  openWorkOrders: number;
  criticalAlerts: number;
}

export interface CreateWorkOrderRequest {
  equipmentId: string;
  title: string;
  priority: Priority;
  assignee: string;
}
