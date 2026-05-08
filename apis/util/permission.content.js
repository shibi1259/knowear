
const types = {
  dashboard: 'Dashboard',
  category: "Category",
  brand: "Brand",
  order: "Order",
  collection: "Collection",
  offer: "Offer",
  reviews: "Reviews",
  coupons: "Coupons",
  loyalty: "Loyalty",
  referral: "Referral",
  giftWrap: "Gift Wrap",
  bannerImages: "Banner Images",
  moreOffers: "More Offers",
  blogs: "Blogs",
  catalogs: "Catalogs",
  vouchers: "Vouchers",
  banners: "Banners",
  notifications: "Notifications",
  storePopUp: "Store Pop Up",
  socialMedia: "Social Media",
  feeds: "Feeds",
  seoDetails: "SEO Details",
  mobileApps: "Mobile Apps",
  contacts: "Contacts",
  testimonials: "Testimonials",
  bulkUploads: "Bulk Uploads",
  taxRules: "Tax Rules",
  taxClasses: "Tax Classes",
  timeSlots: "Time Slots",
  stores: "Stores",
  mediaLibrary: "Media Library",
  reports: "Reports",
  helpCenter: "Help Center",
  aboutUs: "About Us",
  termsAndConditions: "Terms and Conditions",
  privacyPolicy: "Privacy Policy",
  paymentPolicy: "Payment Policy",
  serviceWarranty: "Service Warranty",
  shippingPolicy: "Shipping Policy",
  refundPolicy: "Refund Policy",
  navigation: "Navigation",
  storeSettings: "Store Settings",
  analytics: "Analytics",
  sitemap: "Sitemap",
  dynamicScripts: "Dynamic Scripts",
  invoiceSettings: "Invoice Settings",
  faq: "FAQ",
  activityLogs: "Activity Logs",
  mailerSubscriptions: "Mailer Subscriptions",
  deliverySlots: "Delivery Slots",
  shippingSettings: "Shipping Settings",
  shippingCharges: "Shipping Charges",
  customMailers: "Custom Mailers",
  paymentSettings: "Payment Settings",
  staticPages: "Static Pages",
  adminUsers: "Admin Users",
  roles: "Roles",
  newsletter: 'Newsletter',
  referralHistory: 'Referral History',
  customers: 'Customers',
  pageCovers: 'Page Covers',
  cart: 'Cart',
  enquires: 'Enquires',
};

