export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ApiValidationError = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
};

export type Meal = {
  slug: string;
  name: string;
  tag: string;
  kcal: number;
  price: number;
  protein: number;
  carbs: number;
  fat: number;
  desc: string;
  ingredients: string[];
  category: string;
};

export type MealCategory = {
  slug: string;
  title: string;
  desc: string;
  time: string;
  intro: string;
};

export type Doctor = {
  id?: number;
  slug: string;
  name: string;
  spec: string;
  exp: string;
  rating: number;
  bio: string;
  focus: string[];
};

export type SubscriptionPlan = {
  id: number | string;
  name: string;
  description?: string | null;
  desc?: string;
  long?: string;
  period?: string;
  price?: number | string | null;
  meal_plan_template_id?: number | null;
  features?: string[];
  featured?: boolean;
  badge?: string;
};

export type MealOption = {
  id: number;
  meal_type: string;
  title: string;
  calories?: number | null;
};

export type MealTemplate = {
  id: number;
  meal_options?: MealOption[];
};

export type DashboardMeal = {
  id: number;
  meal_date: string;
  meal_type: string;
  meal_option?: {
    title?: string;
    calories?: number | null;
  } | null;
};

export type DashboardConsultation = {
  id: number;
  status?: string | null;
  payment_status?: string | null;
  doctor?: {
    name?: string | null;
  } | null;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

export type RazorpayVerifyPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type ConsultationPaymentOrderResponse = {
  order: RazorpayOrder;
  key_id: string;
  consultation_id: number;
};

export type DashboardPayment = {
  id: number;
  gateway?: string | null;
  amount?: number | string | null;
  status?: string | null;
  created_at?: string;
};

export type ProfileUpdatePayload = {
  name?: FormDataEntryValue | string | null;
  phone?: FormDataEntryValue | string | null;
  address_line_1?: FormDataEntryValue | string | null;
  address_line_2?: FormDataEntryValue | string | null;
  city?: FormDataEntryValue | string | null;
  state?: FormDataEntryValue | string | null;
  pincode?: FormDataEntryValue | string | null;
};

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as ApiValidationError;
  const errors = apiError.response?.data?.errors;
  const firstError = errors ? Object.values(errors).flat()[0] : null;

  return apiError.response?.data?.message || firstError || apiError.message || fallback;
};

// Extended consultation type for detail view
export type ConsultationDetail = DashboardConsultation & {
  doctor?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
  } | null;
  health_info?: Record<string, unknown> | null;
  consultation_notes?: string | null;
  assigned_meal_plan?: Record<string, unknown> | null;
  scheduled_at?: string | null;
  preferred_slot_at?: string | null;
  request_notes?: string | null;
  fee?: { amount: number; id: number } | null;
  timeline?: { status: string; date: string; note?: string }[];
  created_at: string;
  updated_at: string;
};

// Doctor profile type for admin management
export type DoctorProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  specialization: string | null;
  qualification: string | null;
  experience: string | null;
  bio: string | null;
  rating: number | null;
  focus_areas: string[] | null;
  created_at: string;
  total_patients: number;
  completed_consultations: number;
};

// Paginated doctor list response
export type DoctorListResponse = {
  doctors: {
    data: DoctorProfile[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

// Doctor create payload
export type CreateDoctorPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  status?: 'active' | 'inactive' | 'suspended';
};

// Doctor create response
export type CreateDoctorResponse = {
  message: string;
  doctor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    specialization: string | null;
    status: string;
  };
  credentials: {
    email: string;
    password: string;
  };
};

// Doctor detail response
export type DoctorDetailResponse = {
  doctor: DoctorProfile;
  consultations: PaginatedResponse<ConsultationDetail>;
  stats: {
    total_consultations: number;
    completed_consultations: number;
    pending_consultations: number;
    total_patients: number;
    active_subscriptions: number;
  };
};

// Customer subscription type
export type CustomerSubscription = {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  status: string;
  period: string;
  price: number | string;
  start_date: string;
  end_date: string;
  delivery_pincode: string;
  doctor_id: number | null;
  meal_plan_template_id: number | null;
  plan?: {
    id: number;
    name: string;
    description?: string;
  } | null;
  template?: Record<string, unknown> | null;
  preferences?: Record<string, unknown>[] | null;
  daily_selections?: DashboardMeal[];
  doctor?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
};

// Meal plan with day grouping
export type MealPlanDay = {
  date: string;
  day_name: string;
  meals: {
    meal_type: string;
    title: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  }[];
};

// Notification type
export type UserNotification = {
  id: number;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};
