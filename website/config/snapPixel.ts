type SnapchatEvent =
  | "PAGE_VIEW"
  | "ADD_CART"
  | "START_CHECKOUT"
  | "ADD_BILLING"
  | "PURCHASE"
  | "LEVEL_COMPLETE";

interface SnapchatEventParams {
  currency?: string;
  price?: number;
  item_ids?: string[];
  description?: string;
  level?: number;
  user_email?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    snaptr?: (...args: any[]) => void;
  }
}

export const pageview = () => {
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    window.snaptr("track", "PAGE_VIEW");
  }
};

export const event = (
  name: SnapchatEvent,
  options: SnapchatEventParams = {}
) => {
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    window.snaptr("track", name, options);
  }
};

// Specific events
export const trackSnapAddToCart = (details: SnapchatEventParams) => {
  event("ADD_CART", details);
};

export const trackSnapCheckoutStart = (details: SnapchatEventParams) => {
  event("START_CHECKOUT", details);
};

export const trackSnapBilling = (details: SnapchatEventParams) => {
  event("ADD_BILLING", details);
};

export const trackSnapPurchase = (details: SnapchatEventParams) => {
  event("PURCHASE", details);
};

export const trackLevelComplete = (details: SnapchatEventParams) => {
  event("LEVEL_COMPLETE", details);
};
