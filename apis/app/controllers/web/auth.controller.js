const { body, validationResult } = require("express-validator");
const helper = require("../../../util/responseHelper");
const authService = require("../../services/auth.service");
const service = require("../../services/customer.service");
const guestService = require("../../services/guest.service");
const jwt = require("jsonwebtoken");
const constant = require("../../../config/constants");
const { messages } = constant;
const key = constant.common.KEYS;
const db = require("../../db/index");
const slug = require("../../../util/slug");
const { getAuth } = require("firebase-admin/auth");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const settingsService = require("../../services/general.settings.service");
const axios = require("axios");
const cartService = require("../../services/cart.service");
const bcrypt = require("bcrypt");
const mailer = require("../../../util/sendMail");
const templates = require("../../../util/templates");
const crypto = require("crypto");
const { SALT_ROUNDS, BASE_URL } = require("../../../config/constants/common");
const { uid } = require("uid/secure");
// const reference= require("../../../util/getReferer");

exports.validate = (method) => {
  switch (method) {
    case "validate": {
      return [
        body("countryCode", `Country code No is required`).exists(),
        body("mobile", `Mobile is required`).exists(),
      ];
    }
    case "email-login": {
      return [
        body("email", `Email is required`).exists(),
        body("password", `Password is required`).exists(),
      ];
    }
    case "register": {
      return [
        body("email", `Email is required`).exists(),
        body("password", `Password is required`).exists(),
        body("source", `Source is required`).exists(),
      ];
    }
    case "login": {
      return [
        body("countryCode", `Country code is required`).exists(),
        body("phoneNumber", `Phone number is required`).exists(),
        body("mobile", `Mobile is required`).exists(),
        body("deviceToken", `Device token is required`).exists(),
        body("deviceType", `Device type No is required`).exists(),
        body("uuid", `Uid is required`).exists(),
      ];
    }
    case "update": {
      return [
        body("name", `Name is required`).exists(),
        body("email", `Email is required`).exists(),
      ];
    }
    case "verify-login": {
      return [
        body("countryCode", `Country code is required`).exists(),
        body("mobile", `Phone number is required`).exists(),
      ];
    }
    case "validate-login": {
      return [body("email", `Email is required`).exists()];
    }
    case "send-otp": {
      return [
        body("countryCode", `Country Code is required`).exists(),
        body("mobile", `Mobile is required`).exists(),
      ];
    }
    case "validate-otp": {
      return [
        body("otp", `Otp is required`).exists(),
        body("countryCode", `Country Code is required`).exists(),
        body("mobile", `Mobile is required`).exists(),
      ];
    }
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helper.deliverResponse(res, 422, errors, messages.VALIDATION_ERROR);
    }

    const { body } = req;
    const { deviceToken, firebaseToken } = res?.locals?.user;
    const settings = await db.General.findOne();
    const saltRounds = constant.common.SALT_ROUNDS;

    const cartDetails = await cartService.getCart({
      deviceToken: deviceToken,
      isActive: true,
      isDelete: false,
    });

    const userDetails = await service.getCustomerDetails({
      $or: [{ email: body.email, isDelete: false }],
    });

    if (userDetails) {
      return helper.deliverResponse(res, 422, {}, messages.ALREADY_REGISTERED);
    } else {
      body.userid = uid();
      body.password = bcrypt.hashSync(body.password, saltRounds);
body.referer=req.headers.referer;
      if (body?.name) {
        body.slug = await slug.createSlug(db.Customer, body.name, { slug: await slug.generateSlug(body.name) });
      }

      const response = await service.create({ ...body, registerMethod: 'Email', deviceTokens:[firebaseToken] });

      if (response instanceof Error) {
        return helper.deliverResponse(res, 422, response, messages.serverError);
      } else {
        const payload = {
          store: "Knowear",
          branding: BASE_URL + settings?.logo,
          name: "User",
        };

        let cart = {
          customer: '',
          deviceToken: "",
        };
        cart.customer = response?._id;

        if (cartDetails) {
          const customerDetails = await cartService.getCart({
            "customer": response?._id,
            isActive: true,
            isDelete: false,
            isPurchased: false,
          });
          if (customerDetails) {
            let guestProducts = cartDetails?.products;
            let customerProducts = customerDetails?.products;

            guestProducts.forEach((itemA) => {
              const existsInB = customerProducts.some(
                (itemB) =>
                  String(itemB.product._id) === String(itemA.product._id)
              );
              if (!existsInB) {
                customerProducts.push(itemA);
              }
            });

            await cartService.updateCart(
              {
                "customer": response?._id,
                isActive: true,
                isDelete: false,
                isPurchased: false,
              },
              { customer: response._id, products: customerProducts }
            );

            await cartService.updateCart(
              {
                deviceToken: deviceToken,
                isActive: true,
                isDelete: false,
              },
              { isDelete: true }
            );
          } else {
            await cartService.updateCart(
              {
                deviceToken: deviceToken,
                // refid: cartDetails?.refid,
                isActive: true,
                isDelete: false,
              },
              { customer: response?._id}
            );
          }
        }

        const subject = "Welcome to Knowear";
        const content = "Welcome to Knowear";
        await mailer.sendMail(
          body.email,
          subject,
          content,
          templates.welcomeCustomer(payload)
        );
        const token = jwt.sign({ userid: body.userid }, key.JWTSECRET, {
          expiresIn: "1h",
        });
        helper.deliverResponse(
          res,
          200,
          { accessToken: token },
          {
            error_code: messages.REGISTERED_SUCCESSFULLY.error_code,
            error_message: messages.REGISTERED_SUCCESSFULLY.error_message,
          }
        );
      }
    }
  } catch (error) {
    console.log("Error caught in register api :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.validateReferral = async (req, res) => {
  try {
    const { body } = req;
    const referralDetails = await service.getCustomer({
      referralCode: body?.referral,
      isActive: true,
      isDelete: false,
    });
    if (referralDetails) {
      helper.deliverResponse(
        res,
        200,
        { isExist: true },
        {
          error_code: messages.VALID_REFERRAL_CODE.error_code,
          error_message: messages.VALID_REFERRAL_CODE.error_message,
        }
      );
    } else {
      helper.deliverResponse(
        res,
        422,
        { isExist: false },
        {
          error_code: messages.INVALID_REFERRAL_CODE.error_code,
          error_message: messages.INVALID_REFERRAL_CODE.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in validate referral api :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const { deviceToken } = res?.locals?.user;
    const cartDetails = await cartService.getCart({
      deviceToken: deviceToken,
      isActive: true,
      isDelete: false,
    });

    getAuth()
      .getUser(body["uuid"])
      .then(async (response) => {
        if (body["phoneNumber"] == response["phoneNumber"]) {
          const query = {
            mobile: body["mobile"],
            countryCode: body["countryCode"],
            isActive: true,
            isDelete: false,
          };
          let user = await authService.getUser(query);
          let cart = {
            customer: { id: "", refid: "" },
            deviceToken: "",
            type: "1",
          };
          if (user) {
            const data = {
              name: user["name"],
              userid: user["userid"],
              email: user["email"],
              countryCode: user["countryCode"],
              deviceType: body["deviceType"],
              deviceToken: body["deviceToken"],
              mobile: body["mobile"],
            };

            cart.customer.id = user?._id;
            cart.customer.refid = user?.userid;
            const payload = authService.generatePayload(data);
            // const token = jwt.sign(payload, key.JWTSECRET, { expiresIn: key.JWT_EXPIRE });
            const token = jwt.sign(payload, key.JWTSECRET);
            await authService.updateUser(
              { _id: user["_id"] },
              { $push: { tokens: token } }
            );
            helper.deliverResponse(
              res,
              200,
              { ...payload, access_token: token, existing_user: true },
              {
                error_code: messages.successResponse.error_code,
                error_message: messages.successResponse.error_message,
              }
            );
          } else {
            let userDetails = await authService.getUser({
              mobile: body["mobile"],
              countryCode: body["countryCode"],
            });
            if (userDetails) {
              helper.deliverResponse(
                res,
                200,
                {},
                {
                  error_code: messages.INACTIVE_USER.error_code,
                  error_message: messages.INACTIVE_USER.error_message,
                }
              );
            } else {
              let data = {
                countryCode: body?.countryCode,
                deviceType: body?.deviceType,
                deviceToken: body?.deviceToken,
                mobile: body?.mobile,
              };

              const count = await service.getCustomerCount({});
              data["userid"] = count + 1;
              const payload = authService.generatePayload(data);
              const token = jwt.sign(payload, key.JWTSECRET, {
                expiresIn: key.JWT_EXPIRE,
              });
              data["tokens"] = [token];
              const newUser = await service.create(data);
              cart.customer.id = newUser?._id;
              cart.customer.refid = newUser?.userid;
              helper.deliverResponse(
                res,
                200,
                { ...payload, access_token: token, existing_user: false },
                {
                  error_code: messages.successResponse.error_code,
                  error_message: messages.successResponse.error_message,
                }
              );
            }
          }

          if (cartDetails)
            await cartService.updateCart(
              {
                deviceToken: deviceToken,
                refid: cartDetails?.refid,
                isActive: true,
                isDelete: false,
              },
              cart
            );
        } else {
          helper.deliverResponse(
            res,
            422,
            { existing_user: false },
            {
              error_code: messages.UNMATCHED_MOBILE.error_code,
              error_message: messages.UNMATCHED_MOBILE.error_message,
            }
          );
        }
      })
      .catch((error) => {
        helper.deliverResponse(res, 422, error, {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        });
      });
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

function generateReferralCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }

  return referralCode;
}

async function isReferralCodeExists(referralCode) {
  const referralDetails = await service.getCustomer({
    referralCode: referralCode,
    isDelete: false,
  });
  return referralDetails ? true : false;
}

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const { userid } = res?.locals?.user;
    body.email = (body?.email).toLowerCase();
    const userDetails = await service.getCustomerDetails({ userid: userid });
    switch (body?.type) {
      case "0":
        //New Registration Update
        if (user?.email != body?.email) {
          let data = { name: body?.name, email: body?.email };

          //Referral code generation
          const referral = async () => {
            const referralCode = generateReferralCode(6);
            const isExists = await isReferralCodeExists(referralCode);
            if (isExists == false) {
              data["referralCode"] = referralCode;
            } else {
              referral();
            }
          };
          await referral();
          //Referral code generation

          if (body?.referral) {
            const referredUserDetails = await service.getCustomer({
              referralCode: body?.referral,
            });
            if (referredUserDetails) {
              data["referralSource"] = {
                code: body?.referral,
                user: referredUserDetails?._id,
              };
            }
          }

          data["slug"] = await slug.createSlug(db.Customer, body?.name, {
            slug: await slug.generateSlug(body?.name),
          });
          await authService.updateUser(
            { countryCode: body?.countryCode, mobile: body?.mobile },
            data
          );
          helper.deliverResponse(
            res,
            200,
            {},
            {
              error_code: messages.USER_UPDATED.error_code,
              error_message: messages.USER_UPDATED.error_message,
            }
          );
        } else {
          helper.deliverResponse(
            res,
            422,
            {},
            {
              error_code: messages.EMAIL_EXIST.error_code,
              error_message: messages.EMAIL_EXIST.error_message,
            }
          );
        }
        break;
      case "1":
        //Profile Update
        if (userDetails.name != body.name)
          body.slug = await slug.createSlug(db.Customer, body.name, {
            slug: await slug.generateSlug(body.name),
          });
        if (body.password)
          body.password = bcrypt.hashSync(body.password, SALT_ROUNDS);
        await authService.updateUser({ userid: userid }, body);
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.USER_UPDATED.error_code,
            error_message: messages.USER_UPDATED.error_message,
          }
        );
        break;
    }
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.logout = async (req, res) => {
  try {
    const usertoken = req.headers.authorization.split("Bearer ")[1];
    const userid = res.locals?.user?.userid;
    const user = await authService.getUser({
      userid: userid,
      isActive: true,
      isDelete: false,
    });
    let tokens = user?.tokens;
    const LogoutTime = new Date();
    console.log(user,"user");
    console.log(tokens,"tokens");

    console.log(LogoutTime,"logouttime");
    service.findByIdAndUpdate({ userid: userid }, { logoutTime: LogoutTime });     
    if (tokens.includes(usertoken)) {
      for (let token of tokens) {
        if (token == usertoken) {
          const index = tokens.indexOf(token);
          if (index >= 0) tokens.splice(index, 1);
          const update = await authService.updateUser(
            { _id: user["_id"] },
            { $set: { tokens: tokens } }
          );
          if (update) {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.LOGOUT_SUCCESS.error_code,
                error_message: messages.LOGOUT_SUCCESS.error_message,
              }
            );
          } else {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.FAILED_LOGOUT.error_code,
                error_message: messages.FAILED_LOGOUT.error_message,
              }
            );
          }
        }
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.ALREADY_LOGGEDOUT.error_code,
          error_message: messages.ALREADY_LOGGEDOUT.error_message,
        }
      );
    }
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.validateLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(body?.email);
    let userDetails = null;
    let type = "";
    if (isEmail) {
      userDetails = await service.getCustomerDetails({
        email: body?.email,
        isActive: true,
        isDelete: false,
      });
      type = "email";
    } else {
      helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        }
      );
      return;
    }

    let response = { type: type, existingUser: userDetails ? true : false };
    switch (type) {
      case "email":
        response["email"] = userDetails?.email;
        break;
    }

    if (userDetails) {
      switch (userDetails?.isActive) {
        case true:
          helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          });
          break;
        case false:
          helper.deliverResponse(res, 404, response, {
            error_code: messages.INACTIVE_USER.error_code,
            error_message: messages.INACTIVE_USER.error_message,
          });
          break;
      }
    } else {
      const otp = Math.floor(10000 + Math.random() * 90000);
      console.log("otp ::", otp);
      response["email"] = body?.email;
      if (!body?.email) {
        return helper.deliverResponse(
          res,
          401,
          {},
          {
            error_code: 1,
            error_message: "No email address to send otp",
          }
        );
      }
      const existingOtp = await db.OtpDetails.findOne({ email: body?.email });
      let savedOtpDetails;
      if (existingOtp) {
        savedOtpDetails =await db.OtpDetails.findByIdAndUpdate(existingOtp._id, { otp });
        setTimeout(async () => {
          await db.OtpDetails.findByIdAndDelete(existingOtp._id);
        }, 120000); // 2 minutes
      } else {
      //saving otp in database
      savedOtpDetails = await db.OtpDetails.create({
        email: body?.email,
        otp,
      });
   
      setTimeout(async () => {
        await db.OtpDetails.findByIdAndDelete(savedOtpDetails?._id);
      }, 120000); // otp expires after 2 minutes.
    }
      const placedTemplate = templates.sendOtp(otp);
      const subject = "OTP Verification";
      const content = "Kindly use the below OTP to verify your email address";
      await mailer.sendMail(body?.email, subject, content, placedTemplate);
      

      helper.deliverResponse(res, 200, response, {
        error_code: messages.NO_USER_FOUND.error_code,
        error_message: messages.NO_USER_FOUND.error_message,
      });
    }
  } catch (error) {
    console.log("Error caught in validate user :: " + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.validateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const userDetails = await service.getCustomer({
      countryCode: body.countryCode,
      mobile: body.mobile,
      isDelete: false,
    });
    if (userDetails) {
      if (userDetails?.isActive == true) {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          }
        );
      } else {
        helper.deliverResponse(
          res,
          422,
          {},
          {
            error_code: messages.INACTIVE_USER.error_code,
            error_message: messages.INACTIVE_USER.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in verify login API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const settings = await settingsService.findOne({});
    const userDetails = await service.getCustomer({
      countryCode: body?.countryCode,
      mobile: body?.mobile,
      $or: [{ isActive: false }, { isDelete: true }],
    });

    if (userDetails) {
      helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.INACTIVE_USER.error_code,
          error_message: messages.INACTIVE_USER.error_message,
        }
      );
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      //Otp expiry after 2 minutes
      setTimeout(async () => {
        const customerDetails = await service.getCustomer({
          userid: userDetails?.userid,
        });
        if (customerDetails?.otp?.mobile == otp) {
          await service.update(
            { userid: customerDetails?.userid },
            {
              $set: {
                otp: { mobile: null, email: customerDetails?.otp?.email },
              },
            }
          );
        }
      }, 120000);
      //Otp expiry after 2 minutes
      const mobile = body?.countryCode + body?.mobile;
      const username = process.env.SMART_USERNAME;
      const password = process.env.SMART_API_KEY;
      const sms = `<#> ${otp} is the OTP to login into your ${settings?.name} account. OTP is valid for next 2 minutes. Don't share OTP with anyone.`;
      const smartUrl = `https://smartsmsgateway.com/api/api_http.php?username=${username}&password=${password}&senderid=SAJIDHA-UAE&to=${mobile}&text=${sms}&type=text`;
      await axios
        .request({ method: "POST", url: smartUrl })
        .then(async (response) => {
          console.log("Respons from smart SMS :: " + response?.data);
          const details = await service.getCustomer({
            countryCode: body?.countryCode,
            mobile: body?.mobile,
            isDelete: false,
          });
          let registeredUser = null;
          details ? null : (registeredUser = await createCustomer(body));
          let query = {};
          registeredUser
            ? (query["userid"] = registeredUser?.userid)
            : (query["userid"] = details?.userid);
          let otpPayload = {
            mobile: "123456",
            email: registeredUser ? null : details?.otp?.email,
          };
          const otpUpdated = await service.update(query, {
            $set: { otp: otpPayload },
          });
          if (otpUpdated instanceof Error) {
            helper.deliverResponse(
              res,
              422,
              {},
              {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
              }
            );
          } else {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.OTP_SENT.error_code,
                error_message: messages.OTP_SENT.error_message,
              }
            );
          }
        })
        .catch((error) => {
          console.log("Error caught from smart SMS :: " + error);
          helper.deliverResponse(
            res,
            422,
            {},
            {
              error_code: messages.OTP_NOT_SENT.error_code,
              error_message: messages.OTP_NOT_SENT.error_message,
            }
          );
        });
    }
  } catch (error) {
    console.log("Error caught in send otp API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};
exports.verifyEmailAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
    
    const { body } = req;
    const settings = await settingsService.findOne({});
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Prepare email content
    const subject = `OTP for ${settings?.name} Login`;
    const content = `Your OTP to varify  your ${settings?.name} account is: ${otp}. OTP is valid for next 2 minutes. Don't share OTP with anyone.`;
    
    try {
      // Send email with OTP
      await mailer.sendMail(body?.email, subject, content, content);
      
      // Get existing user or create new one
      let details = await service.getCustomer({ email: body?.email, isDelete: false });
      let registeredUser = details || await createCustomer(body);
      
      let userId = registeredUser?.userid || details?.userid;
      
      // Check if there's an existing OTP entry for this email and update it
      const existingOtp = await db.OtpDetails.findOne({
        email: body?.email
      });  
     
      
      if (existingOtp) {
        // Update existing OTP record
        await db.OtpDetails.updateOne(
          { _id: existingOtp._id },
          {
            $set: {
              otp: otp,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 120000), // 2 minutes from now
            }
          }
        );
      } else {
        // Save new OTP details
        await db.OtpDetails.create({
          email: body?.email,
          otp: otp,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 120000), // 2 minutes from now
          isExpired: false
        });
      }
      
      // Update user with OTP
      let otpPayload = { mobile: null, email: otp };
      await service.update({ userid: userId }, { $set: { otp: otpPayload } });
      
      // Schedule OTP expiration
      setTimeout(async () => {
        const customerDetails = await service.getCustomer({ userid: userId });
        
        if (customerDetails?.otp?.email === otp) {
          await service.update({ userid: userId }, { $set: { otp: { mobile: null, email: null } } });
          
          await db.OtpDetails.updateOne(
            { email: body?.email, otp: otp, isExpired: false },
            { $set: { isExpired: true } }
          );
        }
      }, 120000);
      
      // Respond success
      helper.deliverResponse(res, 200, {}, {
        error_code: messages.OTP_SENT.error_code,
        error_message: messages.OTP_SENT.error_message,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      helper.deliverResponse(res, 422, {}, {
        error_code: messages.OTP_NOT_SENT.error_code,
        error_message: messages.OTP_NOT_SENT.error_message,
      });
    }
  } catch (error) {
    console.error("Error in send OTP API:", error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

const createCustomer = async (body) => {
  body.userid = (await service.getCustomerCount({})) + 1;
  const userDetails = await service.create(body);
  return userDetails;
};

exports.validateOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const { devicetoken } = req?.headers;
    const cartDetails = await cartService.getCart({
      deviceToken: devicetoken,
      isActive: true,
      isDelete: false,
    });
    const userDetails = await service.getCustomer({
      countryCode: body?.countryCode,
      mobile: body?.mobile,
      isDelete: false,
      isActive: true,
    });
    if (userDetails) {
      if (userDetails?.otp?.mobile) {
        if (userDetails?.otp?.mobile == body?.otp) {
          let payload = {
            userid: userDetails?.userid,
            name: userDetails?.name,
            email: userDetails?.email,
            mobile: userDetails?.mobile,
            countryCode: userDetails?.countryCode,
          };
          const token = jwt.sign(payload, key.JWTSECRET, {
            expiresIn: key.JWT_EXPIRE,
          });
          let cartQuery = null;
          cartDetails
            ? (cartQuery = {
              deviceToken: null,
              customer: { id: userDetails?._id, refid: userDetails?.userid },
            })
            : null;

          if (cartQuery) {
            const cartUpdated = await cartService.updateCart(
              { _id: cartDetails?.id },
              cartQuery
            );
          }
          const tokenUpdated = await service.update(
            { userid: userDetails?.userid },
            {
              $set: {
                tokens: [...userDetails?.tokens, token],
                otp: { email: userDetails?.otp?.email, mobile: null },
              },
            }
          );
          helper.deliverResponse(
            res,
            200,
            {
              isExisting: userDetails?.name ? true : false,
              accessToken: token,
            },
            {
              error_code: messages.successResponse.error_code,
              error_message: messages.successResponse.error_message,
            }
          );
        } else {
          helper.deliverResponse(
            res,
            422,
            {},
            {
              error_code: messages.INVALID_OTP.error_code,
              error_message: messages.INVALID_OTP.error_message,
            }
          );
        }
      } else {
        helper.deliverResponse(
          res,
          422,
          {},
          {
            error_code: messages.INVALID_OTP.error_code,
            error_message: messages.INVALID_OTP.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.NO_USER_FOUND.error_code,
          error_message: messages.NO_USER_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in validate otp API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.emailLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    console.log(req.body, "body");

    const referer = req.headers.referer;
    const loginTime=new Date();
    // const refererSource = location.parseRefererSource(referer);
    service.customerReferer(req.body.email, { referer: referer ,loginTime:loginTime});
    const { deviceToken ,firebaseToken } = res?.locals?.user;
    const cartDetails = await cartService.getCart({
      deviceToken: deviceToken,
      isActive: true,
      isDelete: false,
    });
    
    const userDetails = await service.getCustomerDetails({ email: body.email });

    
    if (userDetails) {

      if (firebaseToken) {
        let existingTokens = userDetails?.fireBaseTokens || [];
        if (!existingTokens.includes(firebaseToken)) {
          existingTokens.push(firebaseToken);
          await db.Customer.findByIdAndUpdate(userDetails?._id, {
            deviceTokens: existingTokens,
          });
        }
      }
      if (userDetails.password) {
        bcrypt.compare(
          body.password,
          userDetails.password,
          async (error, response) => {
            if (error) {
              helper.deliverResponse(res, 422, error, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
              });
            }

            let cart = {
              customer: userDetails?._id,
              deviceToken: "",
              type: "1",
            };
            if (response == true) {
              if (cartDetails) {
                const customerDetails = await cartService.getCart({
                  "customer.id": userDetails?._id,
                  isActive: true,
                  isDelete: false,
                  isPurchased: false,
                });
                if (customerDetails) {
                  let guestProducts = cartDetails?.products;
                  let customerProducts = customerDetails?.products;
                  guestProducts.forEach((itemA) => {
                    const existsInB = customerProducts.some(
                      (itemB) =>
                        itemB?.product?._id.toString() ===
                        itemA?.product?._id.toString()
                    );
                    if (!existsInB) {
                      customerProducts.push(itemA);
                    }
                  });

                  const updateCustomerCart = await cartService.updateCart(
                    {
                      customer: userDetails?._id,
                      isActive: true,
                      isDelete: false,
                      isPurchased: false,
                    },
                    { ...cart, products: customerProducts }
                  );

                  const updateResponse = await cartService.updateCart(
                    {
                      deviceToken: deviceToken,
                      refid: cartDetails?.refid,
                      isActive: true,
                      isDelete: false,
                    },
                    { isDelete: true }
                  );
                } else {
                  const updateResponse = await cartService.updateCart(
                    {
                      deviceToken: deviceToken,
                      refid: cartDetails?.refid,
                      isActive: true,
                      isDelete: false,
                    },
                    cart
                  );
                }
              }
            }

            switch (response) {
              case true:
                const token = jwt.sign(
                  { _id: userDetails?._id, userid: userDetails?.userid },
                  key.JWTSECRET,
                  { expiresIn: key.JWT_EXPIRE }
                );
                helper.deliverResponse(
                  res,
                  200,
                  { accessToken: token },
                  {
                    error_code: messages.successResponse.error_code,
                    error_message: messages.successResponse.error_message,
                  }
                );
                break;
              case false:
                helper.deliverResponse(
                  res,
                  422,
                  { isImported: userDetails.isImported },
                  {
                    error_code: messages.INCORRECT_PASSWORD.error_code,
                    error_message: messages.INCORRECT_PASSWORD.error_message,
                  }
                );
                break;
            }
          }
        );
      } else {
        console.log(2);
        helper.deliverResponse(
          res,
          422,
          {},
          {
            error_code: messages.INCORRECT_PASSWORD.error_code,
            error_message: messages.INCORRECT_PASSWORD.error_message,
          }
        );
      }
    } else {
      console.log(1);
      helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.NO_USER_FOUND.error_code,
          error_message: messages.NO_USER_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in email login API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { body } = req;
    const settings = await settingsService.findOne({});
    const userDetails = await service.getCustomerDetails({ email: body.email });

    if (userDetails) {
      const token = crypto.randomBytes(20).toString("hex");
      await service.update(
        { email: body.email },
        { $set: { verificationToken: { email: token } } }
      );
      setTimeout(async () => {
        const admin = await service.getCustomerDetails({
          email: body.email,
          isDelete: false,
        });
        if (admin?.verificationToken?.email === token) {
          await service.update(
            { email: body.email },
            { $set: { verificationToken: { email: "" } } }
          );
        }
      }, 300000);

      const template = await templates.resetPassword({
        link: settings?.domain + "/?view=reset-password" +"&token="+ token,
        primaryColor: settings?.colors?.primary,
      });

      const resetPasswordEmail = await mailer.sendMail(
        userDetails.email,
        "Forgot your password?",
        "Reset password",
        template
      );
      if (resetPasswordEmail instanceof Error) {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.RESET_PASSWORD_EMAIL_SENT_FAILED.error_code,
            error_message:
              messages.RESET_PASSWORD_EMAIL_SENT_FAILED.error_message,
          }
        );
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.RESET_PASSWORD_EMAIL_SENT.error_code,
            error_message: messages.RESET_PASSWORD_EMAIL_SENT.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.NO_USER_FOUND.error_code,
          error_message: messages.NO_USER_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in forgot password API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { body } = req;
    const userDetails = await service.getCustomerDetails({
      "verificationToken.email": body.token,
    });
    if (userDetails) {
      const password = await bcrypt.hash(body.password, SALT_ROUNDS);
      await service.update(
        { "verificationToken.email": body.token },
        { $set: { password: password, verificationToken: { email: "" } } }
      );
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.PASSWORD_CHANGE_SUCCESS.error_code,
          error_message: messages.PASSWORD_CHANGE_SUCCESS.error_message,
        }
      );
    } else {
      helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.INVALID_TOKEN.error_code,
          error_message: messages.INVALID_TOKEN.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in reset password API :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

function generateUniqueCode() {
  const parts = [];
  for (let i = 0; i < 3; i++) {
    let part = "";
    for (let j = 0; j < 4; j++) {
      const digit = Math.floor(Math.random() * 10);
      part += digit;
    }
    parts.push(part);
  }
  return parts.join("-");
}

exports.guestLogin = async (req, res, next) => {
  try {
    const { body } = req;
    //validating otp
    if (!body?.email) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: 1,
          error_message: "No email provided ",
        }
      );
    }
    let otpDetailsExists = await db.OtpDetails.findOne({
      email: body?.email?.trim(),
    });
    if (!otpDetailsExists || otpDetailsExists?.otp != body?.otp) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: 1,
          error_message: "Invalid OTP",
        }
      );
    } else {
      await db.OtpDetails.findOneAndDelete({ email: body?.email?.trim() }); // removed existing otp details.
    }
    let guestToken;
    // saving customer in database
    const generateToken = async () => {
      const token = generateUniqueCode();
      const guestDetails = await db.GuestCustomer.findOne({ token: token });
      if (guestDetails) {
        await generateToken();
      } else {
        guestToken = token;
      }
    };
    await generateToken();

    let data = {
      email: body["email"],
      token: guestToken,
    };

    let output = await db.GuestCustomer.create(data);
    console.log(output);
    helper.deliverResponse(
      res,
      200,
      { token: output?.token },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error while login as guest :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};
exports.varifyEmailOtp = async (req, res, next) => {
  try {
    const { body } = req;
    console.log(body  ,"body");
    // Validating otp
    if (!body?.email) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: 1,
          error_message: "No email provided ",
        }
      );
    }
    
    if (!body?.otp) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: 1,
          error_message: "No otp provided ",
        }
      );
    }
    
    // Find OTP details
    const otpDetailsExists = await db.OtpDetails.findOne({
      email: body?.email?.trim(),
    });
    
    if (!otpDetailsExists || otpDetailsExists?.otp != body?.otp) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: 1,
          error_message: "Invalid OTP",
        }
      );
    }
    
    // Find and update cart to set isVerified to true
    // const cart = await db.Cart.findOne({
    //   _id: body?.cart,
    // });
    
    // if (cart) {
      await db.Cart.updateOne(
        { _id: body?.cart},
        { $set: { isVarified: true } }
      );
    // }
    
    // Update OTP status to used
    await db.OtpDetails.updateOne(
      { _id: otpDetailsExists._id },
      { $set: { isUsed: true } }
    );
    
    helper.deliverResponse(
      res,
      200,
      {},
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error while verifying email OTP :: " + error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};



// exports.ContinueasGuest = async (req, res, next) => {
//   try {
//     const { body } = req;
//     //validating otp

//    console.log(body,"body");
//     let guestToken;
//     // saving customer in database
//     const generateToken = async () => {
//       // 
//       const token =body.token;
//       console.log(token,"token");
//       const guestDetails = await db.GuestCustomer.findOne({ token: token });
//       if (!guestDetails) {
//         // await generateToken();
//         const token = generateUniqueCode();
//       } 
//     };
//     //  await generateToken();

//     let data = {
//       // email: body["email"],
//       token: guestToken,
//       email: body["email"],
//       firstname: body["firstname"],
//       lastname: body["lastname"],
//       mobile: body["mobile"],
//       countryCode: body["countryCode"],
//     };

//     let output = await db.GuestCustomer.create(data);
//     console.log(output);
//     helper.deliverResponse(
//       res,
//       200,
//       { output},
//       {
//         error_code: messages.successResponse.error_code,
//         error_message: messages.successResponse.error_message,
//       }
//     );
//   } catch (error) {
//     console.log("Error while login as guest :: " + error);
//     helper.deliverResponse(
//       res,
//       422,
//       {},
//       {
//         error_code: messages.serverError.error_code,
//         error_message: messages.serverError.error_message,
//       }
//     );
//   }
// };
exports.ContinueasGuest = async (req, res, next) => {
  try {
    const { body } = req;

    let guestToken = body.token;

    // Function to generate a new token
    const generateToken = () => generateUniqueCode();

    // Check if token is provided, if not generate a new one
    if (!guestToken) {
      guestToken = generateToken();
    }
  
    // Check if a guest user with the token already exists
    let guestDetails = await db.GuestCustomer.findOne({ token: guestToken });

    // If no guest user exists, generate a new token
    if (!guestDetails) {
      guestToken = generateToken();
    } else {
      // If guest user exists, return the existing details
      return helper.deliverResponse(res, 200, { guestDetails }, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      });
    }

    // Prepare data for new guest user
    let data = {
      token: guestToken,
      email: body.email,
      firstname: body.firstname,
      areanumber: body.areanumber,
      lastname: body.lastname,
      mobile: body.mobile,
      countryCode: body.countryCode,
      countryName: body.countryName,
      deliveryAddress: body.deliveryAddress,
      additionalAddress: body.additionalAddress,
      coordinates: body.coordinates,
     
    };
   

    // Create new guest user
    let output = await db.GuestCustomer.create(data);
   
    // Send response
    return helper.deliverResponse(res, 200, { output }, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error while login as guest :: " + error);
    return helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};




exports.googleLogin = async (req, res) => {
  const settings = await settingsService.findOne();
  const { accessToken } = req.body;
  const { deviceToken, firebaseToken } = res?.locals?.user;
 
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    const userInfo = response.data;
    req.body.name = userInfo.name;
    req.body.email = userInfo.email;
    req.body.password = uuidv4();
    const referer = req.headers.referer;
    const loginTime=new Date();
    // const refererSource = location.parseRefererSource(referer);
    console.log("referer", referer);
    console.log("refererSource",  req.body.email);
    service.customerReferer(req.body.email, { referer: referer,loginTime:loginTime });
    // console.log("body",req.body,userInfo);
    

      //loop through the object and delete the null or empty elements

      if (req.body?.email) {
          const userDetails = await authService.getUser({ email: req.body?.email, isDelete: false });
          if (userDetails) {
              console.log("User already exists")  

              //Updating firebase token against customer
              if (firebaseToken && !userDetails.deviceTokens?.includes(firebaseToken)) {
                await authService.updateUser(
                  { _id: userDetails._id },
                  { $push: { deviceTokens: firebaseToken } }
                );
              }

              const token = jwt.sign({ userid: userDetails?.userid }, key.JWTSECRET, { expiresIn: key.JWT_EXPIRE });
              const cartDetails = await cartService.getCart({ deviceToken: deviceToken, isActive: true, isDelete: false });
              if (cartDetails) {
                  const customerDetails = await cartService.getCart({ 'customer': userDetails._id, isActive: true, isDelete: false, isPurchased: false });
                  if (customerDetails) {                    
                      let guestProducts = cartDetails?.products;
                      let customerProducts = customerDetails?.products;
                      guestProducts.forEach(itemA => {
                          const existsInB = customerProducts.some(itemB => String(itemB.product._id) === String(itemA.product._id));
                          if (!existsInB) {
                              customerProducts.push(itemA);
                          }
                      });

                      await cartService.updateCart(
                          { 'customer': userDetails._id, isActive: true, isDelete: false, isPurchased: false },
                          { customer: userDetails._id, products: customerProducts }
                      );

                      await cartService.updateCart({ deviceToken: deviceToken, isActive: true, isDelete: false }, { isDelete: true });
                  } else {
                      await cartService.updateCart(
                          { deviceToken: deviceToken, isActive: true, isDelete: false },
                          { customer: userDetails._id}
                      );
                  }
              }


              helper.deliverResponse(res, 200, {
                  email: req.body?.email,
                  accessToken: token
              }, {
                  "error_code": messages.successResponse.error_code,
                  "error_message": messages.successResponse.error_message
              });
          } else {
              console.log("User doesn't exist so we will create a new one")
             const referer=req.headers.referer;
              const response = await authService.createUser({
                  name: req.body?.name,
                  userid: await uuidv4(),
                  email: req.body?.email,
                  referer:referer,
                  registerMethod: 'Google',
                  deviceTokens : firebaseToken ? [firebaseToken] : []
              });

              if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                      "error_code": messages.serverError.error_code,
                      "error_message": messages.serverError.error_message
                  })
              } else {
                  const token = jwt.sign({
                      userid: response?.userid
                  }, key.JWTSECRET, { expiresIn: key.JWT_EXPIRE });
                  helper.deliverResponse(res, 200, {
                      email: body?.email,
                      accessToken: token
                  }, {
                      "error_code": messages.successResponse.error_code,
                      "error_message": messages.successResponse.error_message
                  });
              }
          }
      } else {
        helper.deliverResponse(res, 422, {}, {
              "error_code": messages.serverError.error_code,
              "error_message": messages.serverError.error_message
          });
      }
  } catch (error) {
      console.error("Error in googleLogin controller: ", error)
      helper.deliverResponse(res, 422, {}, {
          "error_code": messages.serverError.error_code,
          "error_message": messages.serverError.error_message
      })
  }
}

