export interface Category {
    name: string;
    slug: string;
  }
  
  export interface StoreFacility {
    name: string;
    description: string;
    icon: string;
  }
  
  export interface Links {
    isDelete: boolean;
    isActive: boolean;
    _id: string;
    facebook: string;
    whatsapp: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    twitter: string;
    behance: string;
    tiktok: string;
    appStore: string;
    googlePlay: string;
    refid: string;
    __v: number;
    pinterest: string;
  }
  
  export interface Data {
    categories: Category[];
    details: Record<string, unknown>;
    links: Links;
    description: string;
    storeFacilities: StoreFacility[];
    seoContent: string;
  }