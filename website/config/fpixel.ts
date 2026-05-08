// types/facebook-pixel.d.ts
interface FacebookPixelEvents {
  (...args: any[]): void;
  callMethod?: Function;
  queue?: any[];
}

declare global {
  interface Window {
    fbq?: FacebookPixelEvents;
    _fbq?: FacebookPixelEvents;
  }
}

type FacebookEventName =
  | "PageView"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "AddPaymentInfo"
  | "ViewContent";

// Define base event parameters interface
interface FacebookEventOptions {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    price?: number;
  }>;
  [key: string]: any; // Allow other custom parameters
}

// Track pageview
export const pageview = () => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    // window.fbq("track", "PageView");
  }
};

export const event = (name: FacebookEventName, options: FacebookEventOptions = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    // Check if options has any values
    const hasOptions = options && Object.keys(options).length > 0;
    if(hasOptions) {
      window.fbq('track', name, options);
    } else {
      window.fbq('track', name);
    }
  }
};

export const trackProductView = (productDetails: any) => {
  event("ViewContent", productDetails);
  console.log(
    "--FB------product details--------EVENT TRIGGER--------------------"
  );
};
export const trackAddToCart = (productDetails: any) => {
  event("AddToCart");
  console.log("--FB------add to cart--------EVENT TRIGGER--------------------");
};

export const trackCheckout = (checkoutDetails: any) => {
  event("InitiateCheckout");
  console.log("--FB-----checkout--------EVENT TRIGGER--------------------");
};

export const trackPaymentInfo = (paymentInfoDetails: any) => {
  event("AddPaymentInfo", paymentInfoDetails);
  console.log("--FB------add payment info--------EVENT TRIGGER--------------------");
};

export const trackPurchase = (purchaseDetails: any) => {
  let currency = 'AED', _price = 0.00;

  if(purchaseDetails) {
    let price = purchaseDetails?.orderPrice?.wholetotal?.text ?? '0.00';
    _price = parseFloat(price.replace(/[^\d.]/g, ''));
  }

  event("Purchase", {value: _price, currency: currency});

  // Purchase should trigger both checkout and payment
  trackPaymentInfo(purchaseDetails?.paymentMethod); // Trigger AddPaymentInfo on purchase
  console.log("--FB------Purchase--------EVENT TRIGGER--------------------");
};

export const trackPurchased = (purchasedDetails: any) => {
  console.log("--FB------Purchased--------EVENT TRIGGER--------------------");
};
