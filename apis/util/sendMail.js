require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.sendMail = async (data, subject, content, HTMLContent) => {
  try {
    let params = {
      Source: `"Knowear" <${process.env.SES_SENDER}>`,
      Destination: { ToAddresses: [data] },
      Message: {
        Subject: { Data: subject, },
        Body: {
          Text: { Data: content },
          Html: { Data: HTMLContent, },
        },
      },
      ReplyToAddresses: [process.env.SES_SENDER],
    };

    const sendPromise = new AWS.SES({ apiVersion: '2010– 12– 01' }).sendEmail(params).promise();
    sendPromise.then(function (data) {
      console.log(data);
      return data
    }).catch(function (err) {
      console.log(err);
      return err
    });
  } catch (error) {
    console.log(error);
    return error
  }
}