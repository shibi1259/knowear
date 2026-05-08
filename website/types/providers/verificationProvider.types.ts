import { User } from "./";

interface CountryCode {
    value: string;
    label: string;
  }
  
  export interface PhoneNumber {
    mobile: string;
    countryCode: string;
  }

  
  export interface VerificationContextType {
    verificationData: any | null;
    setVerification: (data: any) => void;
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    phoneNumber: PhoneNumber;
    setPhoneNumber: React.Dispatch<React.SetStateAction<PhoneNumber>>;
    getOtpPromise: (mobile: string, countryCode: string, phone: string) => Promise<any>;
    resendOtp: (countryCode: string, mobile: string) => Promise<any>;
    countryCode: CountryCode[];
    referalCode: string;
    setReferalCode: React.Dispatch<React.SetStateAction<string>>;
  }
  
  export interface VerificationProviderProps {
    children: React.ReactNode;
  }