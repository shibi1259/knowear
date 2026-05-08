const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/auth.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
  router.post("/validate-referralcode", controller.validateReferral);
  router.post("/login", authorize.verifyGuestForLogin, controller.validate("login"), controller.login);
  router.post("/email-login", authorize.verifyGuestForLogin, controller.validate("email-login"), controller.emailLogin);
  router.post("/register", controller.validate("register"), authorize.verifyGuestForLogin, controller.register);
  router.post("/forgot-password", controller.forgotPassword)
  router.post("/reset-password", controller.resetPassword)
  router.post("/validate-user", controller.validate('verify-login'), controller.validateUser);
  router.post("/validate-login", controller.validate('validate-login'), controller.validateLogin)
  router.post("/update-profile", authorize.verifyUser, controller.validate("update"), controller.updateProfile);
  router.post("/logout", controller.logout);
  router.post("/send-otp", controller.validate('send-otp'), controller.sendOtp)
  router.post("/verify-emailaddress", controller.verifyEmailAddress)
  router.post("/validate-otp", controller.validate('validate-otp'), controller.validateOtp)
  router.post("/guest-login", controller.guestLogin)
  router.post("/varify-email-otp", controller.varifyEmailOtp)
  router.post("/continue-as-guest", controller.ContinueasGuest)
  router.post("/google-login",authorize.verifyGuestForLogin, controller.googleLogin)
  router.post("/facebook-login",authorize.verifyGuestForLogin, controller.facebookLogin)
  // router.post("/verify-subscription", controller.verifySubscription)
  router.post("/update-logouttime", controller.updateLogoutTime)

  return router;
};
