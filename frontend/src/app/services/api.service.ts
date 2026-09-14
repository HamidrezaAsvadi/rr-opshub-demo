import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateWorkOrderRequest,
  DashboardSummary,
  Equipment,
  WorkOrder,
  WorkOrderStatus
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`);
  }

  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.baseUrl}/equipment`);
  }

  getWorkOrders(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/work-orders`);
  }

  createWorkOrder(payload: CreateWorkOrderRequest): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.baseUrl}/work-orders`, payload);
  }

  updateWorkOrderStatus(id: string, status: WorkOrderStatus): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/work-orders/${id}/status`, { status });
  }
}
