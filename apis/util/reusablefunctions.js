const db = require("../app/db");

async function updatePayMentLogs(referenceKey, status = "failed") {
  // success failed
  try {
    await db.PaymentGatewayLogs.findOneAndUpdate({ referenceKey }, { status });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { updatePayMentLogs };
