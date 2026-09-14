import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_PATH);
}

export async function listEquipment() {
  const db = await readDb();
  return db.equipment;
}

export async function listWorkOrders() {
  const db = await readDb();
  return [...db.workOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function dashboardSummary() {
  const db = await readDb();
  return {
    equipmentTotal: db.equipment.length,
    online: db.equipment.filter((item) => item.status === 'ONLINE').length,
    openWorkOrders: db.workOrders.filter((item) => item.status !== 'DONE').length,
    criticalAlerts: db.equipment.filter((item) => item.alertLevel === 'CRITICAL').length
  };
}

export async function createWorkOrder(input) {
  const db = await readDb();
  const equipment = db.equipment.find((item) => item.id === input.equipmentId);
  if (!equipment) {
    const error = new Error('Equipment not found');
    error.status = 404;
    throw error;
  }

  const workOrder = {
    id: `wo-${crypto.randomUUID().slice(0, 8)}`,
    equipmentId: input.equipmentId,
    equipmentName: equipment.name,
    title: input.title.trim(),
    priority: input.priority,
    assignee: input.assignee?.trim() || 'Unassigned',
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };

  db.workOrders.push(workOrder);
  await writeDb(db);
  return workOrder;
}

export async function updateWorkOrderStatus(id, status) {
  const db = await readDb();
  const item = db.workOrders.find((workOrder) => workOrder.id === id);
  if (!item) {
    const error = new Error('Work order not found');
    error.status = 404;
    throw error;
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  await writeDb(db);
  return item;
}
