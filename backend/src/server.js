import express from 'express';
import cors from 'cors';
import {
  createWorkOrder,
  dashboardSummary,
  listEquipment,
  listWorkOrders,
  updateWorkOrderStatus
} from './store.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const VALID_STATUSES = new Set(['OPEN', 'IN_PROGRESS', 'DONE']);

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'opspulse-api', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    res.json(await dashboardSummary());
  } catch (error) {
    next(error);
  }
});

app.get('/api/equipment', async (_req, res, next) => {
  try {
    res.json(await listEquipment());
  } catch (error) {
    next(error);
  }
});

app.get('/api/work-orders', async (_req, res, next) => {
  try {
    res.json(await listWorkOrders());
  } catch (error) {
    next(error);
  }
});

app.post('/api/work-orders', async (req, res, next) => {
  try {
    const { equipmentId, title, priority, assignee } = req.body ?? {};
    if (!equipmentId || typeof equipmentId !== 'string') {
      return res.status(400).json({ message: 'equipmentId is required' });
    }
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ message: 'title must contain at least 3 characters' });
    }
    if (!VALID_PRIORITIES.has(priority)) {
      return res.status(400).json({ message: 'priority must be LOW, MEDIUM, HIGH, or CRITICAL' });
    }

    const created = await createWorkOrder({ equipmentId, title, priority, assignee });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/work-orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ message: 'status must be OPEN, IN_PROGRESS, or DONE' });
    }
    res.json(await updateWorkOrderStatus(req.params.id, status));
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`OpsPulse API listening on http://localhost:${PORT}`);
});
