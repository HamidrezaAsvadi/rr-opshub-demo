import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from './services/api.service';
import {
  CreateWorkOrderRequest,
  DashboardSummary,
  Equipment,
  Priority,
  WorkOrder,
  WorkOrderStatus
} from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly summary = signal<DashboardSummary | null>(null);
  readonly equipment = signal<Equipment[]>([]);
  readonly workOrders = signal<WorkOrder[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  readonly formVisible = signal(false);

  newOrder: CreateWorkOrderRequest = {
    equipmentId: '',
    title: '',
    priority: 'MEDIUM',
    assignee: 'Hamid'
  };

  readonly filteredEquipment = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.equipment().filter((item) => {
      const statusMatches = status === 'ALL' || item.status === status;
      const queryMatches = !q || `${item.name} ${item.site}`.toLowerCase().includes(q);
      return statusMatches && queryMatches;
    });
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      summary: this.api.getDashboard(),
      equipment: this.api.getEquipment(),
      workOrders: this.api.getWorkOrders()
    }).subscribe({
      next: ({ summary, equipment, workOrders }) => {
        this.summary.set(summary);
        this.equipment.set(equipment);
        this.workOrders.set(workOrders);
        if (!this.newOrder.equipmentId && equipment.length > 0) {
          this.newOrder.equipmentId = equipment[0].id;
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load data. Is the Node.js API running on port 3000?');
        this.loading.set(false);
      }
    });
  }

  openWorkOrderFor(item: Equipment): void {
    this.newOrder = {
      equipmentId: item.id,
      title: item.alertLevel === 'CRITICAL' ? `Investigate ${item.name}` : `Inspect ${item.name}`,
      priority: item.alertLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
      assignee: 'Hamid'
    };
    this.formVisible.set(true);
  }

  createWorkOrder(): void {
    if (!this.newOrder.title.trim()) return;
    this.saving.set(true);
    this.error.set('');
    this.api.createWorkOrder(this.newOrder).subscribe({
      next: () => {
        this.formVisible.set(false);
        this.newOrder = {
          equipmentId: this.equipment()[0]?.id ?? '',
          title: '',
          priority: 'MEDIUM',
          assignee: 'Hamid'
        };
        this.saving.set(false);
        this.loadAll();
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'Could not create work order.');
        this.saving.set(false);
      }
    });
  }

  moveStatus(item: WorkOrder): void {
    const next: WorkOrderStatus = item.status === 'OPEN' ? 'IN_PROGRESS' : 'DONE';
    this.api.updateWorkOrderStatus(item.id, next).subscribe({
      next: () => this.loadAll(),
      error: () => this.error.set('Could not update work-order status.')
    });
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setStatus(value: string): void {
    if (value === 'ALL' || value === 'ONLINE' || value === 'OFFLINE') {
      this.statusFilter.set(value);
    }
  }

  priorityClass(priority: Priority): string {
    return `priority priority--${priority.toLowerCase()}`;
  }
}
