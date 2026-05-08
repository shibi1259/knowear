import { StaticImageData } from "next/image";

interface ThemeColors {
  primary: string;
  secondary: string;
  star: string;
  label: string;
  text: string;
}

interface ToastColors {
  success: string;
  error: string;
  info: string;
}

interface Fonts {
  family: string;
  fontsize: number;
}

interface Buttons {
  cart: string;
  stock: string;
  notify: string;
}

export interface ThemeContextType {
  defaultImage: string;
  currency: string;
  itemsPerPage: number;
  logo?: StaticImageData;
  favicon: string;
  menuType: string;
  headerTexts: Array<{ text: string, link: string }>;
  isNotifyStock: boolean;
  buttons: Buttons;
  isShippingSlotsEnabled: boolean;
  futureDays: number;
  isStoreLive: boolean;
  description: string;
  announcement: string;
  isReferralEnabled: boolean;
  isWalletEnabled: boolean;
  isReviewEnabled: boolean;
  isOtpLogin: boolean;
  isPickUp: boolean;
  primaryLang?: string;
  isGuestCheckout: boolean;
  isCurrentLocation: boolean;
  isSearchLocation: boolean;
  isPasswordLogin: boolean;
  isFacebookLogin: boolean;
  isOtpForGuestCheckout: boolean;
  isGoogleLogin: boolean;
  isDeliverySlots: boolean;
  isEmirateDeliverySlots: boolean;
  facebookLogin: {
    text: string;
    clientId: string;
    clientSecret: string;
  };
  googleLogin: {
    text: string;
    clientId: string;
    clientSecret: string;
  };
}