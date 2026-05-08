
exports.Order = require("./models/order.model");
exports.Return = require("./models/return.model");
exports.Replace = require("./models/replace.model");

exports.Cart = require("./models/cart.model");

exports.Review = require("./models/review.model");
exports.User = require("./models/user.modal");
exports.OtpDetails = require("./models/otpDetails.model");
exports.GuestCustomer = require("./models/guest.customer.model");
exports.Customer = require("./models/customers.model");
exports.Guest = require("./models/guests.model");
exports.Admin = require("./models/admin.model");

//Catalog
exports.Brand = require("./models/brand.model");
exports.Category = require("./models/category.model");
exports.ProductHead = require("./models/product.head.model");
exports.Product = require("./models/product.model");
exports.Collection = require("./models/collection.model");
exports.ProductEnquiry = require("./models/product.enquiry.model");
//Catalog

exports.HomeBanner = require("./models/banner.model");
exports.HomeSection = require("./models/layout.model");
exports.TaxClass = require("./models/tax.class.model");
exports.TaxRules = require("./models/tax.rules.model");
exports.Invoice = require("./models/invoice.model");
exports.Social = require("./models/social.model");
exports.ProductReport = require("./models/product.report.model");
exports.CustomerReport = require("./models/customer.report.model");
exports.OrderReport = require("./models/order.report.model")
exports.Faq = require("./models/faq.model")
exports.Notification = require("./models/notification.model")
exports.About = require('./models/about.model')
exports.PrivacyPolicy = require('./models/privacy.policy.model')
exports.Tnc = require('./models/tnc.model')
exports.HelpCenter = require('./models/help.center.model')
exports.Limits = require('./models/pagelimits.model')
exports.General = require('./models/general.settings.model')
exports.HomeSettings = require('./models/home.settings.model')
exports.SeoDetails = require('./models/seo.model')
exports.TokenDetails = require('./models/token.model')
exports.DeliverySlots = require("./models/delivery.slots.model");
exports.Enquiry = require("./models/enquiry.model");
exports.Address = require("./models/address.model");
exports.CategoryLanding = require("./models/categorylanding.model");
exports.CollectionLanding = require("./models/collectionLanding.model");

exports.SearchHistory = require("./models/search.history.model");
exports.NotifySubscribers = require("./models/notify.subscriber.model");
exports.Script = require("./models/script.model");
exports.Analytics = require("./models/analytics.model");
exports.Feed = require("./models/feed.model");
exports.Shipping = require("../db/models/shipping.model")
exports.Menu = require("./models/menu.model");
exports.Content = require("./models/content.model");

//Users and Activity
exports.Activity = require("./models/activity.model");
//Users and Activity

//Roles and Permission
exports.Role = require("./models/roles.model");
exports.Permission = require("./models/permission.model");
//Roles and Permission

//Dashboard
exports.Dashboard = require("./models/dashboard.model");
exports.HomeWidget = require("./models/home.widget.model");
exports.HomeWidgetDraft = require("./models/home.widget.draft.model");
exports.HomeWidgetHistory = require("./models/home.widget.history.model");
exports.HomeWidgetPublish = require("./models/home.widget.publish.model");
exports.PreiewDashboard = require("./models/preview.dashboard.model");
//Dashboard

//Marketing
exports.Offer = require("./models/offer.model");
exports.Coupon = require("./models/coupon.model");
exports.Mailer = require("./models/mailer.model");
exports.Popup = require("./models/popup.model");
exports.Referral = require("./models/referral.model");
exports.Blog = require("./models/blog.model");
exports.Catalog = require("./models/catalog.model");
exports.CatalogWidget = require("./models/catalog.widget.model");
exports.NewsletterSubscibers = require("./models/newsletter.subscribers.model")
exports.GiftWrap = require("./models/gift.wrap.model")
exports.BannerImage = require("./models/banner.image.model")
exports.MoreOffers = require("./models/more.offers.model")
exports.PageCovers = require("./models/page.covers.model")
exports.CareerApplication = require("./models/career.application.model")
//Marketing

//Settings
exports.Apps = require("../db/models/apps.model")
exports.Media = require("../db/models/media.model")
exports.Sitemap = require("../db/models/sitemap.model")
exports.FileImport = require("../db/models/file.import.model")
exports.CustomMailer = require("../db/models/custom.mailer.model")
exports.PaymentDetails = require("../db/models/payment.details.model")
exports.ShippingCharge = require("../db/models/shipping.charge.model")
exports.Log = require("./models/log.model")
exports.MegaMenu = require("../db/models/mega.menu.model")
//Settings

//CMS
exports.ContactPage = require("./models/contact.model");
exports.Footer = require("./models/footer.model")
//payment logs
exports.PaymentGatewayLogs = require("./models/paymentLogs.model");
// shipping logs 
exports.ShippingGatewayLogs = require("./models/gatewayLogs.model");
exports.shippingNotes=require("./models/shippingNotes.model")