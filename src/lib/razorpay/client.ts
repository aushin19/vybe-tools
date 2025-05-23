import Razorpay from 'razorpay';

// Initialize Razorpay with key (only for client-side when needed)
export const initRazorpay = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

// Server-side instance (for API routes)
export const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    key_secret: process.env.NEXT_PUBLIC_RAZORPAY_SECRET_KEY || '',
  });
}; 