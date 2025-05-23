import { SupabaseClient } from '@supabase/supabase-js';
import { 
  User, 
  SubscriptionPlan, 
  Subscription,
  Payment,
  Invoice
} from '../validations/database';

// User related database functions
export const getUserById = async (
  supabase: SupabaseClient,
  userId: string
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
};

export const updateUserProfile = async (
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as User;
};

// Subscription plans related functions
export const getAllSubscriptionPlans = async (
  supabase: SupabaseClient
): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }

  return data as SubscriptionPlan[];
};

export const getSubscriptionPlansByInterval = async (
  supabase: SupabaseClient,
  interval: 'weekly' | 'monthly' | 'yearly'
): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('interval', interval)
    .eq('active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error(`Error fetching ${interval} subscription plans:`, error);
    return [];
  }

  return data as SubscriptionPlan[];
};

export const getSubscriptionPlanById = async (
  supabase: SupabaseClient,
  planId: string
): Promise<SubscriptionPlan | null> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error fetching subscription plan:', error);
    return null;
  }

  return data as SubscriptionPlan;
};

// User subscriptions related functions
export const getUserActiveSubscription = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No active subscription
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user subscription:', error);
    return null;
  }

  return data as Subscription;
};

export const getUserSubscriptionHistory = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user subscription history:', error);
    return [];
  }

  return data as Subscription[];
};

// Payments related functions
export const getUserPayments = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user payments:', error);
    return [];
  }

  return data as Payment[];
};

export const getPaymentById = async (
  supabase: SupabaseClient,
  paymentId: string
): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) {
    console.error('Error fetching payment:', error);
    return null;
  }

  return data as Payment;
};

// Invoices related functions
export const getUserInvoices = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user invoices:', error);
    return [];
  }

  return data as Invoice[];
};

export const getInvoiceById = async (
  supabase: SupabaseClient,
  invoiceId: string
): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data as Invoice;
}; 