exports.facebookLogin = async (req, res) => {
  const settings = await settingsService.findOne();
  const { accessToken } = req.body;
  const { deviceToken, firebaseToken } = res?.locals?.user;
  
  try {
     
      if (accessToken) {
          const userInfoResponse = await axios.get("https://graph.facebook.com/me", {
            params: {
              fields: "id,name,email,picture.type(large)",
              access_token: accessToken,
            },
          })
          console.log("userInfoResponseuserInfoResponse",userInfoResponse);
          
          if (userInfoResponse?.data?.email) {
              const userDetails = await authService.getUser({ email: userInfoResponse?.data?.email, isDelete: false });
              if (userDetails) {

                //Updating firebase token against customer
                if (firebaseToken && !userDetails.deviceTokens?.includes(firebaseToken)) {
                  await authService.updateUser(
                    { _id: userDetails._id },
                    { $push: { deviceTokens: firebaseToken } }
                  );
                }
                
                  const token = jwt.sign({ userid: userDetails?.userid }, key.JWTSECRET, { expiresIn: key.JWT_EXPIRE });
                  const cartDetails = await cartService.getCart({ deviceToken: deviceToken, isActive: true, isDelete: false });
                  if (cartDetails) {
                      const customerDetails = await cartService.getCart({ 'customer.id': userDetails._id, isActive: true, isDelete: false, isPurchased: false });
                      if (customerDetails) {
                          let guestProducts = cartDetails?.products;
                          let customerProducts = customerDetails?.products;

                          guestProducts.forEach(itemA => {
                              const existsInB = customerProducts.some(itemB => String(itemB.product._id) === String(itemA.product._id));
                              if (!existsInB) {
                                  customerProducts.push(itemA);
                              }
                          });

                          await cartService.updateCart(
                              { 'customer.id': userDetails._id, isActive: true, isDelete: false, isPurchased: false },
                              { customer: { id: userDetails._id, refid: userDetails.userid }, products: customerProducts }
                          );

                          await cartService.updateCart({ deviceToken: deviceToken, refid: cartDetails?.refid, isActive: true, isDelete: false }, { isDelete: true });
                      } else {
                          await cartService.updateCart(
                              { deviceToken: deviceToken, refid: cartDetails?.refid, isActive: true, isDelete: false },
                              { customer: { id: userDetails._id, refid: userDetails.userid }, type: '1' }
                          );
                      }
                  }


                  helper.deliverResponse(res, 200, {
                      email: userInfoResponse?.data?.email,
                      accessToken: token
                  }, {
                      "error_code": messages.successResponse.error_code,
                      "error_message": messages.successResponse.error_message
                  });
              } else {
               
                  const response = await authService.createUser({
                      name: userInfoResponse?.data?.name,
                      userid: await uuidv4(),
                      registerMethod: 'Facebook',
                      email: userInfoResponse?.data?.email,
                      deviceTokens: firebaseToken ? [firebaseToken] : []
                  });

                  if (response instanceof Error) {
                    helper.deliverResponse(res, 422, {}, {
                          "error_code": messages.serverError.error_code,
                          "error_message": messages.serverError.error_message
                      })
                  } else {
                      const token = jwt.sign({
                          userid: response?.userid
                      }, key.JWTSECRET, { expiresIn: key.JWT_EXPIRE });
                      helper.deliverResponse(res, 200, {
                          email: userInfoResponse?.data?.email,
                          accessToken: token
                      }, {
                          "error_code": messages.successResponse.error_code,
                          "error_message": messages.successResponse.error_message
                      });
                  }
              }
          } else {
            helper.deliverResponse(res, 422, {}, messages.FB_EMAIL_NOTFOUND);
          }
      } else {
        helper.deliverResponse(res, 422, verifyResponse, messages.serverError);
      }
  } catch (error) {
      console.error("Error in facebookLogin controller: ", error)
      helper.deliverResponse(res, 422, error, messages.serverError);
  }
}
exports.updateLogoutTime = async (req, res) => {
  try {
    console.log(res?.locals,"response local")
    const { useremail } = req.body;
    // const { userid } = res?.locals?.user;
    const response = await service.update({ email: useremail }, { logoutTime: new Date() });
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, {}, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      helper.deliverResponse(res, 200, {}, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
      });
    }
  } catch (error) {
    console.log('Error caught in update logout time API :: ' + error);
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}
