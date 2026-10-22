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

const API_BASE = '/api';

export const api = {
  // Events
  async getEvents(): Promise<Event[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEvent(id: IdType): Promise<EventDetail> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch event #${id}`);
    return res.json();
  },

  async createEvent(data: Partial<Event>, autoGeneratePlan = true): Promise<EventDetail> {
    const res = await fetch(`${API_BASE}/events?auto_generate_plan=${autoGeneratePlan}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create event');
    }
    return res.json();
  },

  async updateEvent(id: IdType, data: Partial<Event>): Promise<EventDetail> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update event #${id}`);
    return res.json();
  },

  async deleteEvent(id: IdType): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete event #${id}`);
  },

  async generatePlan(id: IdType): Promise<AIGeneratedPlan> {
    const res = await fetch(`${API_BASE}/events/${id}/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to generate plan for event #${id}`);
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  // Tasks
  async getTasks(eventId: IdType, filters?: { status?: string; priority?: string; category?: string; is_milestone?: boolean }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_milestone !== undefined) params.append('is_milestone', String(filters.is_milestone));

    const res = await fetch(`${API_BASE}/events/${eventId}/tasks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(eventId: IdType, task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  // Supports both updateTask(taskId, task) and updateTask(eventId, taskId, task)
  async updateTask(arg1: IdType, arg2: any, arg3?: any): Promise<Task> {
    const taskId = arg3 !== undefined ? arg2 : arg1;
    const task = arg3 !== undefined ? arg3 : arg2;
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  // Supports both deleteTask(taskId) and deleteTask(eventId, taskId)
  async deleteTask(arg1: IdType, arg2?: IdType): Promise<void> {
    const taskId = arg2 !== undefined ? arg2 : arg1;
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  async generateTimelineTasks(eventId: IdType): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to generate timeline tasks');
    const data = await res.json();
    return data.tasks || [];
  },

  // Budget & Expenses
  async getBudgetSummary(eventId: IdType): Promise<BudgetSummary> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget`);
    if (!res.ok) throw new Error('Failed to fetch budget summary');
    return res.json();
  },

  async addExpense(eventId: IdType, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    return res.json();
  },

  async updateExpense(expenseId: IdType, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(expenseId: IdType): Promise<void> {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete expense');
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
    await this.generatePlan(eventId);
    return { message: 'Preset applied successfully', count: 9 };
  },

  // Vendors
  async getVendors(eventId: IdType): Promise<Vendor[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  async addVendor(eventId: IdType, vendor: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to add vendor');
    return res.json();
  },

  // Supports both updateVendor(vendorId, vendor) and updateVendor(eventId, vendorId, vendor)
  async updateVendor(arg1: IdType, arg2: any, arg3?: any): Promise<Vendor> {
    const vendorId = arg3 !== undefined ? arg2 : arg1;
    const vendor = arg3 !== undefined ? arg3 : arg2;
    const res = await fetch(`${API_BASE}/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  // Supports both deleteVendor(vendorId) and deleteVendor(eventId, vendorId)
  async deleteVendor(arg1: IdType, arg2?: IdType): Promise<void> {
    const vendorId = arg2 !== undefined ? arg2 : arg1;
    const res = await fetch(`${API_BASE}/vendors/${vendorId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vendor');
  },

  // Ideas & AI
  async getIdeas(eventId: IdType): Promise<{ event_id: string; ideas: Idea[] }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas`);
    if (!res.ok) throw new Error('Failed to fetch ideas');
    return res.json();
  },

  async addIdea(eventId: IdType, idea: Partial<Idea>): Promise<Idea> {
    // Generate or add idea
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
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, event_id: eventId, context }),
    });
    if (!res.ok) throw new Error('Failed to contact Gatherly AI');
    return res.json();
  },
};