exports.permissions = [
  {
    name: "Dashboard",
    tag: "dashboard",
    type: types.dashboard,
  },{
    name: 'Page Covers',
    tag: 'page-covers',
    type: types.pageCovers
  }, {
    name: 'Enquires',
    tag: 'enquires',
    type: types.enquires
  }, {
    name: 'Reviews',
    tag: 'reviews',
    type: types.reviews
  }, {
    name: 'Cart',
    tag: 'cart',
    type: types.cart
  }, {
    name: "View Category",
    tag: "category",
    type: types.category,
  },
  {
    name: "Add Category",
    tag: "add-category",
    type: types.category,
  },
  {
    name: "Update Category",
    tag: "update-category",
    type: types.category,
  },
  {
    name: "View Brand",
    tag: "brand",
    type: types.brand,
  },
  {
    name: "Add Brand",
    tag: "add-brand",
    type: types.brand,
  },
  {
    name: "Update Brand",
    tag: "update-brand",
    type: types.brand,
  },
  {
    name: "View Order",
    tag: "order",
    type: types.order,
  },
  {
    name: "Add Order",
    tag: "add-order",
    type: types.order,
  },
  {
    name: "Update Order",
    tag: "update-order",
    type: types.order,
  },
  {
    name: "View Collection",
    tag: "collection",
    type: types.collection,
  },
  {
    name: "Add Collection",
    tag: "add-collection",
    type: types.collection,
  },
  {
    name: "Update Collection",
    tag: "update-collection",
    type: types.collection,
  },
  {
    name: "View Offer",
    tag: "offer",
    type: types.offer,
  },
  {
    name: "Add Offer",
    tag: "add-offer",
    type: types.offer,
  },
  {
    name: "Update Offer",
    tag: "update-offer",
    type: types.offer,
  },
  {
    name: "View Coupon",
    tag: "coupons",
    type: types.coupons,
  },
  {
    name: "Add Coupon",
    tag: "add-coupons",
    type: types.coupons,
  },
  {
    name: "Update Coupon",
    tag: "update-coupons",
    type: types.coupons,
  },
  {
    name: "Loyalty",
    tag: "loyalty",
    type: types.loyalty,
  },
  {
    name: "Referral",
    tag: "referral",
    type: types.referral,
  }, {
    name: "Gift Wrap",
    tag: "gift-wrap",
    type: types.giftWrap,
  },
  {
    name: "Banner Images",
    tag: "banner-images",
    type: types.bannerImages,
  },
  {
    name: "View Blogs",
    tag: "blogs",
    type: types.blogs,
  },
  {
    name: "Add Blogs",
    tag: "add-blogs",
    type: types.blogs,
  },
  {
    name: "Update Blogs",
    tag: "update-blogs",
    type: types.blogs,
  },
  {
    name: "View Catalogs",
    tag: "catalogs",
    type: types.catalogs,
  },
  {
    name: "Add Catalogs",
    tag: "add-catalogs",
    type: types.catalogs,
  },
  {
    name: "View Vouchers",
    tag: "vouchers",
    type: types.vouchers,
  },
  {
    name: "Add Vouchers",
    tag: "add-vouchers",
    type: types.vouchers,
  },
  {
    name: "Update Vouchers",
    tag: "update-vouchers",
    type: types.vouchers,
  },
  {
    name: "View Notifications",
    tag: "notifications",
    type: types.notifications,
  },
  {
    name: "Add Notifications",
    tag: "add-notifications",
    type: types.notifications,
  },
  {
    name: "Update Notifications",
    tag: "update-notifications",
    type: types.notifications,
  },
  {
    name: "Store Popup",
    tag: "store-popup",
    type: types.storePopUp,
  },
  {
    name: "Feeds",
    tag: "feeds",
    type: types.feeds,
  },
  {
    name: "Help Center",
    tag: "help-center",
    type: types.helpCenter,
  },
  {
    name: "About Us",
    tag: "about-us",
    type: types.aboutUs,
  },
  {
    name: "Terms and Conditions",
    tag: "terms-and-conditions",
    type: types.termsAndConditions,
  },
  {
    name: "Privacy Policy",
    tag: "privacy-policy",
    type: types.privacyPolicy,
  },
  {
    name: "Payment Policy",
    tag: "payment-policy",
    type: types.paymentPolicy,
  },
  {
    name: "Service Warranty",
    tag: "service-warranty",
    type: types.serviceWarranty,
  },
  {
    name: "Shipping Policy",
    tag: "shipping-policy",
    type: types.shippingPolicy,
  },
  {
    name: "Refund Policy",
    tag: "refund-policy",
    type: types.refundPolicy,
  },
  {
    name: "Navigation",
    tag: "navigation",
    type: types.navigation,
  },
  {
    name: "Store Settings",
    tag: "store-settings",
    type: types.storeSettings,
  },
  {
    name: "Analytics",
    tag: "analytics",
    type: types.analytics,
  },
  {
    name: "Social Media",
    tag: "social-media",
    type: types.socialMedia,
  },
  {
    name: "Add Social Media",
    tag: "add-social-media",
    type: types.socialMedia,
  },
  {
    name: "Update Social Media",
    tag: "update-social-media",
    type: types.socialMedia,
  },
  {
    name: "Sitemap",
    tag: "sitemap",
    type: types.sitemap,
  },
  {
    name: "SEO Details",
    tag: "seo-details",
    type: types.seoDetails,
  }, {
    name: "Mobile Apps",
    tag: "mobile-apps",
    type: types.mobileApps,
  },
  {
    name: "Dynamic Scripts",
    tag: "dynamic-scripts",
    type: types.dynamicScripts,
  },
  {
    name: "View Contacts",
    tag: "contacts",
    type: types.contacts,
  },
  {
    name: "Add Contacts",
    tag: "add-contacts",
    type: types.contacts,
  },
  {
    name: "Update Contacts",
    tag: "update-contacts",
    type: types.contacts,
  },
  {
    name: "Invoice Settings",
    tag: "invoice-settings",
    type: types.invoiceSettings,
  }, {
    name: "FAQ",
    tag: "faq",
    type: types.faq,
  }, {
    name: "Add FAQ",
    tag: "add-faq",
    type: types.faq,
  }, {
    name: "Update FAQ",
    tag: "update-faq",
    type: types.faq,
  }, {
    name: "Activity Logs",
    tag: "activity-logs",
    type: types.activityLogs,
  }, {
    name: "Mailer Subscriptions",
    tag: "mailer-subscriptions",
    type: types.mailerSubscriptions,
  }, {
    name: "Delivery Slots",
    tag: "delivery-slots",
    type: types.deliverySlots,
  }, {
    name: "Newsletter",
    tag: "newsletter",
    type: types.newsletter
  }, {
    name: "Referral History",
    tag: "referral-history",
    type: types.referralHistory
  }, {
    name: "Shipping Settings",
    tag: "shipping-settings",
    type: types.shippingSettings,
  },
  {
    name: "View Shipping Charges",
    tag: "shipping-charges",
    type: types.shippingCharges,
  },
  {
    name: "Add Shipping Charges",
    tag: "add-shipping-charges",
    type: types.shippingCharges,
  },
  {
    name: "View Testimonials",
    tag: "testimonials",
    type: types.testimonials,
  }, {
    name: "Add Testimonials",
    tag: "add-testimonials",
    type: types.testimonials,
  }, {
    name: "Update Testimonials",
    tag: "update-testimonials",
    type: types.testimonials,
  },
  {
    name: "Custom Mailers",
    tag: "custom-mailers",
    type: types.customMailers,
  },
  {
    name: "View Bulk Uploads",
    tag: "bulk-uploads",
    type: types.bulkUploads,
  }, {
    name: "View Tax Rules",
    tag: "tax-rules",
    type: types.taxRules,
  }, {
    name: "Add Tax Rules",
    tag: "add-tax-rules",
    type: types.taxRules,
  }, {
    name: "Update Tax Rules",
    tag: "update-tax-rules",
    type: types.taxRules,
  }, {
    name: "Delete Tax Rules",
    tag: "delete-tax-rules",
    type: types.taxRules,
  }, {
    name: "View Tax Classes",
    tag: "tax-classes",
    type: types.taxClasses,
  }, {
    name: "Add Tax Classes",
    tag: "add-tax-classes",
    type: types.taxClasses,
  },
  {
    name: "Update Tax Classes",
    tag: "update-tax-classes",
    type: types.taxClasses,
  },
  {
    name: "Delete Tax Classes",
    tag: "delete-tax-classes",
    type: types.taxClasses,
  },
  //Click and collect
  {
    name: "View Time Slots",
    tag: "time-slots",
    type: types.timeSlots,
  },
  {
    name: "Add Time Slots",
    tag: "add-time-slots",
    type: types.timeSlots,
  },

  {
    name: "View Stores",
    tag: "stores",
    type: types.stores,
  }, {
    name: "Add Stores",
    tag: "add-stores",
    type: types.stores,
  }, {
    name: "Update Stores",
    tag: "update-stores",
    type: types.stores,
  }, {
    name: "Reports",
    tag: "reports",
    type: types.reports,
  }, {
    name: "Payment Settings",
    tag: "payment-settings",
    type: types.paymentSettings,
  }, {
    name: "Static Pages",
    tag: "static-pages",
    type: types.staticPages,
  }, {
    name: "Add Static Pages",
    tag: "add-staticpages",
    type: types.staticPages,
  }, {
    name: "Update Static Pages",
    tag: "update-staticpages",
    type: types.staticPages,
  }, {
    name: "Admin Users",
    tag: "admin-users",
    type: types.adminUsers,
  }, {
    name: "Add Admin Users",
    tag: "add-adminusers",
    type: types.adminUsers,
  }, {
    name: "Update Admin Users",
    tag: "update-adminusers",
    type: types.adminUsers,
  }, {
    name: 'Media Library',
    tag: 'media-library',
    type: types.mediaLibrary
  }, {
    name: 'Roles',
    tag: 'roles',
    type: types.roles
  }, {
    name: 'Add Roles',
    tag: 'add-roles',
    type: types.roles
  }, {
    name: 'Update Roles',
    tag: 'update-roles',
    type: types.roles
  }, {
    name: 'Customers',
    tag: 'customers',
    type: types.customers
  }, {
    name: 'Add customers',
    tag: 'add-customers',
    type: types.customers
  }, {
    name: 'Update customers',
    tag: 'update-customers',
    type: types.customers
  }
];