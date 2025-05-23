declare module 'razorpay' {
  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
    headers?: Record<string, string>;
  }
  
  export interface OrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
    payment_capture?: 0 | 1;
  }
  
  export interface PaymentOptions {
    amount: number;
    currency: string;
    email: string;
    contact: string;
    order_id: string;
    method: string;
    [key: string]: any;
  }
  
  export interface CustomerOptions {
    name: string;
    contact: string | number;
    email: string;
    fail_existing?: 0 | 1;
    gstin?: string;
    notes?: Record<string, string>;
  }

  export interface Order {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }

  export interface Payment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    invoice_id: string;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string;
    card_id: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    notes: Record<string, string>;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    created_at: number;
  }

  export default class Razorpay {
    constructor(options: RazorpayOptions);
    
    orders: {
      create(options: OrderOptions): Promise<Order>;
      fetch(orderId: string): Promise<Order>;
      fetchPayments(orderId: string): Promise<{ entity: string; count: number; items: Payment[] }>;
    };
    
    payments: {
      fetch(paymentId: string, options?: Record<string, any>): Promise<Payment>;
      capture(paymentId: string, amount: number, currency: string): Promise<Payment>;
      createUpi(options: PaymentOptions): Promise<Payment>;
      createPaymentJson(options: PaymentOptions): Promise<Payment>;
      createRecurringPayment(options: PaymentOptions): Promise<Payment>;
      fetchPaymentMethods(): Promise<any>;
      all(options?: Record<string, any>): Promise<{ entity: string; count: number; items: Payment[] }>;
    };
    
    customers: {
      create(options: CustomerOptions): Promise<any>;
      fetch(customerId: string): Promise<any>;
      fetchTokens(customerId: string): Promise<any>;
      deleteToken(customerId: string, tokenId: string): Promise<any>;
    };
    
    subscriptions: {
      create(options: any): Promise<any>;
      fetch(subscriptionId: string): Promise<any>;
      cancel(subscriptionId: string, options?: any): Promise<any>;
      createRegistrationLink(options: any): Promise<any>;
    };
    
    invoices: {
      create(options: any): Promise<any>;
      fetch(invoiceId: string): Promise<any>;
      cancel(invoiceId: string): Promise<any>;
      notifyBy(invoiceId: string, medium: 'sms' | 'email'): Promise<any>;
    };
  }
} 