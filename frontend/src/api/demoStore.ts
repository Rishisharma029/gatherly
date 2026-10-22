import type {
  Event,
  EventDetail,
  DashboardSummary,
  Task,
  Expense,
  BudgetSummary,
  CategorySummary,
  Vendor,
  Idea,
  IdType
} from '../types';

const STORAGE_KEY = 'gatherly_offline_demo_db_v1';

interface StoredData {
  events: EventDetail[];
}

function getInitialData(): StoredData {
  const today = new Date();
  const future30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const future90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  const aaravEvent: EventDetail = {
    id: 'aarav-21',
    name: "Aarav's 21st Birthday",
    event_type: "Birthday",
    event_date: future30,
    date: future30,
    city: "Faridabad",
    venue_type: "Home, restaurant or outdoor",
    guest_count: 40,
    total_budget: 25000.0,
    currency: "₹",
    theme: "Black and gold",
    atmosphere: "Minimal, elegant",
    preferences_json: JSON.stringify({
      preferences: "Vegetarian menu, music, accessibility needs",
      dietary_requirements: "Strict vegetarian, no onion/garlic option for 4 elders",
      accessibility_requirements: "Ground floor or lift access for senior relatives"
    }),
    status: "PLANNING",
    icon: "🎉",
    created_at: nowIso,
    updated_at: nowIso,
    budget_categories: [
      { id: 'cat-1', event_id: 'aarav-21', name: "Venue Rental / Space Booking", allocated_amount: 5000.0 },
      { id: 'cat-2', event_id: 'aarav-21', name: "Food and Catering", allocated_amount: 7500.0 },
      { id: 'cat-3', event_id: 'aarav-21', name: "Decor & Balloons / Tableware", allocated_amount: 3750.0 },
      { id: 'cat-4', event_id: 'aarav-21', name: "Photography / Media", allocated_amount: 2000.0 },
      { id: 'cat-5', event_id: 'aarav-21', name: "Entertainment / Sound System", allocated_amount: 2500.0 },
      { id: 'cat-6', event_id: 'aarav-21', name: "Digital Invitations & Favors", allocated_amount: 750.0 },
      { id: 'cat-7', event_id: 'aarav-21', name: "Attire & Personal Styling", allocated_amount: 1000.0 },
      { id: 'cat-8', event_id: 'aarav-21', name: "Miscellaneous & Disposables", allocated_amount: 1250.0 },
      { id: 'cat-9', event_id: 'aarav-21', name: "Contingency Reserve (Buffer)", allocated_amount: 1250.0 },
    ],
    expenses: [
      {
        id: 'exp-1',
        event_id: 'aarav-21',
        category_id: 'cat-2',
        category_name: "Food and Catering",
        description: "Artisan Spice Hospitality (Vegetarian Buffet for 40)",
        estimated_amount: 7500.0,
        actual_amount: 6500.0,
        paid_deposit: 2000.0,
        payment_status: "deposit_paid",
        notes: "Secured discount for advance booking. Balance ₹4,500 due on event day."
      },
      {
        id: 'exp-2',
        event_id: 'aarav-21',
        category_id: 'cat-3',
        category_name: "Decor & Balloons / Tableware",
        description: "Black & Gold Shimmer Focal Wall & Balloons",
        estimated_amount: 3750.0,
        actual_amount: 2500.0,
        paid_deposit: 1000.0,
        payment_status: "deposit_paid",
        notes: "Minimalist backdrop with fairy lights."
      }
    ],
    tasks: [
      {
        id: 'task-1',
        event_id: 'aarav-21',
        title: "Confirm budget and guest estimate",
        description: "Finalized ₹25,000 budget ceiling and 40-person guest roster.",
        category: "planning",
        due_date: today.toISOString().split('T')[0],
        deadline: today.toISOString().split('T')[0],
        priority: "High",
        status: "COMPLETED",
        is_milestone: true
      },
      {
        id: 'task-2',
        event_id: 'aarav-21',
        title: "Shortlist venues and vendors",
        description: "Review Faridabad restaurant private dining halls and outdoor terraces.",
        category: "venue",
        due_date: new Date(today.getTime() + 9 * 86400000).toISOString().split('T')[0],
        deadline: new Date(today.getTime() + 9 * 86400000).toISOString().split('T')[0],
        priority: "High",
        status: "IN_PROGRESS",
        is_milestone: true
      },
      {
        id: 'task-3',
        event_id: 'aarav-21',
        title: "Confirm menu and decorations",
        description: "Vegetarian courses, mocktails, and black/gold photo wall.",
        category: "catering",
        due_date: new Date(today.getTime() + 16 * 86400000).toISOString().split('T')[0],
        deadline: new Date(today.getTime() + 16 * 86400000).toISOString().split('T')[0],
        priority: "Medium",
        status: "TODO",
        is_milestone: true
      },
      {
        id: 'task-4',
        event_id: 'aarav-21',
        title: "Finalize guest attendance",
        description: "Collect all RSVPs and dietary count via digital invites.",
        category: "invitation/printing",
        due_date: new Date(today.getTime() + 23 * 86400000).toISOString().split('T')[0],
        deadline: new Date(today.getTime() + 23 * 86400000).toISOString().split('T')[0],
        priority: "High",
        status: "TODO",
        is_milestone: true
      },
      {
        id: 'task-5',
        event_id: 'aarav-21',
        title: "Confirm all bookings",
        description: "Re-confirm caterer arrival, sound setup, and cake delivery.",
        category: "entertainment",
        due_date: new Date(today.getTime() + 28 * 86400000).toISOString().split('T')[0],
        deadline: new Date(today.getTime() + 28 * 86400000).toISOString().split('T')[0],
        priority: "High",
        status: "TODO",
        is_milestone: true
      },
      {
        id: 'task-6',
        event_id: 'aarav-21',
        title: "Follow the event-day schedule",
        description: "Host guests, coordinate photography cues, and enjoy the celebration.",
        category: "general",
        due_date: future30,
        deadline: future30,
        priority: "High",
        status: "TODO",
        is_milestone: true
      }
    ],
    vendors: [
      {
        id: 'ven-1',
        event_id: 'aarav-21',
        name: "Faridabad Sky Lounge & Garden",
        category: "venue",
        contact_name: "Aman Verma",
        email: "events@skyloungefaridabad.example.com",
        phone: "+91 98111 22334",
        quoted_amount: 5000.0,
        deposit_amount: 1000.0,
        deposit_paid: false,
        balance_due: 5000.0,
        booking_status: "shortlisted",
        notes: "Outdoor terrace dining area with lift access for elders."
      },
      {
        id: 'ven-2',
        event_id: 'aarav-21',
        name: "Artisan Spice Hospitality",
        category: "catering",
        contact_name: "Chef Ramesh",
        email: "ramesh@artisanspice.example.com",
        phone: "+91 98222 33445",
        quoted_amount: 6500.0,
        deposit_amount: 2000.0,
        deposit_paid: true,
        balance_due: 4500.0,
        booking_status: "booked",
        notes: "Pure vegetarian buffet with live chaat counter and Jain options."
      },
      {
        id: 'ven-3',
        event_id: 'aarav-21',
        name: "Luxe Decor & Balloon Stylists",
        category: "decoration",
        contact_name: "Neha Kapoor",
        email: "neha@luxedecor.example.com",
        phone: "+91 98333 44556",
        quoted_amount: 2500.0,
        deposit_amount: 1000.0,
        deposit_paid: true,
        balance_due: 1500.0,
        booking_status: "booked",
        notes: "Matte black and mirrored gold balloon garland and entrance arch."
      }
    ],
    activity_logs: [
      { id: 'log-1', event_id: 'aarav-21', user_name: "Event Planner", action: "Created event \"Aarav's 21st Birthday\" (₹25,000)", entity_type: "Event", timestamp_label: "10:00 am", created_at: nowIso },
      { id: 'log-2', event_id: 'aarav-21', user_name: "Gatherly AI", action: "Generated AI plan with 6 timeline milestones and 9 budget categories", entity_type: "Plan", timestamp_label: "10:01 am", created_at: nowIso },
      { id: 'log-3', event_id: 'aarav-21', user_name: "Event Planner", action: "Completed task \"Confirm budget and guest estimate\"", entity_type: "Task", timestamp_label: "10:30 am", created_at: nowIso },
      { id: 'log-4', event_id: 'aarav-21', user_name: "Event Planner", action: "Booked caterer \"Artisan Spice Hospitality\" (₹2,000 deposit paid)", entity_type: "Vendor", timestamp_label: "11:15 am", created_at: nowIso }
    ],
    ideas: [
      {
        title: "Matte Black & Mirrored Gold Photo Backdrop",
        description: "Create a photogenic focal wall with warm fairy lights and gold 21 numerals.",
        category: "Decoration plans",
        mode: "Decoration plans",
        estimated_cost_range: "₹2,500 – ₹4,000",
        prep_effort: "Low (1.5 hours)",
        required_materials: "Black backdrop, fairy lights, balloon arch",
        why_it_suits: "Fits the minimal, elegant atmosphere.",
        is_favorite: true
      },
      {
        title: "Curated Mocktail & Signature Spritz Station",
        description: "Self-serve beverage bar with Sparkling Elderberry Spritz and fresh mint.",
        category: "Menu suggestions",
        mode: "Menu suggestions",
        estimated_cost_range: "₹2,000 – ₹3,500",
        prep_effort: "Low (45 mins)",
        required_materials: "Glass dispensers, gold rim cups, soda",
        why_it_suits: "Fits vegetarian preferences at half the cost of an open bar.",
        is_favorite: true
      }
    ]
  };

  const weddingEvent: EventDetail = {
    id: 'wedding-2027',
    name: "John & Jane Wedding",
    event_type: "Wedding",
    event_date: future90,
    date: future90,
    city: "Delhi NCR",
    venue_type: "Heritage Resort or Banquet Hall",
    guest_count: 200,
    total_budget: 500000.0,
    currency: "₹",
    theme: "Royal Marigold & Ivory",
    atmosphere: "Festive, opulent, welcoming",
    preferences_json: JSON.stringify({
      preferences: "Fusion catering, traditional live musicians",
      dietary_requirements: "Separate vegan & vegetarian buffet lines"
    }),
    status: "PLANNING",
    icon: "💍",
    created_at: nowIso,
    updated_at: nowIso,
    budget_categories: [
      { id: 'wcat-1', event_id: 'wedding-2027', name: "Ceremony & Reception Venue", allocated_amount: 125000.0 },
      { id: 'wcat-2', event_id: 'wedding-2027', name: "Catering & Beverages", allocated_amount: 150000.0 },
      { id: 'wcat-3', event_id: 'wedding-2027', name: "Floral & Stage Decoration", allocated_amount: 60000.0 },
      { id: 'wcat-4', event_id: 'wedding-2027', name: "Photography & Cinematography", allocated_amount: 50000.0 },
      { id: 'wcat-5', event_id: 'wedding-2027', name: "Music & Entertainment", allocated_amount: 25000.0 },
      { id: 'wcat-6', event_id: 'wedding-2027', name: "Invitations & Stationery", allocated_amount: 10000.0 },
      { id: 'wcat-7', event_id: 'wedding-2027', name: "Attire, Hair & Makeup", allocated_amount: 40000.0 },
      { id: 'wcat-8', event_id: 'wedding-2027', name: "Transport & Gifts", allocated_amount: 15000.0 },
      { id: 'wcat-9', event_id: 'wedding-2027', name: "Contingency Reserve (Buffer)", allocated_amount: 25000.0 }
    ],
    expenses: [],
    tasks: [
      {
        id: 'wtask-1',
        event_id: 'wedding-2027',
        title: "Book wedding resort & mandap venue",
        description: "Finalize 2-day booking in Delhi NCR for 200 guests.",
        category: "venue",
        due_date: new Date(today.getTime() + 15 * 86400000).toISOString().split('T')[0],
        deadline: new Date(today.getTime() + 15 * 86400000).toISOString().split('T')[0],
        priority: "High",
        status: "IN_PROGRESS",
        is_milestone: true
      }
    ],
    vendors: [],
    activity_logs: [],
    ideas: []
  };

  return {
    events: [aaravEvent, weddingEvent]
  };
}

