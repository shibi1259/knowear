import { ThemeContextType } from "@/types/providers";
import { createContext } from "react";

export const initialThemeData = {
  defaultImage: "",
  currency: "AED",
  itemsPerPage: 20,
  favicon: "",
  menuType: "4",
  headerTexts: [{ text: '', link: '' }],
  isNotifyStock: false,
  buttons: {
    cart: "Add to Cart",
    stock: "Out of Stock",
    notify: "Notify"
  },
  isShippingSlotsEnabled: false,
  futureDays: 3,
  isStoreLive: true,
  description: "",
  announcement: "",
  isReferralEnabled: false,
  isWalletEnabled: false,
  isReviewEnabled: false,
  isPickUp: false,
  isCurrentLocation: false,
  isSearchLocation: false,
  isOtpLogin: false,
  isDeliverySlots: false,
  isOtpForGuestCheckout: false,
  isEmirateDeliverySlots: false,
  isGuestCheckout: false,
  isPasswordLogin: false,
  isFacebookLogin: false,
  isGoogleLogin: false,
  facebookLogin: {
    text: '',
    clientId: '',
    clientSecret: ''
  },
  googleLogin: {
    text: '',
    clientId: '',
    clientSecret: ''
  }
};

export const ThemeContext = createContext<ThemeContextType>(initialThemeData);