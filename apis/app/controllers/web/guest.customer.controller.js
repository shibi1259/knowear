const helper = require("../../../util/responseHelper");
const { messages } = require("../../../config/constants");
const service = require("../../services/guest.customer.service");
const db = require("../../db/index");
const slug = require("../../../util/slug");
const e = require("express");

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

exports.create = async (req, res) => {
  try {
    const { body } = req;
    const generateToken = async () => {
      const token = generateUniqueCode();
      const guestDetails = await service.findOne({ token: token });
      if (guestDetails) {
        await generateToken();
      } else {
        body.token = token;
      }
    };
    body.slug = await slug.createSlug(db.GuestCustomer, body.name, {
      slug: body.name,
    });
    await generateToken();
    const guestDetails = await service.findOne({
      countryCode: body.countryCode,
      mobile: body.mobile,
    });
    if (guestDetails) {
      if (guestDetails["email"] == body["email"]) {
        helper.deliverResponse(
          res,
          200,
          { token: guestDetails.token },
          {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          }
        );
      } else {
        createGuest(res, body);
      }
    } else {
      createGuest(res, body);
    }
  } catch (error) {
    console.log("Error caught in create guest API :: " + error);
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

exports.update = async (req,res) => {
  const { body } = req;
  const guestDetails = await service.findOne({ token: body.token });
  console.log("guestDetails", guestDetails,body);

  if (guestDetails) {
    const response = await service.update({ token: body.token }, body);
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, response, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    } else {
      helper.deliverResponse(
        res,
        200,
        { token: response.token },
        {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        }
      );
    }
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
  }
};

const createGuest = async (res, body) => {
  const response = await service.create(body);
  if (response instanceof Error) {
    helper.deliverResponse(res, 422, response, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  } else {
    helper.deliverResponse(
      res,
      200,
      { token: response.token },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  }
};

exports.guestCustomerDetails = async (req, res) => {
  try {
    const { token } = req.params;
    const response = await service.findOne({ token: token });
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in create guest API :: " + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};
