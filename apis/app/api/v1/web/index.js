const express = require("express");
const router = express.Router();
const logger = require("morgan");
router.use(logger("dev"));
const authorize = require("../../../middlewares/authorize")

const authRoute = require("./auth");
const socialRoute = require("./socials");
const categoryRoute = require("./category");
const productRoute = require("./product");
const customerRoute = require("./customer")
const brandRoute = require("./brand")
const collectionRoute = require("./collection")
const offerRoute = require("./offer")
const dashboard = require("./dashboard")
const settings = require("./settings")
const cart = require("./cart")
const content = require("./content")
const enquiry = require("./enquiry")
const order = require("./order")
const review = require("./review")
const blog = require("./blog")
const returnOrder = require("./return")
const deliverySlots = require("./delivery.slots")
const upload = require("./upload.js");
const newsletterSubscribers = require("./newsletter.subscribers.js");
const previewWidgets = require("./home.widget");
const replaceOrder = require("./replace");
const moreOffers = require("./more.offers.js")
const guestCustomer = require("./guest.customer.js")
const pageCover = require("./page.cover.js")
const seoDetails = require("./seo.js")
const paymentDetails = require("./payment.details.js")
const productEnquiry = require("./product.enquiry.js")
const careerApplication = require("./career.application.js")
const websiteMenu = require("./mega.menu.js")

const adminAuthRoute = require("./backend/auth");
const adminProductRoute = require("./backend/product");
const adminCategoryRoute = require("./backend/category");
const adminBrandRoute = require("./backend/brand");
const adminPermissionRoute = require("./backend/permission");
const adminRoleRoute = require("./backend/role");
const adminCollectionRoute = require("./backend/collection");
const adminOfferRoute = require("./backend/offer");
const adminOrderRoute = require("./backend/order");
const adminCartRoute = require("./backend/cart");
const adminTaxClassRoute = require("./backend/tax.class")
const adminTaxRulesRoute = require("./backend/tax.rules")
const adminCustomerRoute = require("./backend/customer")
const adminInvoiceRoute = require("./backend/invoice")
const adminSocialRoute = require("./backend/social")
const adminCouponRoute = require("./backend/coupon")
const adminHomeBannerRoute = require("./backend/banner")
const adminProductReportRoute = require("./backend/product.report")
const adminCustomerReportRoute = require("./backend/customer.report")
const adminOrderReportRoute = require("./backend/order.report.js")
const adminHomeSectionRoute = require("./backend/layout")
const adminReturnSectionRoute = require("./backend/return")
const adminReviewRoute = require("./backend/review")
const adminFaqRoute = require("./backend/faq")
const adminNotificationRoute = require("./backend/notification")
const adminAboutRoute = require("./backend/about")
const adminHelpCenterRoute = require("./backend/help.center")
const adminPageLimitRoute = require("./backend/page.limit")
const adminGeneralSettingsRoute = require("./backend/general.settings")
const adminHomeSettingsRoute = require("./backend/home.settings")
const adminProductHead = require("./backend/product.head")
const adminDashboardRoute = require("./backend/dashboard")
const adminSeoDetails = require("./backend/seo")
const adminEnquiry = require("./backend/enquiry")
const adminAddress = require("./backend/address")
const adminScripts = require("./backend/script")
const adminAnalytics = require("./backend/analytics")
const adminFeed = require("./backend/feed")
const adminMenu = require("./backend/menu")
const adminReport = require("./backend/report")
const adminContents = require("./backend/content")
const adminApps = require("./backend/apps")
const adminMailers = require("./backend/mailer")
const adminShipping = require("./backend/shipping")
const adminPopup = require("./backend/popup")
const adminActivity = require("./backend/activity")
const adminMedia = require("./backend/media")
const adminDeliverySlots = require("./backend/delivery.slots")
const adminBlog = require("./backend/blog.js")
const adminCatalog = require("./backend/catalog.js")
const adminSitemap = require("./backend/sitemap.js")
const adminNewsletterSubscribers = require("./backend/newsletter.subscribers.js")
const adminHomeWidget = require("./backend/home.widget.js")
const adminCatalogWidget = require("./backend/catalog.widget.js")
const adminGiftWrap = require("./backend/gift.wrap.js")
const adminBannerImage = require("./backend/banner.image.js")
const adminCsv = require("./backend/csv.js")
const adminCustomMailer = require("./backend/custom.mailer.js")
const adminFileImport = require("./backend/file.import.js")
const adminReplace = require("./backend/replace.js");
const adminMoreOffers = require("./backend/more.offer.js");
const adminGuestCustomer = require("./backend/guest.customer.js")
const adminShippingCharge = require("./backend/shipping.charge.js")
const adminUpload = require("./backend/upload.js");
const adminPageCovers = require("./backend/page.covers.js")
const adminPaymentDetails = require("./backend/payment.details.js")
const adminReset = require("./backend/reset.js")
const adminProductEnquiry = require("./backend/product.enquiry.js")
const adminCareerApplication = require("./backend/career.application.js")
const adminLogs = require("./backend/logs.js")
const adminMegaMenu = require("./backend/mega.menu.js");
const auth = require("./auth");
const about = require("./about.js");
const generalSettings = require("./general.settings.js")

