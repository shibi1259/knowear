import { Dispatch, SetStateAction } from "react";
import { ProductCardProps, ProductCartProps } from "../productCard.types";

export interface SavedCard {
  cardNo: string;
  cardHolder: string;
  cardExpiry: string;
  cardType: string;
}

export interface User {
  name: string;
  email: string;
  mobile: string;
  countryCode: string;
  isEmailVerified: boolean;
  userid: string;
}

export interface Counts {
  cart: number;
  wishlist: number;
  total: string;
  deliveryFee: number;
}

export interface CartDetails {
  cart: any;
  products: Array<ProductCartProps>;
  summary: any;
  appliedCoupon?: { amount: string; coupon: string; value: string };
  state?:string;
  countryCode?:string;
}

export interface CountryCode {
  code: string;
  name: string;
}

export interface Addresses {}

export interface StateContextType {
  loggedIn: boolean;
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
  getUser: (login?: boolean) => Promise<User | null>;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  counts: Counts | null;
  setCounts: Dispatch<SetStateAction<any>>;
  coverImages: any[];
  redirect: any;
  wishlistDetails: any;
  getWishlistDetails: any;
  setRedirect: Dispatch<SetStateAction<any>>;
  refetchNotifications: number;
  setRefetchNotifications: Dispatch<SetStateAction<number>>;
  getCartDetails: () => Promise<CartDetails>;
  cartDetails: CartDetails;
  setCartDetails: Dispatch<SetStateAction<CartDetails>>;
  guestDetails: any;
  setGuestDetails: Dispatch<SetStateAction<any>>;
  address: any;
  getAddress: () => Promise<Addresses>;
  updateCounts: () => void;
  getGuestUser: () => Promise<any>;
}

export interface AddressFormInputs {
  type: string;
  name: string;
  firstlane: string;
  secondlane: string;
  city: string;
  area: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
  mobile: string;
  countryCode: string;
  country: string;
}
