import type {
  Event,
  EventDetail,
  DashboardSummary,
  Task,
  Expense,
  BudgetItem,
  BudgetSummary,
  Vendor,
  Idea,
  AIGeneratedPlan,
  IdType
} from '../types';
import { demoStore } from './demoStore';

const API_BASE = '/api';

async function safeFetch<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallback) return fallback();
      throw new Error(`Request failed with status ${res.status}`);
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Returned HTML (e.g. 404 page from static host)
      if (fallback) return fallback();
      throw new Error('Invalid JSON response from server');
    }
    return await res.json();
  } catch (err) {
    if (fallback) {
      console.warn(`[Gatherly API] Live backend unreachable at ${url}. Seamlessly using local demo store.`);
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // Events
  async getEvents(): Promise<Event[]> {
    return safeFetch(`${API_BASE}/events`, undefined, () => demoStore.getEvents());
  },

  async getEvent(id: IdType): Promise<EventDetail> {
    return safeFetch(`${API_BASE}/events/${id}`, undefined, () => demoStore.getEvent(id));
  },

  async createEvent(data: Partial<Event>, autoGeneratePlan = true): Promise<EventDetail> {
    return safeFetch(
      `${API_BASE}/events?auto_generate_plan=${autoGeneratePlan}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => demoStore.createEvent(data)
    );
  },

  async updateEvent(id: IdType, data: Partial<Event>): Promise<EventDetail> {
    return safeFetch(
      `${API_BASE}/events/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => demoStore.updateEvent(id, data)
    );
  },

  async deleteEvent(id: IdType): Promise<void> {
    return safeFetch(
      `${API_BASE}/events/${id}`,
      { method: 'DELETE' },
      () => demoStore.deleteEvent(id)
    );
  },

  async generatePlan(id: IdType): Promise<AIGeneratedPlan> {
    return safeFetch(
      `${API_BASE}/events/${id}/generate-plan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      () => {
        const ev = demoStore.getEvent(id);
        return {
          recommended_theme: ev.theme || 'Black and gold',
          color_palette: ['#1F5147', '#E9A477', '#252923', '#F8F7F2'],
          tasks: ev.tasks,
          ideas: ev.ideas || [],
          time_remaining_days: 30,
          urgent_compressed_schedule: false
        };
      }
    );
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return safeFetch(`${API_BASE}/dashboard`, undefined, () => demoStore.getDashboardSummary());
  },

  // Tasks
  async getTasks(eventId: IdType, filters?: { status?: string; priority?: string; category?: string; is_milestone?: boolean }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_milestone !== undefined) params.append('is_milestone', String(filters.is_milestone));

    return safeFetch(
      `${API_BASE}/events/${eventId}/tasks?${params.toString()}`,
      undefined,
      () => demoStore.getTasks(eventId, filters)
    );
  },

  async createTask(eventId: IdType, task: Partial<Task>): Promise<Task> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/tasks`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      },
      () => demoStore.createTask(eventId, task)
    );
  },

  // Supports both updateTask(taskId, task) and updateTask(eventId, taskId, task)
  async updateTask(arg1: IdType, arg2: any, arg3?: any): Promise<Task> {
    const taskId = arg3 !== undefined ? arg2 : arg1;
    const task = arg3 !== undefined ? arg3 : arg2;

    return safeFetch(
      `${API_BASE}/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      },
      () => demoStore.updateTask(taskId, task)
    );
  },

  // Supports both deleteTask(taskId) and deleteTask(eventId, taskId)
  async deleteTask(arg1: IdType, arg2?: IdType): Promise<void> {
    const taskId = arg2 !== undefined ? arg2 : arg1;
    return safeFetch(
      `${API_BASE}/tasks/${taskId}`,
      { method: 'DELETE' },
      () => demoStore.deleteTask(taskId)
    );
  },

  async generateTimelineTasks(eventId: IdType): Promise<Task[]> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/generate-plan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      () => demoStore.getEvent(eventId).tasks
    );
  },

  // Budget & Expenses
  async getBudgetSummary(eventId: IdType): Promise<BudgetSummary> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/budget`,
      undefined,
      () => demoStore.getBudgetSummary(eventId)
    );
  },

  async addExpense(eventId: IdType, expense: Partial<Expense>): Promise<Expense> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/expenses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      },
      () => demoStore.addExpense(eventId, expense)
    );
  },

  async updateExpense(expenseId: IdType, expense: Partial<Expense>): Promise<Expense> {
    return safeFetch(
      `${API_BASE}/expenses/${expenseId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      },
      () => demoStore.updateExpense(expenseId, expense)
    );
  },

  async deleteExpense(expenseId: IdType): Promise<void> {
    return safeFetch(
      `${API_BASE}/expenses/${expenseId}`,
      { method: 'DELETE' },
      () => demoStore.deleteExpense(expenseId)
    );
  },

  // Backward compatibility aliases
  async addBudgetItem(eventId: IdType, item: Partial<BudgetItem>): Promise<any> {
    return this.addExpense(eventId, {
      description: item.name || item.description || 'Expense',
      actual_amount: item.actual_cost || item.actual_amount || 0,
      estimated_amount: item.allocated_amount || 0,
      paid_deposit: item.paid_deposit || 0,
      payment_status: item.paid_deposit ? 'deposit_paid' : 'pending',
      notes: item.notes || ''
    });
  },

  async updateBudgetItem(arg1: IdType, arg2: any, arg3?: any): Promise<any> {
    const itemId = arg3 !== undefined ? arg2 : arg1;
    const item = arg3 !== undefined ? arg3 : arg2;
    return this.updateExpense(itemId, {
      description: item.name || item.description,
      actual_amount: item.actual_cost ?? item.actual_amount,
      estimated_amount: item.allocated_amount,
      paid_deposit: item.paid_deposit,
      notes: item.notes
    });
  },

  async deleteBudgetItem(arg1: IdType, arg2?: IdType): Promise<void> {
    const itemId = arg2 !== undefined ? arg2 : arg1;
    return this.deleteExpense(itemId);
  },

  async applyBudgetPreset(eventId: IdType, presetType?: string): Promise<{ message: string; count: number }> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/generate-plan`,
      { method: 'POST' },
      () => ({ message: 'Preset applied successfully', count: 9 })
    );
  },

  // Vendors
  async getVendors(eventId: IdType): Promise<Vendor[]> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/vendors`,
      undefined,
      () => demoStore.getVendors(eventId)
    );
  },

  async addVendor(eventId: IdType, vendor: Partial<Vendor>): Promise<Vendor> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/vendors`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      },
      () => demoStore.addVendor(eventId, vendor)
    );
  },

  // Supports both updateVendor(vendorId, vendor) and updateVendor(eventId, vendorId, vendor)
  async updateVendor(arg1: IdType, arg2: any, arg3?: any): Promise<Vendor> {
    const vendorId = arg3 !== undefined ? arg2 : arg1;
    const vendor = arg3 !== undefined ? arg3 : arg2;

    return safeFetch(
      `${API_BASE}/vendors/${vendorId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      },
      () => demoStore.updateVendor(vendorId, vendor)
    );
  },

  // Supports both deleteVendor(vendorId) and deleteVendor(eventId, vendorId)
  async deleteVendor(arg1: IdType, arg2?: IdType): Promise<void> {
    const vendorId = arg2 !== undefined ? arg2 : arg1;
    return safeFetch(
      `${API_BASE}/vendors/${vendorId}`,
      { method: 'DELETE' },
      () => demoStore.deleteVendor(vendorId)
    );
  },

  // Ideas & AI
  async getIdeas(eventId: IdType): Promise<{ event_id: string; ideas: Idea[] }> {
    return safeFetch(
      `${API_BASE}/events/${eventId}/ideas`,
      undefined,
      () => demoStore.getIdeas(eventId)
    );
  },

  async addIdea(eventId: IdType, idea: Partial<Idea>): Promise<Idea> {
    return {
      title: idea.title || 'Idea',
      description: idea.description || '',
      category: idea.category || 'Theme inspiration',
      is_favorite: false
    };
  },

  async toggleIdeaFavorite(eventId: IdType, ideaId: IdType): Promise<any> {
    return { success: true };
  },

  async generatePlanPreview(data: any): Promise<AIGeneratedPlan> {
    return {
      recommended_theme: data.theme || 'Black and gold',
      color_palette: ['#1F5147', '#E9A477', '#252923', '#F8F7F2'],
      tasks: [],
      ideas: [],
      budget_breakdown: [],
      vendor_checklist: [],
      schedule_timeline: [],
      time_remaining_days: 30,
      urgent_compressed_schedule: false
    };
  },

  async askCoorda(message: string, eventId?: IdType, context?: any): Promise<{ reply: string; suggested_actions?: string[] }> {
    return safeFetch(
      `${API_BASE}/ai/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, event_id: eventId, context }),
      },
      () => demoStore.askCoorda(message, eventId)
    );
  },
};