function loadDb(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  const init = getInitialData();
  saveDb(init);
  return init;
}

function saveDb(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

function computeStats(event: EventDetail) {
  const milestones = event.tasks.filter(t => t.is_milestone);
  const compMilestones = milestones.filter(t => t.status === 'COMPLETED').length;
  const mPct = milestones.length > 0 ? Math.round((compMilestones / milestones.length) * 100) : 0;

  const totalTasks = event.tasks.length;
  const compTasks = event.tasks.filter(t => t.status === 'COMPLETED').length;
  const tPct = totalTasks > 0 ? Math.round((compTasks / totalTasks) * 100) : 0;

  const totalBudget = event.total_budget || 0;
  const budgetAllocated = (event.budget_categories || []).reduce((sum, c) => sum + (c.allocated_amount || 0), 0);
  const budgetCommitted = (event.expenses || []).reduce((sum, e) => sum + (e.actual_amount || 0), 0);
  const totalPaidDeposits = (event.expenses || []).reduce((sum, e) => sum + (e.paid_deposit || 0), 0);
  const budgetRemaining = Math.max(0, totalBudget - budgetCommitted);
  const shortfall = Math.max(0, budgetCommitted - totalBudget);

  const evDate = new Date(event.event_date || event.date || Date.now());
  const today = new Date();
  const diffDays = Math.ceil((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    total_milestones: milestones.length,
    completed_milestones: compMilestones,
    milestone_percentage: mPct,
    total_tasks: totalTasks,
    completed_tasks: compTasks,
    task_percentage: tPct,
    total_budget: totalBudget,
    budget_allocated: budgetAllocated,
    budget_committed: budgetCommitted,
    budget_remaining: budgetRemaining,
    shortfall,
    is_over_budget: budgetCommitted > totalBudget,
    total_paid_deposits: totalPaidDeposits,
    total_vendors: event.vendors.length,
    days_to_go: Math.max(0, diffDays)
  };
}

export const demoStore = {
  getEvents(): Event[] {
    const db = loadDb();
    return db.events.map(ev => ({
      ...ev,
      stats: computeStats(ev)
    }));
  },

  getEvent(id: IdType): EventDetail {
    const db = loadDb();
    const ev = db.events.find(e => String(e.id) === String(id)) || db.events[0];
    if (!ev) throw new Error('Event not found');
    return {
      ...ev,
      stats: computeStats(ev)
    };
  },

  createEvent(data: Partial<Event>): EventDetail {
    const db = loadDb();
    const newId = 'ev-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const totalBudget = data.total_budget || 25000;
    const nowIso = new Date().toISOString();

    const newEvent: EventDetail = {
      id: newId,
      name: data.name || 'Untitled Event',
      event_type: data.event_type || 'Birthday',
      event_date: data.event_date || data.date || today,
      date: data.event_date || data.date || today,
      city: data.city || 'Faridabad',
      venue_type: data.venue_type || 'Home, restaurant or outdoor',
      guest_count: data.guest_count || 40,
      total_budget: totalBudget,
      currency: data.currency || '₹',
      theme: data.theme || 'Minimal Elegance',
      atmosphere: data.atmosphere || 'Warm & intimate',
      preferences_json: data.preferences_json || '{}',
      status: data.status || 'PLANNING',
      icon: data.icon || '🎉',
      created_at: nowIso,
      updated_at: nowIso,
      budget_categories: [
        { id: `${newId}-c1`, event_id: newId, name: 'Venue Rental / Space Booking', allocated_amount: Math.round(totalBudget * 0.20) },
        { id: `${newId}-c2`, event_id: newId, name: 'Food and Catering', allocated_amount: Math.round(totalBudget * 0.30) },
        { id: `${newId}-c3`, event_id: newId, name: 'Decor & Balloons / Tableware', allocated_amount: Math.round(totalBudget * 0.15) },
        { id: `${newId}-c4`, event_id: newId, name: 'Photography / Media', allocated_amount: Math.round(totalBudget * 0.08) },
        { id: `${newId}-c5`, event_id: newId, name: 'Entertainment / Sound System', allocated_amount: Math.round(totalBudget * 0.10) },
        { id: `${newId}-c6`, event_id: newId, name: 'Digital Invitations & Favors', allocated_amount: Math.round(totalBudget * 0.03) },
        { id: `${newId}-c7`, event_id: newId, name: 'Attire & Personal Styling', allocated_amount: Math.round(totalBudget * 0.04) },
        { id: `${newId}-c8`, event_id: newId, name: 'Miscellaneous & Disposables', allocated_amount: Math.round(totalBudget * 0.05) },
        { id: `${newId}-c9`, event_id: newId, name: 'Contingency Reserve (Buffer)', allocated_amount: Math.round(totalBudget * 0.05) }
      ],
      expenses: [],
      tasks: [
        { id: `${newId}-t1`, event_id: newId, title: 'Confirm budget and guest estimate', priority: 'High', status: 'COMPLETED', is_milestone: true, due_date: today },
        { id: `${newId}-t2`, event_id: newId, title: 'Shortlist venues and vendors', priority: 'High', status: 'IN_PROGRESS', is_milestone: true, due_date: today },
        { id: `${newId}-t3`, event_id: newId, title: 'Confirm menu and decorations', priority: 'Medium', status: 'TODO', is_milestone: true, due_date: today }
      ],
      vendors: [],
      activity_logs: [
        { id: `log-${Date.now()}`, event_id: newId, user_name: 'Planner', action: `Created event "${data.name}"`, entity_type: 'Event', timestamp_label: 'Just now', created_at: nowIso }
      ],
      ideas: [
        { title: 'Signature Sensory Welcoming', description: 'Greet arriving guests with bespoke welcome drinks and acoustic playlist.', category: 'Theme inspiration', is_favorite: true }
      ]
    };

    db.events.unshift(newEvent);
    saveDb(db);
    return {
      ...newEvent,
      stats: computeStats(newEvent)
    };
  },

  updateEvent(id: IdType, data: Partial<Event>): EventDetail {
    const db = loadDb();
    const idx = db.events.findIndex(e => String(e.id) === String(id));
    if (idx === -1) throw new Error('Event not found');
    db.events[idx] = { ...db.events[idx], ...data, updated_at: new Date().toISOString() };
    saveDb(db);
    return {
      ...db.events[idx],
      stats: computeStats(db.events[idx])
    };
  },

  deleteEvent(id: IdType): void {
    const db = loadDb();
    db.events = db.events.filter(e => String(e.id) !== String(id));
    saveDb(db);
  },

  getDashboardSummary(): DashboardSummary {
    const db = loadDb();
    const totalPlanned = db.events.reduce((sum, e) => sum + (e.total_budget || 0), 0);
    const totalCommitted = db.events.reduce((sum, e) => {
      return sum + (e.expenses || []).reduce((esum, exp) => esum + (exp.actual_amount || 0), 0);
    }, 0);

    const allTasks: Task[] = [];
    db.events.forEach(e => {
      (e.tasks || []).forEach(t => {
        if (t.status !== 'COMPLETED') allTasks.push(t);
      });
    });

    const upcomingEvents = db.events.map(e => ({
      ...e,
      stats: computeStats(e)
    }));

    return {
      total_events: db.events.length,
      total_planned_spending: totalPlanned,
      total_committed_spending: totalCommitted,
      tasks_due_soon: allTasks.slice(0, 6),
      upcoming_events: upcomingEvents
    };
  },

  getBudgetSummary(eventId: IdType): BudgetSummary {
    const ev = this.getEvent(eventId);
    const cats = ev.budget_categories || [];
    const exps = ev.expenses || [];

    const totalBudget = ev.total_budget || 0;
    const totalAllocated = cats.reduce((s, c) => s + (c.allocated_amount || 0), 0);
    const totalSpent = exps.reduce((s, e) => s + (e.actual_amount || 0), 0);
    const totalDepositsPaid = exps.reduce((s, e) => s + (e.paid_deposit || 0), 0);
    const remainingBalance = Math.max(0, totalBudget - totalSpent);
    const unallocated = Math.max(0, totalBudget - totalAllocated);
    const isOver = totalSpent > totalBudget;
    const shortfall = Math.max(0, totalSpent - totalBudget);

    const catSummaries: CategorySummary[] = cats.map(c => {
      const catExps = exps.filter(e => e.category_id === c.id);
      const act = catExps.reduce((s, e) => s + (e.actual_amount || 0), 0);
      const dep = catExps.reduce((s, e) => s + (e.paid_deposit || 0), 0);
      const variance = c.allocated_amount - act;
      const catOver = act > c.allocated_amount && c.allocated_amount > 0;
      const pct = totalBudget > 0 ? Math.round((c.allocated_amount / totalBudget) * 100) : 0;
      return {
        category_id: c.id,
        category: c.name,
        allocated: c.allocated_amount,
        actual: act,
        deposit: dep,
        item_count: catExps.length,
        percentage: pct,
        is_over_budget: catOver,
        variance
      };
    });

    const reductionSuggestions: string[] = [];
    catSummaries.filter(c => c.is_over_budget).forEach(c => {
      reductionSuggestions.push(`Reduce '${c.category}' spending by ${ev.currency || '₹'}${Math.abs(c.variance).toLocaleString()} to return to category limit.`);
    });

    return {
      event_id: ev.id,
      currency: ev.currency || '₹',
      total_budget: totalBudget,
      total_allocated: totalAllocated,
      total_spent: totalSpent,
      total_deposits_paid: totalDepositsPaid,
      remaining_balance: remainingBalance,
      unallocated_budget: unallocated,
      is_over_budget: isOver,
      shortfall,
      reduction_suggestions: reductionSuggestions,
      categories: catSummaries,
      expenses: exps
    };
  },

  addExpense(eventId: IdType, exp: Partial<Expense>): Expense {
    const db = loadDb();
    const ev = db.events.find(e => String(e.id) === String(eventId));
    if (!ev) throw new Error('Event not found');

    const cat = (ev.budget_categories || []).find(c => c.id === exp.category_id);
    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      event_id: eventId,
      category_id: exp.category_id,
      category_name: cat ? cat.name : 'General',
      description: exp.description || 'Expense',
      estimated_amount: exp.estimated_amount || 0,
      actual_amount: exp.actual_amount || 0,
      paid_deposit: exp.paid_deposit || 0,
      payment_status: exp.payment_status || 'pending',
      notes: exp.notes || ''
    };

    if (!ev.expenses) ev.expenses = [];
    ev.expenses.push(newExp);
    saveDb(db);
    return newExp;
  },

  updateExpense(expenseId: IdType, exp: Partial<Expense>): Expense {
    const db = loadDb();
    for (const ev of db.events) {
      const idx = (ev.expenses || []).findIndex(e => String(e.id) === String(expenseId));
      if (idx !== -1 && ev.expenses) {
        ev.expenses[idx] = { ...ev.expenses[idx], ...exp };
        saveDb(db);
        return ev.expenses[idx];
      }
    }
    throw new Error('Expense not found');
  },

  deleteExpense(expenseId: IdType): void {
    const db = loadDb();
    for (const ev of db.events) {
      if (ev.expenses) {
        ev.expenses = ev.expenses.filter(e => String(e.id) !== String(expenseId));
      }
    }
    saveDb(db);
  },

  getTasks(eventId: IdType, filters?: any): Task[] {
    const ev = this.getEvent(eventId);
    let tasks = ev.tasks || [];
    if (filters?.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters?.priority) tasks = tasks.filter(t => t.priority === filters.priority);
    if (filters?.category) tasks = tasks.filter(t => t.category === filters.category);
    if (filters?.is_milestone !== undefined) tasks = tasks.filter(t => t.is_milestone === filters.is_milestone);
    return tasks;
  },

  createTask(eventId: IdType, task: Partial<Task>): Task {
    const db = loadDb();
    const ev = db.events.find(e => String(e.id) === String(eventId));
    if (!ev) throw new Error('Event not found');

    const newTask: Task = {
      id: 'task-' + Date.now(),
      event_id: eventId,
      title: task.title || 'New Task',
      description: task.description || '',
      category: task.category || 'general',
      due_date: task.due_date || task.deadline || new Date().toISOString().split('T')[0],
      deadline: task.due_date || task.deadline || new Date().toISOString().split('T')[0],
      priority: task.priority || 'Medium',
      status: task.status || 'TODO',
      is_milestone: task.is_milestone ?? false
    };

    if (!ev.tasks) ev.tasks = [];
    ev.tasks.push(newTask);
    saveDb(db);
    return newTask;
  },

  updateTask(taskId: IdType, task: Partial<Task>): Task {
    const db = loadDb();
    for (const ev of db.events) {
      const idx = (ev.tasks || []).findIndex(t => String(t.id) === String(taskId));
      if (idx !== -1) {
        ev.tasks[idx] = { ...ev.tasks[idx], ...task };
        saveDb(db);
        return ev.tasks[idx];
      }
    }
    throw new Error('Task not found');
  },

  deleteTask(taskId: IdType): void {
    const db = loadDb();
    for (const ev of db.events) {
      if (ev.tasks) {
        ev.tasks = ev.tasks.filter(t => String(t.id) !== String(taskId));
      }
    }
    saveDb(db);
  },

  getVendors(eventId: IdType): Vendor[] {
    const ev = this.getEvent(eventId);
    return ev.vendors || [];
  },

  addVendor(eventId: IdType, vendor: Partial<Vendor>): Vendor {
    const db = loadDb();
    const ev = db.events.find(e => String(e.id) === String(eventId));
    if (!ev) throw new Error('Event not found');

    const quote = vendor.quoted_amount || vendor.estimated_quote || 0;
    const deposit = vendor.deposit_amount || 0;
    const balance = Math.max(0, quote - (vendor.deposit_paid ? deposit : 0));

    const newVendor: Vendor = {
      id: 'ven-' + Date.now(),
      event_id: eventId,
      name: vendor.name || 'Vendor',
      category: vendor.category || 'catering',
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      quoted_amount: quote,
      deposit_amount: deposit,
      deposit_paid: vendor.deposit_paid || false,
      balance_due: balance,
      booking_status: vendor.booking_status || 'contacted',
      notes: vendor.notes || '',
      follow_up_date: vendor.follow_up_date || ''
    };

    if (!ev.vendors) ev.vendors = [];
    ev.vendors.push(newVendor);
    saveDb(db);
    return newVendor;
  },

  updateVendor(vendorId: IdType, vendor: Partial<Vendor>): Vendor {
    const db = loadDb();
    for (const ev of db.events) {
      const idx = (ev.vendors || []).findIndex(v => String(v.id) === String(vendorId));
      if (idx !== -1) {
        const cur = ev.vendors[idx];
        const updated = { ...cur, ...vendor };
        const quote = updated.quoted_amount || updated.estimated_quote || 0;
        const deposit = updated.deposit_amount || 0;
        updated.balance_due = Math.max(0, quote - (updated.deposit_paid ? deposit : 0));
        ev.vendors[idx] = updated;
        saveDb(db);
        return updated;
      }
    }
    throw new Error('Vendor not found');
  },

  deleteVendor(vendorId: IdType): void {
    const db = loadDb();
    for (const ev of db.events) {
      if (ev.vendors) {
        ev.vendors = ev.vendors.filter(v => String(v.id) !== String(vendorId));
      }
    }
    saveDb(db);
  },

  getIdeas(eventId: IdType): { event_id: string; ideas: Idea[] } {
    const ev = this.getEvent(eventId);
    return {
      event_id: String(ev.id),
      ideas: ev.ideas || []
    };
  },

  askCoorda(message: string, eventId?: IdType): { reply: string; suggested_actions: string[] } {
    const msg = message.toLowerCase();
    if (msg.includes('budget') || msg.includes('save') || msg.includes('cost')) {
      return {
        reply: `### 💡 Gatherly AI Budget Guidance
Here are practical trade-offs for staying on budget:
1. **Focus Decoration on a Single Focal Wall**: Invest in one high-impact photo backdrop rather than perimeter table decor.
2. **Prioritize Catering Quality**: Allocate 30% to food and beverages, as this leaves the strongest lasting impression on guests.
3. **Keep a 5% Buffer**: Maintain a ₹1,250 reserve for final 48-hour transportation and disposable needs.`,
        suggested_actions: ['Apply Birthday 100% Preset', 'Check category variances', 'Add 5% contingency buffer']
      };
    }
    return {
      reply: `### 🌿 Gatherly AI Planning Advisor
I'm ready to assist with your event!
- **Budget Balancing**: Check allocated limits vs incurred expenses.
- **Dynamic Timelines**: Review urgent milestones based on time remaining.
- **Vendor Tracking**: Monitor quotes, deposits paid, and balance due.`,
      suggested_actions: ['Check budget balance', 'Review timeline deadlines', 'Brainstorm theme ideas']
    };
  }
};