module.exports = () => {
  router.use((req, res, next) => {
    res._json = res.json;
    res.json = function json(obj) {
      obj.APIType = "Web";
      obj.APIVersion = 1;
      res._json(obj);
    };
    next();
  });


  router.use("", authRoute());
  router.use("", productEnquiry());
  router.use("", categoryRoute());
  router.use("", productRoute());
  router.use("", customerRoute())
  router.use("", brandRoute())
  router.use("", collectionRoute())
  router.use("", offerRoute())
  router.use("", dashboard())
  router.use("", careerApplication())
  router.use("", settings())
  router.use("", cart())
  router.use("", content())
  router.use("", enquiry())
  router.use("", order())
  router.use("", review())
  router.use("", blog())
  router.use("", returnOrder())
  router.use("", upload())
  router.use("", deliverySlots())
  router.use("", newsletterSubscribers())
  router.use("", replaceOrder())
  router.use("", moreOffers())
  router.use("", guestCustomer())
  router.use("", pageCover())
  router.use("", seoDetails())
  router.use("", paymentDetails())
  router.use("", websiteMenu())
  router.use("",socialRoute())
  router.use("", about());
  router.use("", generalSettings())

  router.use("/admin/auth", adminReport());
  router.use("/admin/auth", adminFeed());
  router.use("/admin/auth", adminNewsletterSubscribers());
  router.use("/admin/auth", adminHelpCenterRoute());
  router.use("/admin/auth", adminAuthRoute());
  router.use("/admin/auth", adminReset());
  router.use("/admin/auth", authorize.verifyToken, adminMailers());
  router.use("/admin/auth", authorize.verifyToken, adminCareerApplication());
  router.use("/admin/auth", authorize.verifyToken, adminProductEnquiry());
  router.use("/admin/auth", authorize.verifyToken, adminProductRoute());
  router.use("/admin/auth", authorize.verifyToken, adminApps());
  router.use("/admin/auth", authorize.verifyToken, adminPaymentDetails());
  router.use("/admin/auth", authorize.verifyToken, adminCategoryRoute());
  router.use("/admin/auth", authorize.verifyToken, adminBrandRoute());
  router.use("/admin/auth", authorize.verifyToken, adminRoleRoute());
  router.use("/admin/auth", authorize.verifyToken, adminPermissionRoute());
  router.use("/admin/auth", authorize.verifyToken, adminCollectionRoute());
  router.use("/admin/auth", authorize.verifyToken, adminOfferRoute());
  router.use("/admin/auth", authorize.verifyToken, adminOrderRoute());
  router.use("/admin/auth", authorize.verifyToken, adminCartRoute());
  router.use("/admin/auth", authorize.verifyToken, adminTaxClassRoute());
  router.use("/admin/auth", authorize.verifyToken, adminTaxRulesRoute())
  router.use("/admin/auth", authorize.verifyToken, adminCustomerRoute());
  router.use("/admin/auth", authorize.verifyToken, adminInvoiceRoute());
  router.use("/admin/auth", authorize.verifyToken, adminSocialRoute());
  router.use("/admin/auth", authorize.verifyToken, adminCouponRoute());
  router.use("/admin/auth", authorize.verifyToken, adminPageCovers());
  router.use("/admin/auth", authorize.verifyToken, adminHomeBannerRoute());
  router.use("/admin/auth", authorize.verifyToken, adminProductReportRoute());
  router.use("/admin/auth", authorize.verifyToken, adminCustomerReportRoute());
  router.use("/admin/auth", authorize.verifyToken, adminHomeSectionRoute());
  router.use("/admin/auth", authorize.verifyToken, adminOrderReportRoute());
  router.use("/admin/auth", authorize.verifyToken, adminReturnSectionRoute());
  router.use("/admin/auth", authorize.verifyToken, adminReviewRoute());
  router.use("/admin/auth", authorize.verifyToken, adminFaqRoute());
  router.use("/admin/auth", authorize.verifyToken, adminNotificationRoute());
  router.use("/admin/auth", authorize.verifyToken, adminAboutRoute());
  router.use("/admin/auth", authorize.verifyToken, adminPageLimitRoute());
  router.use("/admin/auth", authorize.verifyToken, adminGeneralSettingsRoute());
  router.use("/admin/auth", authorize.verifyToken, adminHomeSettingsRoute());
  router.use("/admin/auth", authorize.verifyToken, adminProductHead());
  router.use("/admin/auth", authorize.verifyToken, adminDashboardRoute());
  router.use("/admin/auth", authorize.verifyToken, adminSeoDetails());
  router.use("/admin/auth", authorize.verifyToken, adminEnquiry());
  router.use("/admin/auth", authorize.verifyToken, adminAddress());
  router.use("/admin/auth", authorize.verifyToken, adminScripts());
  router.use("/admin/auth", authorize.verifyToken, adminAnalytics());
  router.use("/admin/auth", authorize.verifyToken, adminMenu());
  router.use("/admin/auth", authorize.verifyToken, adminContents());
  router.use("/admin/auth", authorize.verifyToken, adminShipping());
  router.use("/admin/auth", authorize.verifyToken, adminPopup());
  router.use("/admin/auth", authorize.verifyToken, adminActivity());
  router.use("/admin/auth", authorize.verifyToken, adminDeliverySlots());
  router.use("/admin/auth", authorize.verifyToken, adminMedia());
  router.use("/admin/auth", authorize.verifyToken, adminBlog());
  router.use("/admin/auth", authorize.verifyToken, adminCatalog());
  router.use("/admin/auth", authorize.verifyToken, adminSitemap());
  router.use("/admin/auth", authorize.verifyToken, adminHomeWidget());
  router.use("/admin/auth", authorize.verifyToken, adminCatalogWidget());
  router.use("/admin/auth", authorize.verifyToken, adminGiftWrap());
  router.use("/admin/auth", authorize.verifyToken, adminBannerImage());
  router.use("/admin/auth", authorize.verifyToken, adminCsv());
  router.use("/admin/auth", authorize.verifyToken, adminFileImport());
  router.use("/admin/auth", authorize.verifyToken, adminCustomMailer());
  router.use("/admin/auth", authorize.verifyToken, adminReplace());
  router.use("/admin/auth", authorize.verifyToken, adminMoreOffers());
  router.use("/admin/auth", authorize.verifyToken, adminGuestCustomer());
  router.use("/admin/auth", authorize.verifyToken, adminShippingCharge());
  router.use("/admin/auth", authorize.verifyToken, adminUpload());
  router.use("/admin/auth", authorize.verifyToken, adminLogs());
  router.use("/admin/auth", authorize.verifyToken, adminMegaMenu());
  


  //Widgets
  router.use("", authorize.verifyCartAuth, previewWidgets());
  //Widgets

  router.get("*", (req, res) => {
    res.status = 404;
    res.json({
      success: false,
      message: "Unknown command, that means you have done something wrong.",
      errorCode: 404,
      result: {},
    });
  });

  return router;
};
