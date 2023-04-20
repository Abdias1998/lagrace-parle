/* global process */
/* global __dirname */
const nodemailer = require("nodemailer");
const path = require("path");
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: Number(process.env.EMAIL_PORT),
  secure: Boolean(process.env.SECURE),
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
/**Function principale d'envoi d'email */
module.exports.sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: `La Grâce Parle <${process.env.USER}>`,
      to: email,
      subject: subject,
      html: text,
    });

    console.log("Email envoyé");
  } catch (error) {
    console.log("Email not sent" + error);
  }
};
module.exports.sendPdf = async (email, fileName) => {
  try {
    const mailOptions = {
      from: `La Grâce Parle <${process.env.USER}>`,
      to: email,
      subject: "Le règlement intérieur du centre LGP",
      text: "Le fichier pdf des bonnes conduites à tenir au sein du groupe",
      attachments: [
        {
          filename: fileName,
          path: path.join(__dirname, "../reglement", fileName),
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(`L'envoi des règles de conduite à échoué ${error}`);
      } else {
        return console.log(`L'envoi des règles de conduite réussie ${info}`);
      }
    });

    console.log("Email envoyé");
  } catch (error) {
    console.log("Email not sent" + error);
  }
};
module.exports.borderauSucees = async (email, fileName) => {
  const mailOptions = {
    from: `La Grâce Parle <${process.env.USER}>`,
    to: email,
    subject: "Borderau de paiement",

    text: "Votre borderau de paiement de votre carte numérique d'identification personnelle",
    attachments: [
      {
        // path: fileName,

        filename: fileName,

        path: path.join(__dirname, "../borderau/reussie", fileName),
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return console.log(`L'envoi d'émail échoué ${error}`);
    } else {
      return console.log(`L'envoi d'émail réussie`);
    }
  });
};
module.exports.borderauCancel = async (email, fileName) => {
  const mailOptions = {
    from: `La Grâce Parle <${process.env.USER}>`,
    to: email,
    subject: "Transaction non éffectué",
    text: "L'opération de traitement à échoué",
    attachments: [
      {
        filename: fileName,

        path: path.join(__dirname, "../borderau/echec", fileName),
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`L'envoi d"émail à échoué ${error}`);
    } else {
      return console.log(`L'envoi d'émail réussie ${info}`);
    }
  });
};

module.exports.souscription = async (email, fileName) => {
  const mailOptions = {
    from: `La Grâce Parle <${process.env.USER}>`,
    to: email,
    subject: "Votre souscription à l'application réussie",
    text: "Borderau de souscription",
    attachments: [
      {
        filename: fileName,

        path: path.join(__dirname, "../souscription", fileName),
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`L'envoi d"émail à échoué ${error}`);
    } else {
      return console.log(`L'envoi d'émail réussie ${info}`);
    }
  });
};
