export type IdType = string | number;

export interface Task {
  id: IdType;
  event_id: IdType;
  title: string;
  description?: string;
  category?: string;
  due_date?: string;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | string;
  is_milestone: boolean;
  is_urgent?: boolean;
  assigned_to?: string;
  order_index?: number;
  created_at?: string;
}

export interface BudgetCategory {
  id: IdType;
  event_id: IdType;
  name: string;
  allocated_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: IdType;
  event_id: IdType;
  category_id?: IdType;
  category_name?: string;
  description: string;
  estimated_amount: number;
  actual_amount: number;
  payment_status: 'pending' | 'deposit_paid' | 'paid' | 'refunded' | string;
  paid_deposit: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Backward compatibility alias for BudgetItem
export interface BudgetItem {
  id: IdType;
  event_id: IdType;
  category?: string;
  name?: string;
  description?: string;
  allocated_amount?: number;
  actual_cost?: number;
  actual_amount?: number;
  paid_deposit?: number;
  payment_status?: string;
  notes?: string;
  created_at?: string;
}

export interface CategorySummary {
  category_id?: IdType;
  category: string;
  allocated: number;
  actual: number;
  deposit: number;
  item_count: number;
  percentage: number;
  is_over_budget: boolean;
  variance: number;
}

export interface BudgetSummary {
  event_id: IdType;
  currency: string;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  total_deposits_paid: number;
  remaining_balance: number;
  unallocated_budget: number;
  is_over_budget: boolean;
  shortfall: number;
  reduction_suggestions: string[];
  categories: CategorySummary[];
  expenses: Expense[];
  items?: BudgetItem[];
}

export interface Vendor {
  id: IdType;
  event_id: IdType;
  name: string;
  category: 'venue' | 'catering' | 'decoration' | 'photographer' | 'entertainment' | 'invitation/printing' | 'transport' | 'miscellaneous' | string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  quoted_amount: number;
  estimated_quote?: number;
  final_quote?: number;
  deposit_amount: number;
  deposit_paid: boolean;
  balance_due: number;
  booking_status: 'shortlisted' | 'contacted' | 'quoted' | 'booked' | 'cancelled' | string;
  status?: string;
  follow_up_date?: string;
  notes?: string;
  rating?: number;
  created_at?: string;
}

export interface AIGeneration {
  id: IdType;
  event_id: IdType;
  generation_type: string;
  model: string;
  status: string;
  content_json: string;
  created_at: string;
}

export interface ActivityLog {
  id: IdType;
  event_id: IdType;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: IdType;
  timestamp_label: string;
  created_at: string;
}

export interface Idea {
  id?: IdType;
  event_id?: IdType;
  title: string;
  description: string;
  category?: string;
  mode?: string;
  estimated_cost_range?: string;
  prep_effort?: string;
  required_materials?: string;
  why_it_suits?: string;
  tags?: string;
  is_favorite?: boolean;
  created_at?: string;
}

export interface EventStats {
  total_milestones: number;
  completed_milestones: number;
  milestone_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  task_percentage: number;
  total_budget: number;
  budget_allocated?: number;
  budget_committed: number;
  budget_remaining: number;
  shortfall: number;
  is_over_budget: boolean;
  total_paid_deposits: number;
  total_vendors: number;
  days_to_go: number;
  date_warning?: string;
}

export interface Event {
  id: IdType;
  name: string;
  event_type: string;
  event_date: string;
  date?: string;
  city?: string;
  venue_type?: string;
  guest_count?: number;
  total_budget: number;
  currency?: string;
  theme?: string;
  atmosphere?: string;
  preferences_json?: string;
  preferences?: string;
  dietary_requirements?: string;
  accessibility_requirements?: string;
  status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'DRAFT' | string;
  icon: string;
  created_at: string;
  updated_at: string;
  stats?: EventStats;
}

export interface EventDetail extends Event {
  tasks: Task[];
  budget_categories?: BudgetCategory[];
  expenses?: Expense[];
  budget_items?: BudgetItem[];
  vendors: Vendor[];
  activity_logs: ActivityLog[];
  ai_generations?: AIGeneration[];
  ideas?: Idea[];
}

export interface DashboardSummary {
  total_events: number;
  total_planned_spending: number;
  total_committed_spending: number;
  tasks_due_soon: Task[];
  upcoming_events: Event[];
}

export interface AIGeneratedPlan {
  recommended_theme: string;
  color_palette: string[];
  tasks: any[];
  categories?: any[];
  budget_breakdown?: any[];
  vendor_checklist?: any[];
  vendors?: any[];
  schedule_timeline?: any[];
  ideas: any[];
  time_remaining_days: number;
  urgent_compressed_schedule: boolean;
}
