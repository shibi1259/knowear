module.exports = {
    successResponse: { error_code: 0, error_message: 'Success' },
    serverError: { error_code: 90, error_message: 'Something went wrong' },
    importStarted: {error_code: 0, error_message: 'Import started successfully'},
    INTERNAL_serverError: { error_code: 500, error_message: 'Internal Server Error' },
    PAYMENT_METHOD: { error_code: 1, error_message: 'Invalid payment method' },
    PAYMENT_ERROR: { error_code: 1, error_message: "Unable to complete this payment" },
    UNABLE_TO_EDIT: { error_code: 1, error_message: "Unable to update the profile" },
    VALIDATION_ERROR: { error_code: 100, error_message: 'Validation Error' },
    ID_REQUIRED: { error_code: 100, error_message: 'Id is required' },
    NO_USER_FOUND: { error_code: 404, error_message: "We couldn't find your account" },
    UNMATCHED_MOBILE: { error_code: 101, error_message: 'Mobile number unmatched' },
    UUID_NOT_FOUND: { error_code: 101, error_message: 'Uuid not found' },
    FAILED_TO_CREATE_USER: { error_code: 101, error_message: 'Failed to create user' },

    APPLICATION_SUBMITTED: { error_code: 0, error_message: 'Application submitted successfully' },


    CUSTOMER_DETAILS_EXISTS: { error_code: 1, error_message: 'Email address / Phone No. already exists' },
    CUSTOMER_UPDATED: { error_code: 0, error_message: 'Customer details updated successfully' },
    CUSTOMER_NOT_FOUND: { error_code: 1, error_message: 'Customer not found' },
    CUSTOMER_DELETED: { error_code: 0, error_message: 'Customer deleted successfully' },
    

    //Product enquiry messages
    PRODUCT_ENQUIRY_SUBMITTED: { error_code: 0, error_message: 'Product Enquiry Submitted Successfully' },
    PRODUCT_ENQUIRY_LIST: { error_code: 0, error_message: 'Product Enquiry List Retrieved Successfully' },

    TOKEN_REQUIRED: { error_code: 404, error_message: 'Token Required. Authentication failed' },
    INVALID_TOKEN: { error_code: 401, error_message: 'Invalid Token. Authentication failed' },
    NO_PERMISSION: { error_code: 404, error_message: 'You dont have the permission to perform this operation. Authorization failed' },
    INVALID_USER: { error_code: 101, error_message: 'Login Failed: Invalid Username or Password' },
    FAILED_LOGOUT: { error_code: 101, error_message: 'Failed to logout' },
    ALREADY_REGISTERED: { error_code: 101, error_message: 'Account has already registered' },
    REGISTERED_SUCCESSFULLY: { error_code: 0, error_message: 'Registered successfully' },
    INACTIVE_USER: { error_code: 101, error_message: 'Account has been deactivated or deleted. Please contact support team' },
    ALREADY_LOGGEDOUT: { error_code: 101, error_message: 'User Already Logged Off' },
    USER_LOGGEDOUT: { error_code: 0, error_message: "User hasn't logged in any device" },
    MAIL_NOT_SENT: { error_code: 1, error_message: "Couldn't send email, kindly try again" },


    //Otp messages
    OTP_SENT: { error_code: 0, error_message: 'OTP sent successfully' },
    OTP_NOT_SENT: { error_code: 1, error_message: "Couldn't send OTP, kindly try again" },
    INVALID_OTP: { error_code: 1, error_message: 'Invalid OTP' },
    INVALID_REFERRAL_CODE: { error_code: 1, error_message: 'Invalid referral code' },
    VALID_REFERRAL_CODE: { error_code: 0, error_message: 'Valid referral code' },
    //Otp messages

    //Verification messages
    VERIFICATION_TOKEN_EXPIRED: { error_code: 1, error_message: "Verification link got expired. Please try again." },
    INVALID_VERIFICATION_TOKEN: { error_code: 1, error_message: "Invalid verification link. Please try again." },
    EMAIL_VERIFIED: { error_code: 0, error_message: 'Email address successfully' },
    RESET_PASSWORD_EMAIL_SENT: { error_code: 0, error_message: 'Reset password link has been successfully shared to email address' },
    EMAIL_SENT: { error_code: 0, error_message: 'Verification link has been successfully shared to email address' },
    RESET_PASSWORD_EMAIL_SENT_FAILED: { error_code: 1, error_message: 'Reset password link sharing failed' },
    NO_ACCOUNT_FOUND: { error_code: 1, error_message: 'No account found with this email address' },
    PAGE_LINK_EXPIRED: { error_code: 1, error_message: 'Sorry, this link got expired. Go back to login and get a new reset link' },
    PAYMENT_SUCCESS: { error_code: 0, error_message: 'Payment success' },
    PAYMENT_FAILED: { error_code: 1, error_message: 'Payment failed' },
    //Verification messages

    //Password messages
    INCORRECT_PASSWORD: { error_code: 1, error_message: "Incorrect password" },
    PASSWORD_CHANGE_SUCCESS: { error_code: 0, error_message: "Password changed successfully" },
    //Password messages

    //General messages
    DUPLICATE_EMAIL: { error_code: 1, error_message: 'This email cannot be used at this time' },
    EMAIL_UPDATED: { error_code: 0, error_message: 'Email updated successfully' },
    DUPLICATE_MOBILE: { error_code: 1, error_message: 'This mobile number cannot be used at this time' },
    MOBILE_UPDATED: { error_code: 0, error_message: 'Mobile number updated successfully' },
    //General messages

    //Date messages
    LONG_DATE_RANGE: { error_code: 1, error_message: 'The selected date range is too large. Please select a shorter range.' },
    //Date messages

    ALREADY_DELETED: { error_code: 101, error_message: 'This has been already deleted' },
    VALID_DATE: { error_code: 1, error_message: 'From date and end date is required' },
    INVALID_FROM_DATE: { error_code: 1, error_message: 'From date is lesser than current date' },
    INVALID_TIME: { error_code: 1, error_message: 'Scheduled time is lesser than current time' },
    INVALID_TO_DATE: { error_code: 1, error_message: 'To date is lesser than current date or from date' },
    LAYOUT_SUCCESS: { error_code: 0, error_message: 'Layout added successfully' },
    LAYOUT_UPDATE: { error_code: 0, error_message: ' Layout updated successfully' },

    //Notification management
    NOTIFICATION_CREATED: { error_code: 0, error_message: 'Notification created successfully' },
    NOTIFICATION_UPDATED: { error_code: 0, error_message: 'Notification updated successfully' },
    NOTIFICATION_FAILURE: { error_code: 1, error_message: 'Notification creation failed' },
    NOTIFICATION_UNSENT: { error_code: 1, error_message: 'Notification was not sent' },
    NOTIFICATION_DELETED: { error_code: 0, error_message: 'Notification deleted successfully' },
    //Notification management

    PAYMENT_DETAILS_UPDATED: { error_code: 0, error_message: 'Payment details updated successfully' },
    CUSTOMER_REQUIRED: { error_code: 1, error_message: 'Atleast one user should be selected' },
    BRAND_SUCCESS: { error_code: 0, error_message: 'Brand added successfully' },
    BRAND_BULK_SUCCESS: { error_code: 0, error_message: 'Brand bulk upload completed' },
    BRAND_UPDATE: { error_code: 0, error_message: 'Brand updated successfully' },
    BRAND_NOT_DELETE: { error_code: 1, error_message: "This operation got rejected" },
    BRAND_DELETE: { error_code: 0, error_message: 'Brand archived or inactive successfully' },
    CATEGORY_SUCCESS: { error_code: 0, error_message: 'Category added successfully' },
    CATEGORY_BULK_SUCCESS: { error_code: 0, error_message: 'Category bulk upload completed' },
    CATEGORY_UPDATE: { error_code: 0, error_message: ' Category updated successfully' },
    CATEGORY_NOT_DELETE: { error_code: 1, error_message: "Oh! This operation got rejected" },
    CATEGORY_DELETE: { error_code: 0, error_message: 'Category archived or inactive successfully' },
    PPRODUCT_BULK_SUCCESS: { error_code: 0, error_message: 'Product bulk upload completed' },
    PRODUCT_UPDATE: { error_code: 0, error_message: 'Product updated successfully' },
    PRODUCT_ADDED: { error_code: 0, error_message: 'Product added successfully' },

    PRODUCT_ACTION_FAILED: { error_code: 1, error_message: "This product belongs to a collection" },

    PRODUCT_TAGS: { error_code: 0, error_message: 'Product tags updated successfully' },

    PRODUCT_DELETE: { error_code: 0, error_message: 'Product archived or inactive successfully' },
    THUMBNAIL_IMAGE: { error_code: 1, error_message: 'Product thumbnail image is required' },
    PRODUCT_IMAGES: { error_code: 1, error_message: 'Product images are required' },
    PRODUCT_VIDEO_UPLOADED: { error_code: 0, error_message: 'Product video uploaded successfully' },
    PRODUCT_COVER_UPLOADED: { error_code: 0, error_message: 'Product cover uploaded successfully' },
    PRODUCT_COVER_REMOVED: { error_code: 0, error_message: 'Product cover removed successfully' },
    PRODUCT_VIDEO_REMOVED: { error_code: 0, error_message: 'Product video removed successfully' },
    PRODUCT_IMAGE_REMOVED: { error_code: 0, error_message: 'Product video removed successfully' },
    PRODUCT_THUMBNAIL: { error_code: 0, error_message: 'Product thumbnail updated successfully' },

    COLLECTION_SUCCESS: { error_code: 0, error_message: 'Collection added successfully' },
    COLLECTION_FAILED: { error_code: 1, error_message: 'Collection image / products is required' },
    COLLECTION_UPDATE: { error_code: 0, error_message: 'Collection updated successfully' },
    COLLECTION_NOT_DELETE: { error_code: 1, error_message: "This operation got rejected" },
    COLLECTION_BULK_SUCCESS: { error_code: 0, error_message: 'Collection bulk upload completed' },
    COLLECTION_DELETE: { error_code: 0, error_message: 'Collection archived or inactive successfully' },

    COUPON_COUNT: { error_code: 1, error_message: "Coupon count should be atleast 1. Current count is 0" },
    BANNER_SUCCESS: { error_code: 0, error_message: 'Banner added successfully' },
    BANNER_UPDATE: { error_code: 0, error_message: ' Banner updated successfully' },
    BANNER_NOT_DELETE: { error_code: 1, error_message: "Oh! This operation got rejected" },
    BANNER_DELETE: { error_code: 0, error_message: 'Banner archived or inactive successfully' },
    LAYOUT_SUCCESS: { error_code: 0, error_message: 'Layout added successfully' },
    LAYOUT_UPDATE: { error_code: 0, error_message: ' Layout updated successfully' },
    LAYOUT_NOT_DELETE: { error_code: 1, error_message: "Oh! This operation got rejected" },
    LAYOUT_DELETE: { error_code: 0, error_message: 'Layout archived or inactive successfully' },
    LAYOUT_IMAGE: { error_code: 1, error_message: 'Atleast one image should be uploaded' },
    OFFER_SUCCESS: { error_code: 0, error_message: 'Offer added successfully' },
    OFFER_NOT_FOUND : { error_code: 1, error_message: 'Offer not found' },
    OFFER_UPDATE: { error_code: 0, error_message: ' Offer updated successfully' },
    OFFER_NOT_DELETE: { error_code: 1, error_message: "Oh! This operation got rejected" },
    OFFER_DELETE: { error_code: 0, error_message: 'Offer archived or inactive successfully' },
    TRANSACTIONID_REQUIRED: { error_code: 1, error_message: 'Transaction ID is required' },

    ORDERID_REQUIRED: { error_code: 1, error_message: 'Order ID is required' },
    ORDER_PAYMENT_ACCEPTED: { error_code: 0, error_message: 'Order payment accepted successfully' },
    ORDER_PLACED: { error_code: 0, error_message: 'Order placed successfully' },
    ORDER_UPDATED: { error_code: 0, error_message: 'Order updated successfully' },
    PAYMENT_STATUS: { error_code: 0, error_message: 'Payment status updated successfully' },
    SELECT_PAYMENT_METHOD: { error_code: 1, error_message: 'Please select a payment method' },
    ORDER_CANCELLED: { error_code: 0, error_message: 'Order cancelled successfully' },
    ORDER_STATUS_UPDATED: { error_code: 0, error_message: 'Order status updated successfully' },
    UNABLE_TO_PLACE_ORDER: { error_code: 1, error_message: "Couldn't place order this time, kindly try again after sometime" },
    UNABLE_TO_VERIFY: { error_code: 1, error_message: "Sorry, we couln't verify your payment" },
    ORDER_REPLACED: { error_code: 0, error_message: 'Order replaced successfully' },
    ORDER_REPLACE_UPDATED: { error_code: 0, error_message: 'Order replace updated successfully' },
    ORDER_REPLACE_INITIATED: { error_code: 0, error_message: 'Order replace initiated successfully' },
    ORDER_STATUS_ALREADY_UPDATED: { error_code: 1, error_message: 'Order status is up to date' },
    SERVER_ERROR: { error_code: 90, error_message: 'Something went wrong' },

    PRODUCT_NOT_FOUND: { error_code: 1, error_message: 'Product not found' },
    PRODUCT_REMOVED: { error_code: 0, error_message: 'Product removed from cart' },
    QUANTITY_REQUIRED: { error_code: 1, error_message: 'Quantity required' },
    PRODUCT_ALREADY_PRESENT: { error_code: 1, error_message: 'Product already present' },
    PRODUCT_WISHLISTED: { error_code: 0, error_message: 'Product added to favourites' },
    PRODUCT_WISHLISTED_REMOVE: { error_code: 0, error_message: 'Product removed from favourites' },
    PRODUCT_ALREADY_WISHLISTED: { error_code: 1, error_message: 'Product already in favourites' },
    PRODUCT_NOT_WISHLISTED: { error_code: 1, error_message: 'Product not in favourites' },
    ADDRESS_ADDED: { error_code: 0, error_message: 'New address added successfully' },
    ADDRESS_UPDATED: { error_code: 0, error_message: 'Address updated successfully' },
    ADDRESS_DELETED: { error_code: 0, error_message: 'Address deleted successfully' },






    SHIPPING_PARTNERS_ADDED: { error_code: 0, error_message: 'Shipping partner added successfully' },
    SHIPPING_PARTNERS_UPDATED: { error_code: 0, error_message: 'Shipping partner updated successfully' },

    ORDER_ALREADY_CREATED: { error_code: 1, error_message: 'Order already created' },
    ORDER_UPDATED: { error_code: 0, error_message: 'Order updated successfully' },
    
    ORDER_NOT_FOUND: { error_code: 1, error_message: 'Order not found' },
    DASHBOARD_UPDATE: { error_code: 0, error_message: 'Dashboard settings updated' },
    CANNNOT_DELETE_ADDRESS: { error_code: 1, error_message: 'Cannot delete address. Add more address' },
    DELETE_ADDRESS: { error_code: 0, error_message: 'Address deleted' },

    SETTINGS_UPDATED: { error_code: 0, error_message: 'Settings updated successfully' },
    ADDRESS_CHANGED: { error_code: 0, error_message: 'Delivery address updated' },

    PRIVACY_POLICY_ADDED: { error_code: 0, error_message: 'Privacy policy added successfully' },
    PRIVACY_POLICY_UPDATED: { error_code: 0, error_message: 'Privacy policy updated successfully' },
    TERMS_ADDED: { error_code: 0, error_message: 'Terms and conditions added successfully' },
    TERMS_UPDATED: { error_code: 0, error_message: 'Terms and conditions updated successfully' },
    ABOUT_ADDED: { error_code: 0, error_message: 'About added successfully' },
    ABOUT_UPDATED: { error_code: 0, error_message: 'About updated successfully' },
    SEO_ADDED: { error_code: 0, error_message: 'SEO details added successfully' },
    DUPLICATE_SEO: { error_code: 1, error_message: 'SEO details already exists' },
    UNABLE_TO_ADD_SEO: {error_code: 1, error_message: 'Unable to add SEO details'},
    SEO_UPDATED: { error_code: 0, error_message: 'SEO details updated successfully' },
    ENQUIRY_SUBMIT: { error_code: 0, error_message: 'Enquiry submitted successfully' },

    //Order messages
    ORDER_CANCELLED: { error_code: 0, error_message: 'Order cancelled successfully' },
    ORDER_CANNOT_CANCELLED: { error_code: 0, error_message: 'Order cannot be successfully' },
    ORDER_FAILED: { error_code: 1, error_message: 'Sorry we are not able process your order at this time' },
    NO_ORDERS: { error_code: 0, error_message: 'No orders' },
    ORDER_404: { error_code: 1, error_message: 'Order not found' },
    ORDER_TAG_UPDATED: { error_code: 0, error_message: 'Order tag updated successfully' },
    //Order messages

    //Coupons
    COUPON_APPLIED: { error_code: 0, error_message: 'Coupon applied successfully' },
    COUPON_REMOVED: { error_code: 0, error_message: 'Coupon removed successfully' },
    COUPON_ADD: { error_code: 0, error_message: 'Coupon added successfully' },
    COUPON_UPDATE: { error_code: 0, error_message: ' Coupon updated successfully' },
    CANNOT_APPLY_COUPON: { error_code: 1, error_message: "This coupon can't be applied" },
    CANNOT_PROCEED_COUPON: { error_code: 1, error_message: "We cannot proceed with this coupon code" },
    COUPON_NOT_DELETE: { error_code: 1, error_message: "Oh! This operation got rejected" },
    COUPON_DELETE: { error_code: 0, error_message: 'Coupon archived or inactive successfully' },
    COUPON_NOT_FOUND: { error_code: 1, error_message: "Couldn't find coupon" },
    COUPON_EXISTS: { error_code: 1, error_message: 'Coupon has been already applied' },
    COUPON_FAILURE: { error_code: 1, error_message: "Categories, products, collections are required fields" },
    //Coupons

    //Product head messages
    PRODUCT_HEAD_ADD: { error_code: 0, error_message: 'Product head added successfully' },
    //Product head messages

    //Store and Time slot management
    STORE_ADD: { error_code: 0, error_message: 'Store added successfully' },
    STORE_UPDATE: { error_code: 0, error_message: 'Store updated successfully' },
    TIME_ADD: { error_code: 0, error_message: 'Time slot added successfully' },
    TIME_UPDATE: { error_code: 0, error_message: 'Time slot updated successfully' },
    TIME_FAILED: { error_code: 1, error_message: "This operation can't be performed, time slot updated failed" },
    //Store management

    //Cart management
    ADDED_TO_CART: { error_code: 0, error_message: 'Product added to cart' },
    CART_CLEARED: { error_code: 0, error_message: 'Cart cleared successfully' },
    REMOVED_FROM_CART: { error_code: 0, error_message: 'Product removed from cart' },
    CART_NOT_FOUND: { error_code: 1, error_message: "Unable to find cart" },
    NOTIFICATION_SENT: { error_code: 0, error_message: "Notification sent successfully" },
    GIFT_PRODUCT_MARKED: { error_code: 0, error_message: "Product has been updated as gift successfully" },
    LIMITED_STOCK: { error_code: 1, error_message: 'The product is available in limited quantities' },
    MAXIMUM_STOCK: { error_code: 1, error_message: 'The maximum quantity has been reached.' },
    MINIMUM_STOCK: { error_code: 1, error_message: 'A minimum quantity is necessary.' },
    CART_UPDATED: { error_code: 0, error_message: 'Cart updated successfully' },
    EMPTY_CART: { error_code: 0, error_message: 'Empty cart' },
    //Cart management

    //User management
    USER_UPDATED: { error_code: 0, error_message: 'Details updated successfully' },
    LOGOUT_SUCCESS: { error_code: 0, error_message: 'Logged out successfully' },
    EMAIL_EXIST: { error_code: 1, error_message: 'Email already exists' },
    //User management

    //Review management
    ADD_REVIWEW: { error_code: 0, error_message: 'Details updated successfully' },
    USER_REVIEW: { error_code: 0, error_message: 'Review added successfully' },
    UPDATE_REVIEW: { error_code: 0, error_message: 'Review updated successfully' },
    //Review management

    //Apps management
    ADD_APPS: { error_code: 0, error_message: 'Details updated successfully' },
    UPDATE_APPS: { error_code: 0, error_message: 'Review updated successfully' },
    APP_ICON: { error_code: 0, error_message: 'App icon updated successfully' },
    SPLASH_ICON: { error_code: 0, error_message: 'Splash icon updated successfully' },
    //Apps management

    //Address management
    ADD_ADDRESS: { error_code: 0, error_message: 'Address added successfully' },
    UPDATE_ADDRESS: { error_code: 0, error_message: 'Address updated successfully' },
    DEFAULT_ADDRESS_UPDATED: { error_code: 0, error_message: 'Default address updated successfully' },
    //Address management

    //Attributes management
    ADD_ATTRIBUTE: { error_code: 0, error_message: 'Attribute added successfully' },
    UPDATE_ATTRIBUTE: { error_code: 0, error_message: 'Attribute updated successfully' },
    //Attributes management

    //Admin management
    ADD_ADMIN: { error_code: 0, error_message: 'Admin created successfully' },
    UPDATE_ADMIN: { error_code: 0, error_message: 'Admin updated successfully' },
    DELETE_ADMIN: { error_code: 0, error_message: 'Admin deleted successfully' },
    //Admin management

    //Role management
    ADD_ROLE: { error_code: 0, error_message: 'Role added successfully' },
    UPDATE_ROLE: { error_code: 0, error_message: 'Role updated successfully' },
    FAILED_ROLE_UPDATE: { error_code: 1, error_message: 'Admin users exist with this role, unable to inactive' },
    //Role management

    //Permission management
    ADD_PERMISSION: { error_code: 0, error_message: 'Permission added successfully' },
    UPDATE_PERMISSION: { error_code: 0, error_message: 'Permission updated successfully' },
    //Permission management

    //Contact management
    ADD_CONTACT: { error_code: 0, error_message: 'Contact added successfully' },
    UPDATE_CONTACT: { error_code: 0, error_message: 'Contact updated successfully' },
    //Contact management

    //Script management
    ADD_SCRIPT: { error_code: 0, error_message: 'Script added successfully' },
    UPDATE_SCRIPT: { error_code: 0, error_message: 'Script updated successfully' },
    //Script management

    //Analytics management
    ADD_ANALYTICS: { error_code: 0, error_message: 'Analytics added successfully' },
    UPDATE_ANALYTICS: { error_code: 0, error_message: 'Analytics updated successfully' },
    //Analytics management

    //Attribute management
    ADD_ATTRIBUTE: { error_code: 0, error_message: 'Attribute added successfully' },
    UPDATE_ATTRIBUTE: { error_code: 0, error_message: 'Attribute updated successfully' },
    DELETE_ATTRIBUTE: { error_code: 0, error_message: 'Attribute deleted successfully' },
    //Attribute management

    //Product management
    DUPLICATE_SKU: { error_code: 1, error_message: 'Duplicate SKU' },
    //Product management

    //Tax rule management
    UPDATE_TAXRULE: { error_code: 0, error_message: 'Tax rule updated successfully' },
    ADD_TAXRULE: { error_code: 0, error_message: 'Tax rule updated successfully' },
    ERROR_TAXRULE: { error_code: 1, error_message: 'Unable to update tax rule' },
    RULE_DELETE_FAILED: { error_code: 1, error_message: 'This rule cannot be deleted' },
    RULE_DELETED: { error_code: 0, error_message: 'Tax rule deleted successfully' },
    RULE_EXISTS: { error_code: 1, error_message: 'Tax rule already exists with this name' },
    //Tax rule management

    //Tax class management
    UPDATE_TAXCLASS: { error_code: 0, error_message: 'Tax class updated successfully' },
    ADD_TAXCLASS: { error_code: 0, error_message: 'Tax class added successfully' },
    ERROR_TAXCLASS: { error_code: 1, error_message: 'Unable to update tax class' },
    CLASS_DELETE_FAILED: { error_code: 1, error_message: 'This class cannot be deleted' },
    CLASS_DELETED: { error_code: 0, error_message: 'Tax class deleted successfully' },
    //Tax class management

    //File management
    FILE_ERROR: { error_code: 0, error_message: 'File error occured. Kindly retry after sometime' },
    FILE_DOWNLOAD_SUCCESS: { error_code: 0, error_message: 'File downloaded successfully' },
    FILE_UPLOAD_SUCCESS: { error_code: 0, error_message: 'File uploaded successfully' },
    FILE_UPLOAD_FAILED: { error_code: 1, error_message: 'File upload failed' },
    //File management

    //Feed management
    ADD_FEED: { error_code: 0, error_message: 'Feed added successfully' },
    UPDATE_FEED: { error_code: 0, error_message: 'Feed updated successfully' },
    //Feed management

    //Voucher management
    ADD_VOUCHER: { error_code: 0, error_message: 'Voucher added successfully' },
    UPDATE_VOUCHER: { error_code: 0, error_message: 'Voucher updated successfully' },
    DELETE_VOUCHER: { error_code: 0, error_message: 'Voucher deleted successfully' },
    INVALID_VOUCHER: { error_code: 0, error_message: 'The voucher code you entered is not valid or has expired' },
    VOUCHER_REDEEMED: { error_code: 0, error_message: 'Voucher redeemed successfully' },
    PURCHASE_VOUCHER: { error_code: 0, error_message: 'Voucher purchased successfully' },
    //Voucher management

    //Feed management
    ADD_FEED: { error_code: 0, error_message: 'Feed added successfully' },
    UPDATE_FEED: { error_code: 0, error_message: 'Feed updated successfully' },
    //Feed management

    //Menu management
    ADD_MENU: { error_code: 0, error_message: 'Menu added successfully' },
    UPDATE_MENU: { error_code: 0, error_message: 'Menu updated successfully' },
    MENU_REARRANGED: { error_code: 0, error_message: 'Menu rearranged successfully' },
    //Menu management

    //Notification management
    SUBSCRIBED: { error_code: 0, error_message: 'Subscribed successfully' },
    SUBSCRIBER_DELETED: { error_code: 0, error_message: 'Subscribed deleted successfully' },
    //Notification management

    //Content management
    ADD_CONTENT: { error_code: 0, error_message: 'Content added successfully' },
    UPDATE_CONTENT: { error_code: 0, error_message: 'Content updated successfully' },
    //Content management

    //Mailer management
    UPDATE_MAILER_FAILED: { error_code: 1, error_message: 'Mailer update failed' },
    UPDATE_MAILER: { error_code: 0, error_message: 'Mailer updated successfully' },
    //Mailer management

    //Popup management
    POPUP_IMAGE_REQUIRED: { error_code: 1, error_message: 'Popup image is required' },
    POPUP_UPDATED: { error_code: 0, error_message: 'Popup details updated successfully' },
    //Popup management

    //Shipping management
    SHIPPING_UPDATED: { error_code: 0, error_message: 'Shipping details updated' },
    //Shipping management

    //Media management
    FILE_UPDATED: { error_code: 0, error_message: 'File details updated successfully' },
    FILES_UPLOADED: { error_code: 0, error_message: 'Files uploaded successfully' },
    FILES_DELETED: { error_code: 0, error_message: 'Files deleted successfully' },
    fileNotFound: { error_code: 1, error_message: 'File not found. It may have been moved, edited or deleted.' },
    FILE_DELETED: { error_code: 0, error_message: 'File deleted successfully' },
    FILE_ERROR: { error_code: 1, error_message: 'File error occured. Kindly retry after sometime' },
    //Media management

    //Media management
    DELIVERY_SLOT_ADDED: { error_code: 0, error_message: 'Delivery slot added successfully' },
    DELIVERY_SLOT_UPDATED: { error_code: 0, error_message: 'Delivery slot updated successfully' },
    DELIVERY_SLOT_DELETED: { error_code: 0, error_message: 'Delivery slot deleted successfully' },
    DUPLICATE_DELIVERY_SLOT: { error_code: 1, error_message: 'Delivery slot already exists' },
    //Media management 

    //Blog management
    CREATE_BLOG: { error_code: 0, error_message: 'Blog created successfully' },
    UPDATE_BLOG: { error_code: 0, error_message: 'Blog updated successfully' },
    DELETE_BLOG: { error_code: 0, error_message: 'Blog deleted successfully' },
    //Blog management

    //Wallet management
    WALLET_ADDED: { error_code: 0, error_message: 'Added to wallet successfully' },
    WALLET_UPDATED: { error_code: 0, error_message: 'Wallet updated successfully' },
    //Wallet management

    //Loyalty management
    LOYALTY_UPDATED: { error_code: 0, error_message: 'Loyalty settings updated successfully' },
    //Loyalty management

    //Referral management
    REFERRAL_UPDATED: { error_code: 0, error_message: 'Referral program updated successfully' },
    //Referral management

    //Return management
    RETURN_REQUEST_PLACED: { error_code: 0, error_message: 'Request request placed successfully' },
    RETURN_REQUEST_UPDATED: { error_code: 0, error_message: 'Return request updated successfully' },
    //Return management

    //Sitemap managment
    SITEMAP_UPDATED: { error_code: 0, error_message: 'Sitemap updated successfully' },
    //Sitemap managment

    //Subscribers management
    SUBSCRIBED_SUCCESSFULLY: { error_code: 0, error_message: 'Subscribed to newsletter successfully' },
    UNSUBSCRIBED_SUCCESSFULLY: { error_code: 0, error_message: 'Unsubscribed to newsletter successfully' },
    ALREADY_SUBSCRIBED: { error_code: 1, error_message: 'Already subscribed to newsletter' },
    NOT_SUBSCRIBED: { error_code: 1, error_message: 'Not subscribed to newsletter' },
    VERIFIED_SUCCESSFULLY: { error_code: 0, error_message: 'Verified successfully' },
    CANNOT_PROCESS_REQUEST: { error_code: 1, error_message: 'Cannot process this request' },
    //Subscribers management

    //Home widgets management
    WIDGET_ADDED: { error_code: 0, error_message: 'Widget added successfully' },
    WIDGET_DUPLICATED: { error_code: 0, error_message: 'Widget duplicated successfully' },
    WIDGET_UPDATED: { error_code: 0, error_message: 'Widget updated successfully' },
    WIDGET_DELETED: { error_code: 0, error_message: 'Widget deleted successfully' },
    DRAFT_SAVED: { error_code: 0, error_message: 'Draft saved successfully' },
    WIDGETS_PUBLISHED: { error_code: 0, error_message: 'Home widgets published successfully' },
    //Home widgets management

    //Catalog management
    CATALOG_ADDED: { error_code: 0, error_message: 'Catalog added successfully' },
    CATALOG_UPDATED: { error_code: 0, error_message: 'Catalog updated successfully' },
    CATALOG_DELETED: { error_code: 0, error_message: 'Catalog deleted successfully' },
    CATALOG_DUPLICATED: { error_code: 0, error_message: 'Catalog duplicated successfully' },
    //Catalog management

    //Gift wrap management
    GIFT_WRAP_CREATED: { error_code: 0, error_message: 'Gift wrap added successfully' },
    GIFT_WRAP_UPDATED: { error_code: 0, error_message: 'Gift wrap updated successfully' },
    //Gift wrap management

    //Banner images management
    BANNER_IMAGE_ADDED: { error_code: 0, error_message: 'Banner image added successfully' },
    BANNER_IMAGE_UPDATED: { error_code: 0, error_message: 'Banner image updated successfully' },
    BANNER_IMAGE_DELETED: { error_code: 0, error_message: 'Banner image deleted successfully' },
    BANNER_IMAGE_EXISTS: { error_code: 1, error_message: 'Banner image for this type already exists' },
    //Banner images management

    //Mailer management
    MAILER_CREATED: { error_code: 0, error_message: 'Mailer created successfully' },
    MAILER_UPDATED: { error_code: 0, error_message: 'Mailer updated successfully' },
    //Mailer management

    //Product icon management
    PRODUCT_ICON_ADDED: { error_code: 0, error_message: 'Product icon added successfully' },
    PRODUCT_ICON_UPDATED: { error_code: 0, error_message: 'Product icon updated successfully' },
    PRODUCT_ICON_DELETED: { error_code: 0, error_message: 'Product icon deleted successfully' },
    //Product icon management

    //More offers management
    ADD_MORE_OFFERS: { error_code: 0, error_message: 'More offers added successfully' },
    UPDATE_MORE_OFFERS: { error_code: 0, error_message: 'More offers updated successfully' },
    //More offers management

    //CMS page management
    CONTACT_CMS_UPDATED: { error_code: 0, error_message: 'Contact CMS updated successfully' },
    //CMS page management

    //Shipping charge management
    SHIPPING_CHARGE_ADDED: { error_code: 0, error_message: 'Shipping charge added successfully' },
    SHIPPING_CHARGE_UPDATED: { error_code: 0, error_message: 'Shipping charge updated successfully' },
    //Shipping charge management

    //Testimonials management
    TESTIMONIAL_ADDED: { error_code: 0, error_message: 'Testimonial added successfully' },
    TESTIMONIAL_UPDATED: { error_code: 0, error_message: 'Testimonial updated successfully' },
    TESTIMONIAL_DELETED: { error_code: 0, error_message: 'Testimonial deleted successfully' },
    //Testimonials management

    //Page covers
    PAGECOVER_ADDED: { error_code: 0, error_message: 'Page cover added successfully' },
    PAGECOVER_UPDATED: { error_code: 0, error_message: 'Page cover updated successfully' },
    PAGECOVER_EXISTS: { error_code: 1, error_message: 'Page cover already exists' },
    PAGECOVER_DELETED: { error_code: 0, error_message: 'Page cover deleted successfully' },
    //Page covers

    //Static pages
    STATIC_PAGE_ADD: { error_code: 0, error_message: 'Static page added successfully' },
    STATIC_PAGE_UPDATED: { error_code: 0, error_message: 'Static page updated successfully' },
    STATIC_PAGE_EXISTS: { error_code: 1, error_message: 'Static page already exists' },
    STATIC_PAGE_DELETED: { error_code: 0, error_message: 'Static page deleted successfully' },
    //Static pages
}

