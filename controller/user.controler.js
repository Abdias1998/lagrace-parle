/* global process */

/* global __dirname */
const User = require(`../modeles/user`);
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);

const jwt = require(`jsonwebtoken`);
const ObjectdId = mongoose.Types.ObjectId;

const sendEmail_request = require(`../utils/send.email`);

const sendEmail = sendEmail_request.sendEmail;
const sendPdf = sendEmail_request.sendPdf;
const sendBorderauSucees = sendEmail_request.borderauSucees;
const sendBorderauCancel = sendEmail_request.borderauCancel;
const senSouscriptionBorderau = sendEmail_request.souscription;
const validator = require(`validator`);
const async_handler = require(`express-async-handler`);
const setAllMajWords = require(`../utils/set.all.majword`);
const qrCode = require("qrcode");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

const path = require("path");
// const { dateFormat } = require("../utils/date");

// const { dateFormat } = require("../utils/date");

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

/*{Authentification controleur}*/
/**1...Inscription d'un utilisateur du groupe fanfare */
module.exports.register = async_handler(async (req, res) => {
  let user;

  const {
    firstName,
    lastName,
    partition,
    instrument,
    password,
    tel,
    sanguin,
    email,
    sexe,
  } = req.body;

  /*1 - Vérifiez maintenant si les données saisir respecte notre schéma de validation */

  if (!validator.isLength(firstName, { min: 2 }))
    return res.status(401).json({
      message: `Le texte du nom de famille est trop pétit`,
    });
  if (!validator.isLength(firstName, { max: 15 }))
    return res.status(401).json({
      message: `Le texte du nom de famille est trop long`,
    });
  if (!validator.isLength(lastName, { min: 3 }))
    return res.status(401).json({
      message: `Le texte du prénom est trop pétit`,
    });
  if (!validator.isLength(lastName, { max: 25 }))
    return res.status(401).json({
      message: `Le texte du prénom est trop long`,
    });
  /**Vérifiez s'il respecte le format d'un email grâce à l'expression régulier de validator xxxxxxx@xxxxx.xxx */
  if (!validator.isEmail(email))
    return res.status(401).json({
      message: `Saisissez un émail valide pour vous inscrire. ex:********@gmail.com`,
    });

  /*2 - Verifiez maintenant s'il s'est déja inscrit, il cherchera l'email ou le numéro de téléphone lors de l'insertion dans la bd avec la méthode findOne de mongoose puisqu'il est unique par utulisateur. L'erreur sera recuperer dans le bloc catch*/

  try {
    user = await User.findOne({ $or: [{ email }, { tel }] });
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayer plus tard ! `,
    });
  }
  /**Si l'email est trouver, lui renvoyé une réponse 403 qu'il est déja pris */
  if (user)
    return res.status(403).json({
      message: `L'utilisateur avec cet email ou tél existe déjà. Veuillez-vous connectez`,
    });
  /**Vérifez si le numéro de téléphone est un format du bénin , il doit avoir 8 nombres */
  if (!validator.isLength(tel, { min: 8, max: 8 }))
    return res.status(401).json({
      message: `Saisissez un numéro de téléphone du Bénin valide sans espace. Ex: 53000000`,
    });
  /**Permettre a notre user de metrtre un mot de passe sécurisé en le forçant à y mettre plus de 5  */
  if (!validator.isLength(password, { min: 5, max: 15 }))
    return res.status(401).json({
      message: `Choisissez un mot de passe à 5 caractère minimum et en dessous de 15 caractère maximum`,
    });
  /**Vérifer si les champs sont vides */
  if (validator.isEmpty(sexe))
    return res.status(401).json({
      message: `Veuillez choisir votre sexe`,
    });
  /* 3 - Crypter le mot de passe avec bcrypt avant l'insertion dans la bd , générer un code à 4 chiffre d'identification, puis génerer des informations dans notre code qr */

  /**Génerer un code à 4 chiffre ou le premier chiffre doit obligatoirement être un 0 */
  function generateCode() {
    let code = "";
    for (let i = 0; i < 3; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }
  const identification = 0 + generateCode();
  /**Crypter le mot de passe avant l'insertion avec bcrypt */
  const hashedPassword = bcrypt.hashSync(password, 10);
  /**Mettre du texte dans notre code qr avec le prénom, l'instrument et le code d'identification */
  /**la fonction si c'est un homme ou femme */

  // let phraseMrOrMrs;
  function IsManOrWife() {
    if (sexe === "Masculin") return "Mr";
    else return "Mme";
  }
  /**La fonction s'il met un groupe sanguin */

  function isSanguinActive() {
    if (sanguin !== "")
      return `
      <p>Son groupe sanguin est ${sanguin}</p>
      <a href=${process.env.CLIENT_URL}> Consulter le site web</a>
      <a tel:${process.env.TEL_PROPH}> Appeler ce numéros en cas de perte</a>
      `;
    else
      return `<div>
      <a href=${process.env.CLIENT_URL}> Consulter le site web</a>
      <a tel:${process.env.TEL_PROPH}> Appeler ce numéros en cas de perte</a>
      </div>`;
  }
  const data = `${IsManOrWife()} ${setAllMajWords(
    true,
    firstName
  )} ${setAllMajWords(
    true,
    lastName
  )} est membre du groupe PhilHarmonie La Grâce Parle, il joue au ${instrument}. ${isSanguinActive()}
 `;
  /**Générer un code qr */
  try {
    qrCode.toDataURL(data, async (err, url) => {
      if (err)
        return res.status(500).json({
          message: "Erreur interne du serveur, veuillez réessayer plus tard",
        });

      function isAdminPupitre() {
        if (email === process.env.ADMINPUPITRE) return true;
      }
      function isSuperAdmin() {
        if (
          email === process.env.ADMINPUPITRE ||
          email === process.env.USER_Proph ||
          email === process.env.USER_DRUM ||
          email === process.env.USER
        )
          return true;
      }
      function isAdminDev() {
        if (email === process.env.USER || email === process.env.USER_Proph)
          return true;
      }
      /**Enregister user dans la base de donnée */
      const user = await new User({
        firstName: setAllMajWords(true, firstName),
        lastName: setAllMajWords(
          true,
          lastName
        ) /**Mettre en majuscule(capitalise) touts nos premiers lettre ex: Abdias Mahougnon Emmanuel */,
        names: ` ${setAllMajWords(true, firstName)} ${setAllMajWords(
          true,
          lastName
        )}` /**Mettre le nom en uppercase et le prénom en capitalize  */,
        partition,
        instrument,
        identification: `${identification}`,
        tel,
        sexe,
        email,
        sanguin,
        password: hashedPassword,
        qrCode: url,
        isAdminPupitre:
          isAdminPupitre() /**Mettre à jours l'objet isAdmin si l'email est celle de userAdmin */,
        isSuperAdmin: isSuperAdmin(),
        isAdminDev: isAdminDev(),
        souscription: "1",
        isMember: true,
        // isMember: isSuperAdmin(),
      });
      user.save(); /**Enrégister l'utilisateur dans la bd */

      /**Template html pour l'envoi du code à l"email de l'user */
      fs.readFile("./template/register.html", "utf-8", async (err, data) => {
        if (err) {
          return res.status(401).json({ message: err });
        } else {
          const html = data
            .replace(
              /{name}/g,
              firstName
            ) /**Remplacer dynamiquement firstName qui se trouve dans register.html */
            .replace(/{code}/g, identification);

          await sendEmail(
            user.email,
            `Numéro d'identification personnelle`,
            html
          );
        }
      });
      /**Envoi du code sur le numéro de l'utilisateur */

      /**Réponse finale lorque tous se passe bien */

      return res.status(201).json({
        message: `Inscription réussie.Nous venons d'envoyer votre numéro d'identification personnele à 4 chiffre à votre adresse mail que vous pouvez consulter`,
      });
    });
  } catch (error) {
    res.status(403).json({
      message: `Erreur interne du serveur, veuillez réessayer plus tard`,
    });
  }
});

/***Crer une fonction pour les codes qr */
module.exports.codeQr = async_handler(async (req, res) => {
  /**Verifiez si l'user existe */
  let user;
  const id = req.params.id;
  try {
    user = await User.findById(id);
  } catch (error) {
    return res.status(500).json({ message: error });
  }

  if (!user) return res.status(400).json({ message: `Non authorisé` });
  function IsManOrWife() {
    if (user?.sexe === "Masculin") return "Mr";
    else return "Mme";
  }
  function isSanguinActive() {
    if (user.sanguin !== "")
      return `
    Son groupe sanguin est ${user.sanguin}.
    Appeler ce numéros en cas de perte ${process.env.TEL_PROPH}
      `;
    else
      return `
    Appeler ce numéros en cas de perte ${process.env.TEL_PROPH}
      `;
  }
  const data = `${IsManOrWife()} ${setAllMajWords(
    true,
    user.firstName
  )} ${setAllMajWords(
    true,
    user.lastName
  )} est membre du groupe PhilHarmonie La Grâce Parle, il joue au ${
    user.instrument
  }. ${isSanguinActive()}
 `;
  try {
    qrCode.toDataURL(data, async (err, url) => {
      if (err)
        return res.status(500).json({
          message: "Erreur interne du serveur, veuillez réessayer plus tard",
        });

      /**Enregister user dans la base de donnée */
      // const user = await new User({

      //   qrCode: url,
      // });
      // user.save(); /**Enrégister l'utilisateur dans la bd */
      await user.updateOne({
        qrCode: url,
      });

      return res.status(201).json({
        message: `Qr code enrégister`,
      });
    });
  } catch (error) {
    res.status(403).json({
      message: `Erreur interne du serveur, veuillez réessayer plus tard`,
    });
  }
});
/**2...Connexion d'un membre du groupe fanfare */
module.exports.login = async_handler(async (req, res) => {
  const { identifier, password } = req.body;

  /*1 - Vérifiez maintenant si les données saisir respecte nos schémas de validation */
  if (!identifier || !password)
    return res
      .status(401)
      .json({ message: `Veuillez remplir toutes les cases.` });

  /*2- Récuperer l'email ou le numéro de phone pour se connecter */
  let existingUser;

  if (validator.isEmail(identifier)) {
    existingUser = { email: identifier }; /**Accepte si c'est un email */
  } else if (validator.isMobilePhone(identifier, `any`)) {
    /**Acccepte si c'est un numéro de n'importe quel pays c'est pourquoi on à 'any' comme seconde valeur */
    existingUser = { tel: identifier };
  } else
    return res.status(400).json({
      message: `Veuillez saisir un émail ou un numéro de téléphone du Bénin valide.`,
    });
  /**Recuperer la valeur qui passe et le rechercher */
  User.findOne(existingUser)
    .then((user) => {
      if (!user)
        return res.status(401).json({
          message: `Vous n'avez pas de compte avec ces informations d'identification, veuillez vous inscrire en premier.`,
        });
      /*Vérifiez si quelqu'un à déja initialisé un changement de mot de passe */
      // if (user.resetPasswordExpires !== null)
      //   return res.status(401).json({
      //     message: `Veuillez changer votre mot de passe pour des raisons de sécurité si vous n'êtes pas l'auteur de la

      //     procédure de changement du mot de passe du ${dateFormat(
      //       user.resetPasswordExpires
      //     )}`,
      //   });

      /* 3 - Décrypter le mot de passe avant de le vérifiez avec celle de la base de donnée qvec bcrypt*/
      const passwordHashed = bcrypt.compareSync(password, user.password);
      if (!passwordHashed) {
        return res
          .status(401)
          .json({ message: `Votre mot de passe est incorrect.` });
      }
      /**Authentifer l'user dans le cookie avec son id personnel */
      const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRETE, {
        expiresIn: `7d` /**Duréé maximum de vie du token */,
      });

      /* 5 - Envoyer la réponse dans le cookie */

      res.cookie(String("fanfare"), token, {
        path: `/`, // Path cookie
        expires: new Date(
          Date.now() + 24 * 60 * 60 * 1000 * 7
        ) /**Durée de vie du cookie qui est de 7 jours */,
        httpOnly: true, //Only server
        sameSite: `lax`, //cross site, empêcher les réquêtes d'autres domaines
        secure: true, // https
      });

      /**Réponse finale quand il est authentifié */
      return res.status(200).json({ message: `Connection réussie` });
    })
    .catch((err) => {
      return res.status(500).send({
        message: `Erreur interne du serveur, veuillez réessayez plus tard ! ${err}`,
      });
    });
});
/**3...Lancement du procédure du changement du mot de passe oublié */
module.exports.forgetPassword = async_handler(async (req, res) => {
  const { email } = req.body;
  let existingUser;
  /**Vérifez si c'est un email ou un si il est vide */
  if (!validator.isEmail(email) || validator.isEmpty(email))
    return res.status(401).json({ message: `Saisissez un adress mail valide` });

  /**Rechercher l'utilisateur dans la base de donnée */
  try {
    existingUser = await User.findOne({
      email: email,
    });
  } catch (error) {
    res.status(500).json({
      message: `Erreur interne du serveur,veuillez reprendre l'opération du changement du mot de passe ${error}`,
    });
  }
  if (!existingUser)
    return res.status(401).json({
      message: `Un compte avec ce mail n'existe pas,veuillez vous inscrire d'abord si vous disposer pas d'un compte LGP `,
    });
  /**Rnvoyer un token dans url avec les l'identifiant de l'utilisateur qui expire dans aprés 24 heure */
  const resetToken = jwt.sign(
    { _id: existingUser._id },
    process.env.FORGET_PASSWORD_KEY,
    {
      expiresIn: 3600 * 24, // Expire après 24h
    }
  );
  /**Mettre à jour l'objet resetPasswordToken et resetPasswordExpires */
  await existingUser.updateOne({
    resetPasswordToken: resetToken,
    resetPasswordExpires: Date.now() + 3600000 * 24, // Expire après 24h
  });
  try {
    /**L'url à envoyer dans l'email */
    const url = `${process.env.CLIENT_URL}/reset/${resetToken}`;
    /**Lire notre template avant de l'envoyer par nodemailer */
    fs.readFile("./template/reset_password.html", "utf-8", (err, data) => {
      if (err) {
        return res.status(401).json({ message: err });
      } else {
        const html = data
          .replace(/{name}/g, existingUser.names)
          .replace(/{reset_link}/g, url)
          .replace(/{partition}/g, existingUser.partition)
          .replace(/{instrument}/g, existingUser.instrument);

        sendEmail(existingUser.email, `Réinitialisation de mot de passe`, html);
      }
    });
    /**Envoi du lien sur son numéro de téléphone */
  } catch (error) {
    res
      .status(500)
      .json({ message: `L'envoi d'email a échoué, veuillez recommencer` });
  }
  /**L'envoi d'email */
  const threeFirstWord = existingUser.email;
  res.status(200).json({
    message: `Nous venons d'envoyer un lien du changement du mot de passe par e-mail à ${threeFirstWord.substr(
      0,
      8
    )}*****@gmail.com. Vérifiez dans vos Spams si vous ne retrouvez par l'email, ce lien expirera dans les 24h.
     `,
  });
});
/**4...Changement du mot de passe avec un nouveau mot de passe */
module.exports.resetPassword = async_handler(async (req, res) => {
  const { newPass } = req.body;
  /**Vérifions si les informations dans notre url est bien celle de l'user ou il n'a pas été cliquer ou s'il a déjà expirer */
  try {
    /**Vérifer les données saisir par l'user */
    if (validator.isEmpty(newPass))
      return res.status(401).json({
        message: `Le champ mot de passe est vide`,
      });
    if (!validator.isLength(newPass, { min: 5, max: 15 }))
      return res.status(401).json({
        message: `Votre nouveau mot de passe doit contenir au moins 6 caractères`,
      });
    /**Verifie si le token est celle que nous avons générer avec un key forget_password_key  */
    const decoded = jwt.verify(
      req.params.token,
      process.env.FORGET_PASSWORD_KEY
    );
    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(403).json({
        message: `Authentification échoué, veuillez récommencez l'opération du changement du mot de passe.
`,
      });
    /**Vérifez si le lien à expirer */
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        message:
          "Le lien de réinitialisation a expiré ou a déjà été cliquer,veuillez récommencez l'opération du changement du mot de passe",
      });
    }
    /**Crypter le nouveau mot de passe en mettant à jour l'objet password, resetPasswordToken et resetPasswordExpires */
    const hashedPassword = bcrypt.hashSync(newPass, 10);
    await user.updateOne({
      resetPasswordToken: ``,
      resetPasswordExpires: ``,
      password: hashedPassword,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Votre lien de vérification à probablement expirer ou a déjà été cliquer. Veuillez recommencer le processus de changement du mot de passe. ${error}
`,
    });
  }
  /**Réponse finale  */
  return res.status(200).json({
    message:
      "Votre mot de passe a été changé avec succès. Veuillez-vous connectez à présent avec le nouveau mot de passe.",
  });
});

/**5...Mettre à jour le profil au cas ou les informations d'inscription sont mal saisir */
module.exports.update_profil = async_handler(async (req, res) => {
  const { firstName, lastName, tel, email, instrument, partition } = req.body;
  /**La méthode ObjectId de mongoose pour vérifer si le nombre de caractère est exacte à celle de mongoose */
  if (!ObjectdId.isValid(req.params.id))
    return res.status(404).send({ messsage: `Utulisateur inconnu` });
  /*2 - Vérifiez maintenant si les données saisir respecte notre schéma de validation */
  /**Mettre à jour 4 champs(nom,prénom,tel et email) */
  if (
    validator.isEmpty(firstName) ||
    validator.isEmpty(lastName) ||
    validator.isEmpty(email) ||
    validator.isEmpty(instrument) ||
    validator.isEmpty(partition) ||
    validator.isEmpty(tel)
  )
    return res.status(401).json({
      message: `Veuillez remplir touts les champs`,
    });
  if (
    !validator.isLength(firstName, { min: 2, max: 15 }) ||
    !validator.isLength(lastName, { min: 2, max: 25 })
  )
    return res.status(401).json({
      message: `Le nom ou le prénom est trop pétit ou trop long`,
    });
  if (!validator.isEmail(email))
    return res
      .status(401)
      .json({ message: `Votre nouvelle adress email est invalid` });
  if (!validator.isLength(tel, { min: 8, max: 8 }))
    return res.status(401).json({
      message: `Saisissez un nouveau numéro de téléphone du Bénin valide sans espace. Ex: 53000000`,
    });
  let user;
  user = await User.findById({ _id: req.params.id });
  if (!user)
    return res.status(403).json({ messsage: `L'identifiant n'existe pas` });

  /**Metrre à jour les informatio dans la base de donnéé */

  /**Si l'email est trouver, lui renvoyé une réponse 403 qu'il est déja pris */

  let existingUser;
  existingUser = await User.findOne({ email: email });
  if (existingUser && existingUser._id.toString() !== req.params.id)
    return res
      .status(401)
      .json({ message: `Cet émail est déjà utilisé par un utilisateur` });
  else
    try {
      User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            firstName: firstName,
            lastName: setAllMajWords(true, lastName),
            tel: tel,
            email: email,
            instrument: instrument,
            partition: partition,
            names: `${firstName.toUpperCase()} ${setAllMajWords(
              true,
              lastName
            )}`,
          },
        },
        {
          new: true,
        },
        (err, docs) => {
          /**Réponse finale */
          if (!err)
            return res.status(200).json({
              message: "Vos informations sont mises à jours",
              docs /**Renvoyer l'user sans son mot de passe */,
            });
          else
            return res.status(401).json({
              message: `L'utilisateur avec cet email existe déja, veuillez choisir un autre`,
            });
        }
      ).select(`-password`);
    } catch (error) {
      return res.status(500).json({
        message: `Erreur interne du serveur, veuillez réessayer plus tard !' ${error}`,
      });
    }
});

/*6...Changer le profil par défaut */
module.exports.upload_profil = async_handler(async (req, res) => {
  /**Vérifier si c'est un format jpg , jpeg ou png */
  if (
    req.file?.mimetype != `image/jpeg` &&
    req.file?.mimetype != `image/jpg` &&
    req.file?.mimetype != `image/png`
  )
    return res.status(404).json({
      message: `Veuillez choisir un format de fichier(.jpg, .jpeg, .png)`,
    });
  let user;
  /**Passer l'id de l'utilisateur pour la mise à jours */
  if (!ObjectdId.isValid(req.body.userId))
    return res.status(404).json({ messsage: `L'identifiant n'existe pas` });

  user = await User.findById({ _id: req.body.userId });
  if (!user)
    return res.status(403).json({ messsage: `L'identifiant n'existe pas` });

  try {
    await User.findByIdAndUpdate(
      req.body.userId,
      {
        $set: {
          // picture: `../image/user/${req.body.userId}.jpg`,

          picture: `${process.env.URL}/image/${req.body.userId}.jpg`,
        } /**sauvegader l'image avec son id pour qu'il soit unique même s'il change ses information après */,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
    return res
      .status(200)
      .json({ message: "Profil mise à jour, veuillez raffraîchir la page !" });
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayez plus tard ${error} !`,
    });
  }
});
/**7...Déconnexion du plateforme */
module.exports.logOut = async_handler(async (req, res) => {
  /**Récuperer le cookie */
  const cookies = req.headers.cookie;
  const preventToken = cookies?.split(`=`)[1];
  if (!preventToken) {
    return res
      .status(404)
      .json({ message: `Déconnexion échouée, veuillez réessayer plus tard` });
  }
  /**Vérifez si l'utilisateur est connecté avec le cookie stocké dans le navigateur */
  jwt.verify(String(preventToken), process.env.TOKEN_SECRETE, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: `Authentification échoué ${err}` });
    }
    res.clearCookie(`fanfare`);
    req.cookies = req.cookies || {};
    req.cookies[`fanfare`] = ``;
    /**Réponse finale */
    return res.status(200).json({ message: `Déconnexion` });
  });
});
/**7...Déconnexion du plateforme */
module.exports.logOutSession = async_handler(async (req, res) => {
  /**Récuperer le cookie */
  const cookies = req.headers.cookie;
  const preventToken = cookies?.split(`=`)[1];
  if (!preventToken) {
    return res
      .status(404)
      .json({ message: `Déconnexion échouée, veuillez réessayer plus tard` });
  }
  /**Vérifez si l'utilisateur est connecté avec le cookie stocké dans le navigateur */
  jwt.verify(String(preventToken), process.env.TOKEN_SECRETE, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: `Authentification échoué ${err}` });
    }
    // res.clearCookie(`fanfare`);
    // req.cookies = req.cookies || {};
    // req.cookies[`fanfare`] = ``;
    /**Réponse finale */
    return res.status(200).json({ message: `Déconnexion` });
  });
});

/**8...Reçevoir le pdf du règlement intérieur */
module.exports.generatePdf = async_handler(async (req, res) => {
  /*Vérifez si l'id est celle de mongoose*/
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).json({ message: `L'identifiant n'existe pas ` });
  }
  let user;
  try {
    /*Chercher l'utulisateur avec son id */
    user = await User.findById({ _id: req.params.id });
    if (!user)
      return res.status(403).json({ messsage: `L'identifiant n'existe pas` });
    /**Convertir le fichier en pdf avec pdfkit en insérent des textes plus stylisé*/
    const doc = new PDFDocument();
    /**Creer un fichier avec fs en utilisant pdfkit  */
    const filePath = path.join(__dirname, "../reglement", `reglement.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc
      .text("Le règlement du groupe à suivre", {
        align: "center",
        underline: true,
      })
      .text(
        `1-Responsabilités de chaque membre : Chaque membre du groupe est responsable de sa participation aux répétitions et aux performances, ainsi que de la préparation et de l'apprentissage des chansons.`
      )
      .text(
        `
        2-Horaires de répétition : Les répétitions auront lieu à un horaire convenu à l'avance et seront obligatoires pour tous les membres. Les absences doivent être signalées à l'avance et justifiées.

`
      )
      .text(
        `
        3-Matériel : Chaque membre est responsable de son propre matériel et doit veiller à ce qu'il soit en bon état de fonctionnement pour les répétitions et les performances.

`
      )
      .text(
        `
        4-Arrangements de performances : Les arrangements pour les performances, y compris les dates, les lieux et les horaires, seront discutés et convenus en groupe. Les membres doivent être disponibles pour toutes les performances prévues.

`
      )
      .text(
        `
        5-Règles de conduite : Tous les membres doivent se comporter de manière professionnelle et respectueuse envers les autres membres du groupe, les fans et les employeurs. Les comportements inappropriés, tels que l'utilisation de drogues ou d'alcool avant ou pendant les performances, ne sont pas tolérés en tant que membre du corps de Christ.

`
      )
      .text(
        `
        6-Décisions en groupe : Les décisions importantes concernant le groupe seront prises en considérant les opinions et les idées de tous les membres.

`
      )
      .text(
        `
        7-Modification du règlement intérieur : Ce règlement intérieur peut être modifié à tout moment si cela est nécessaire pour le bon fonctionnement du groupe

`
      );

    doc.end();
    await sendPdf(user.email, `règlement.pdf`);
    return res.status(200).json({ message: "Envoi du fichier" });
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayer plus tard ${error}`,
    });
  }
});

/**9...Supprimez un utilisateur du base de donnée */
module.exports.deleteUser = async_handler(async (req, res) => {
  /**Vérifez si l'id est conforme à cele de_id mongoose */
  if (!ObjectdId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ message: `Utulisateur inconnu ${req.params.id}` });
  }

  /**Rechercher l'identifiant avec l'id passer en params */
  let user;
  user = await User.findById({ _id: req.params.id });
  if (!user)
    return res.status(403).json({ messsage: `L'identifiant n'existe pas` });
  /**Si l'identifiant existe, le supprimer de la bse de donnée */
  await User.findByIdAndRemove(req.params.id, (error) => {
    if (!error)
      /**Réponse finale */
      return res
        .status(200)
        .json({ message: `L'utulisateur supprimez avec succèes` });
    else
      return res.status(500).json({
        message: `Erreur interne du serveur, veuillez réessayez plus tard la suppression de l'utilisateur ${req.params.id}`,
      });
  }).clone();
}); /**10...Récuperer touts nos utilisateurs */
module.exports.getAllUsers = async_handler(async (req, res) => {
  /**Recuperer avec la méthode find de mongoose sans les mots de passe */
  User.find((error, docs) => {
    if (!error) res.send(docs);
    else
      return res.status(500).json({
        message: `Vous pouvez pas récuperer les données d'utilisateur`,
      });
  })
    .select(`-password`)
    .sort({ firstName: 1 }); /**Renvoyer par ordre alphabétique */
});

/**11...Vérifiez l'id de la transaction du payement s'il est conforme à celle récu de Fedapay */
module.exports.sendIdTransaction = async_handler(async (req, res) => {
  const { idVerified } = req.body;
  /*Vérifier si l'id paaser en params respect les normes de mongoose */
  const id = req.params.id;
  if (!ObjectdId.isValid(id)) {
    return res.status(400).json({ message: `L'identifiant n'existe pas` });
  }
  /*Vérifiez si l'id est de 10 chiffre */
  if (!validator.isLength(idVerified, { min: 10, max: 10 }))
    return res.status(401).json({
      message: `La longeur de l'id de transaction que vous avez réçu de MTN n'est pas correcte. Vérifez bien les chiffres`,
    });
  /**Vérifiez si l'identifiant existe */

  const date = new Date(); // crée un objet Date avec la date et l'heure actuelles
  const jour = String(date.getDate()).padStart(2, "0"); // extrait le jour et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const mois = String(date.getMonth() + 1).padStart(2, "0"); // extrait le mois (en commençant par 0 pour janvier) et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const annee = date.getFullYear(); // extrait l'année
  const heures = String(date.getHours()).padStart(2, "0"); // extrait les heures et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const minutes = String(date.getMinutes()).padStart(2, "0"); // extrait les minutes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const secondes = String(date.getSeconds()).padStart(2, "0"); // extrait les secondes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const dateFormatee = `${jour}/${mois}/${annee} ${heures}:${minutes}:${secondes}`; // combine les valeurs pour créer la chaîne de date et heure formatée

  await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        idVerified: idVerified,
        dateVerified:
          dateFormatee /**La date ou il à soumis la reqête de vérification */,
      },
    },
    {
      new: true,
    },
    (err) => {
      if (!err)
        /**Reponse finale */
        return res.status(200).json({
          message:
            "Nous vérifions votre id de transaction, vous aurez une suite de réponse dans les 24h maximum",
        });
      else
        res.status(500).json({
          message: "Erreur interne du serveur, veuilllez réessayez plus tard",
        });
    }
  ).clone();
}); //No unsed in the app web

/**12...Valider la transaction envoyer */
module.exports.validateTransaction = async_handler(async (req, res) => {
  const { idUser, idTransaction } = req.body;
  /*Vérifiez si l'id passé est dans notre base de donné */
  let user;
  if (!ObjectdId.isValid(idUser)) {
    return res
      .status(400)
      .json({ message: `L'identifiant n'existe pas ${idUser}` });
  }
  user = await User.findById({ _id: idUser });
  /**Si l'utilisateur n'existe pas */
  if (!user)
    return res.status(400).json({
      message: "L'identifiant n'existe pas",
    });
  /**Si l'id est vérifez alors on met à jour le champ idVerified en mettant 1 */
  function getTimestampMinusNumber(num) {
    const currentDate = new Date();
    const timestamp = Math.floor(currentDate.getTime() / 1000); // convertir en secondes
    const result = timestamp - num;

    // formater en nombre à 10 chiffres en ajoutant des zéros en début si nécessaire
    const formattedResult = String(result).padStart(10, "0");

    return Number(formattedResult);
  }
  try {
    if (user.idVerified === idTransaction) {
      await user.updateOne({
        idVerified: "1",
      });

      /**Renvoyer le borderau à notre user avec les informations comme son nom complet, l'id de transaction */
      const doc = new PDFDocument();
      const filePath = path.join(
        __dirname,
        "../borderau/reussie",
        `${user._id}_carte.pdf`
      );

      doc.pipe(fs.createWriteStream(filePath));
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Bordereau de paiement", { align: "left" });
      doc.moveDown();
      doc.font("Helvetica").fontSize(12);

      // Ajout des informations de l'entreprise
      doc.text(`La Grâce Parle`, {
        align: "left",
      });
      doc.moveDown();

      doc.text(
        `Reference du compte: #acc_9820942086    N° Recu:nrct${getTimestampMinusNumber(
          9876543211
        )}`
      );
      doc.moveDown();
      doc.text(
        `Lot 1515 Maison Jesus est rois                            Reference: tlx_${getTimestampMinusNumber(
          1234567891
        )}`
      );
      doc.moveDown();
      doc.text(
        `+229 53 03 78 32                                                Id Transaction: ${user.idVerified}`
      );
      doc.moveDown();
      doc.text(
        `adinsiabdias@gmail.com                                     Date:${user.dateVerified}`
      );
      doc.moveDown();
      doc.text(
        `Moyen de paiement accepté: MTN-Mobile Money/Moov-Mobile Money`,
        {
          align: "right",
        }
      );

      doc.moveDown();

      // Ajout des détails du paiement
      doc.text(`Payé par : `);

      doc.text(`Nom complet : ${user.names}`, {
        align: "left",
      });
      doc.text(`Email : ${user.email}`, {
        align: "left",
      });

      doc.moveDown();

      // Ajout des informations du client

      doc.text(
        `2500 payé par ${user.names} pour sa carte numérique d'identification personnelle`,
        { align: "center" }
      );
      // Finalisation du document PDF
      doc.end();
      /** */
      await sendBorderauSucees(user.email, `${user._id}_carte.pdf`);
      return res.status(200).json({
        message: `Borderau de carte d'identification envoyé à ${user.email}`,
      });
    } else {
      /**Si l'id ne correspond pas, mettre son idVeried à 0 */

      await user.updateOne({
        idVerified: "0",
      });

      /**Renvoyer le borderau à notre user avec les informations comme son nom complet, l'id de transaction lui indiquant que l'id n'est pas juste*/
      const doc = new PDFDocument();
      const filePath = path.join(
        __dirname,
        "../borderau/echec",
        `${user._id}_carte.pdf`
      );
      doc.pipe(fs.createWriteStream(filePath));
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Bordereau de paiement", { align: "left" });
      doc.moveDown();
      doc.font("Helvetica").fontSize(12);

      // Ajout des informations de l'entreprise
      doc.text(`La Grâce Parle`, {
        align: "left",
      });
      doc.text(
        `Reference du compte: #acc_9820942086    N° Recu:nrct${getTimestampMinusNumber(
          9876543210
        )}`
      );
      doc.text(
        `Lot 1515 Maison Jesus est rois                            Reference: tlx_${getTimestampMinusNumber(
          1234567891
        )}`
      );
      doc.text(
        `+229 53 03 78 32                                                Id Transaction: ${user.idVerified}`
      );
      doc.text(
        `adinsiabdias@gmail.com                                     Date:${user.dateVerified}`
      );
      doc.text(`Moyen de paiement: MTN-Mobile Money/ Movv-Mobile Money`, {
        align: "right",
      });

      doc.moveDown();

      // Ajout des détails du paiement
      doc.text(`Transaction non éffectué par: `);

      doc.text(`${user.names}`, {
        align: "left",
      });
      doc.text(`${user.email}`, {
        align: "left",
      });

      doc.moveDown();

      // Ajout des informations du client

      doc.text(
        `Vous avez sûrement saisir l'id de transaction mal, si c'est le cas, veuillez écrire aux administrateur du groupe pour une correction dans un bref délai.`,
        { align: "center" }
      );
      // Finalisation du document PDF
      doc.end();
      /** */
      await sendBorderauCancel(user.email, `${user._id}_carte.pdf`);
      return res.status(200).json({
        message: `Le borderau de transaction échoué été envoyé par mail à ${user.email}`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayez plus tard ${error}`,
    });
  }
}); //No unsed in the app web
/**13...Recevoir son borderau de paiement s'il veut l'avoir sur la plateforme */
module.exports.receiveTransaction = async_handler(async (req, res) => {
  /*Vérifiez si l'id passé est dans notre base de donné */
  let user;
  if (!ObjectdId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ message: `L'identifiant n'existe pas ${req.params.id} ` });
  }
  user = await User.findById({ _id: req.params.id });

  if (!user)
    return res.status(400).json({
      message: "L'identifiant n'existe pas ",
    });
  try {
    await sendBorderauSucees(user.email, `${user._id}_carte.pdf`);
    return res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur" + error });
  }
}); //No unsed in the app web
/**Permissonnaire */
module.exports.permissionnaire = async_handler(async (req, res) => {
  const now = new Date(); // Récupérez la date et l'heure actuelle

  function formatDate(date) {
    const options = {
      timeZone: "Africa/Porto-Novo", // Fuseau horaire de l'Afrique de l'Ouest (Bénin)
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleString("fr-FR", options);
  }
  const update = {
    status: "Permissionnaire",
    heure: "Nul",
    heurePermis: formatDate(now),
  };
  try {
    await User.findByIdAndUpdate(
      req.params.userId,
      {
        $inc: { nombrePermission: 1 }, // Incrémente le champ nombreRetard de 1
        $set: update, // Met à jour les autres champs
      },
      { new: true }
    );

    return res.status(200).json({ message: "Mise à jour" });
  } catch (error) {
    res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayez plus tard ${error}`,
    });
  }
});
/**14...Faire une liste de présence */
module.exports.updateUserStatus = async_handler(async (req, res) => {
  const now = new Date(); // Récupérez la date et l'heure actuelle

  function formatDate(date) {
    const options = {
      timeZone: "Africa/Porto-Novo", // Fuseau horaire de l'Afrique de l'Ouest (Bénin)
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleString("fr-FR", options);
  }
  const userAgent = req.useragent;
  const phoneType = userAgent.isMobile ? `Mobile ` : `Desktop`;
  const phoneName = userAgent.source.match(/\((.*?)\)/);

  const phoneNameString = phoneName ? phoneName[1] : "Non disponible";

  if (
    now.getDay() === 1 &&
    now.getHours() === 17 &&
    now.getMinutes() >= 0 &&
    now.getMinutes() <= 59
  ) {
    // Si la date est un lundi entre 18h00 et 18h59

    const update = {
      heure: formatDate(now),
      status: "A l'heure",
      phoneType: phoneType,
      phoneName: phoneNameString,
    };

    // try {
    //   await User.findByIdAndUpdate(req.params.userId, update, { new: true });
    //   return res.status(200).json({ message: "Mise à jour" });
    // }
    try {
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          $inc: { nombrePonctuelle: 1 }, // Incrémente le champ nombreRetard de 1
          $set: update, // Met à jour les autres champs
        },
        { new: true }
      );

      return res.status(200).json({ message: "Mise à jour" });
    } catch (error) {
      res.status(500).json({
        message: `Erreur interne du serveur, veuillez réessayer plus tard ${error}`,
      });
    }
  } else if (
    now.getDay() === 1 &&
    now.getHours() >= 18 &&
    now.getHours() <= 22
  ) {
    // Si la date est un lundi entre 19h00 et 20h59

    const update = {
      heure: formatDate(now),
      status: "En retard",
      phoneType: phoneType,
      phoneName: phoneNameString,
    };

    // try {
    //   await User.findByIdAndUpdate(req.params.userId, update, { new: true });
    //   return res.status(200).json({ message: "Mise à jour" });
    // }
    try {
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          $inc: { nombreRetard: 1 }, // Incrémente le champ nombreRetard de 1
          $set: update, // Met à jour les autres champs
        },
        { new: true }
      );

      return res.status(200).json({ message: "Mise à jour" });
    } catch (error) {
      return res.status(500).json({
        message: `Erreur interne du serveur, veuillez réessayer plus tard ${error}`,
      });
    }
  } else {
    return res
      .status(400)
      .send(
        "Les membres ne peuvent pas valider leur présence pour le moment. Veuillez commencer les lundis à partir de 18h00 à 20h59"
      );
  }
});

/**15...Noter les membres lors des évaluations */
module.exports.Evaluer = async_handler(async (req, res) => {
  /**Verifier si le membre existe existe */
  const { note } = req.body;
  const update = { average: note };
  try {
    await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    return res.status(200).json({ message: "Note ajouter" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Erreur interne du serveur ${error}` });
  }
});

module.exports.sendPdfListe = async_handler(async (req, res) => {
  const now = new Date(); // Récupérez la date et l'heure actuelle
  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  }

  try {
    const users = await User.find(
      {},
      "names lastName instrument heure status isSuperAdmin " // Ajoutez la propriété 'nombreRetard' à la requête
    );
    // Filtrer les utilisateurs par propriété isSuperAdmin et isMember
    const filteredUsers = users.filter(
      (membre) => membre.isSuperAdmin === false || membre.isMember === true
    );

    // Trier les utilisateurs par ordre alphabétique des noms (proprieté 'names')
    const sortedUsers = filteredUsers.sort((a, b) =>
      a.names.localeCompare(b.names)
    );
    // Créer un tableau HTML pour afficher tous les utilisateurs avec leurs prénoms, noms, heures et statuts
    let tableHTML = `
      <table style=" font-family: Arial, sans-serif; width: 210mm; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #ECECEC; border-bottom: 1px solid #CCCCCC; text-align: center;">
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Membre</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Instrument</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Heure d'arrivée</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Statut</th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedUsers.forEach((user) => {
      tableHTML += `
          <tbody>
            <tr style="border-bottom: 1px solid #CCCCCC;">
              <td style="padding: 2px; border: 1px solid #CCCCCC;">${
                user.names
              }</td>
              <td style="padding: 2px; border: 1px solid #CCCCCC;">${
                user.instrument
              }</td>
              <td style="padding: 2px; border: 1px solid #CCCCCC;">${
                user.heure
              }</td>
              <td style="padding: 2px; border: 1px solid #CCCCCC;color:${
                (user.status === "Absent" && "red") ||
                (user.status === "A l'heure" && "green") ||
                (user.status === "En retard" && "#DB9A02") ||
                (user.status === "Permissionnaire" && "orange")
              }">${user.status}</td> 
            </tr>
          </tbody>
        `;
    });
    tableHTML += `
        </tbody>
      </table>
      <p>Date:${formatDate(now)} </p>
      <p>Signature du prophète: </p>
    `;
    // let user;
    // user = await User.findOne({ _id: req.params.id });
    // if (!user)
    //   return res.status(401).json({
    //     message: `Vous n'êtes pas sûrement un administrateur`,
    //   });
    const mailOptions = {
      from: `La Grâce Parle <${process.env.USER}>`,
      to: process.env.USER,
      subject:
        "Liste de présence des éléments de la PhilHarmonie La Grâce Parle",
      html: tableHTML, // Ajouter le tableau HTML contenant tous les utilisateurs avec leurs prénoms, noms, heures et statuts dans le corps du message
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: error });
      } else {
        res.json({
          message: "La liste de présence a été envoyé avec succès.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// module.exports.sendPdfListeMember = async_handler(async (req, res) => {
//   try {
//     const users = await User.find(
//       {},
//       "names partition instrument identification isSuperAdmin"
//     );

//     // Filtrer les utilisateurs par propriété isSuperAdmin et isMember
//     const filteredUsers = users.filter(
//       (membre) => membre.isSuperAdmin === false || membre.isMember === true
//     );

//     // Trier les utilisateurs par ordre alphabétique des noms (proprieté 'names')
//     const sortedUsers = filteredUsers.sort((a, b) =>
//       a.names.localeCompare(b.names)
//     );

//     // Créer un tableau HTML pour afficher tous les utilisateurs triés par ordre alphabétique des noms
//     let tableHTML = `
//       <table style=" font-family: Arial, sans-serif; width: 210mm; border-collapse: collapse;">
//         <thead>
//           <tr style="background-color: #ECECEC; border-bottom: 1px solid #CCCCCC; text-align: center;">
//             <th style="padding: 2px; border: 1px solid #CCCCCC;">Nom complet</th>
//             <th style="padding: 2px; border: 1px solid #CCCCCC;">Partition</th>
//             <th style="padding: 2px; border: 1px solid #CCCCCC;">Instrument</th>
//             <th style="padding: 2px; border: 1px solid #CCCCCC;">Code d'id</th>
//           </tr>
//         </thead>
//         <tbody>
//     `;

//     sortedUsers.forEach((user) => {
//       tableHTML += `
//         <tbody>
//           <tr style="border-bottom: 1px solid #CCCCCC;">
//             <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.names}</td>
//             <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.partition}</td>
//             <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.instrument}</td>
//             <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.identification}</td>
//           </tr>
//         </tbody>
//       `;
//     });

//     tableHTML += `
//       </tbody>
//     </table>
//   `;

//     // ... (le reste du code reste inchangé) ...
//     let user;
//     user = await User.findOne({ _id: req.params.id });
//     if (!user)
//       return res.status(401).json({
//         message: `Vous n'êtes pas sûrement un administrateur`,
//       });
//     const mailOptions = {
//       from: `La Grâce Parle <${process.env.USER}>`,
//       to: user.email,
//       subject: "Liste des éléments de la PhilHarmonie La Grâce Parle",
//       html: tableHTML, // Ajouter le tableau HTML contenant tous les utilisateurs avec leurs prénoms, noms, heures et statuts dans le corps du message
//     };

//     transporter.sendMail(mailOptions, (error) => {
//       if (error) {
//         return res.status(500).json({ message: error });
//       } else {
//         res.json({
//           message: "La liste des membres a été envoyé avec succès.",
//         });
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error });
//   }
// });
module.exports.sendPdfListeMember = async_handler(async (req, res) => {
  try {
    const users = await User.find(
      {},
      "names nombrePonctuelle nombreRetard nombreAbsent nombrePermission  isSuperAdmin"
    );

    // Filtrer les utilisateurs par propriété isSuperAdmin et isMember
    const filteredUsers = users.filter(
      (membre) => membre.isSuperAdmin === false || membre.isMember === true
    );

    // Trier les utilisateurs par ordre alphabétique des noms (proprieté 'names')
    const sortedUsers = filteredUsers.sort((a, b) =>
      a.names.localeCompare(b.names)
    );

    // Créer un tableau HTML pour afficher tous les utilisateurs triés par ordre alphabétique des noms
    let tableHTML = `
      <table style=" font-family: Arial, sans-serif; width: 210mm; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #ECECEC; border-bottom: 1px solid #CCCCCC; text-align: center;">
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Nom complet</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">A l'heure</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Retard</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Absent</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Permission</th>
            <th style="padding: 2px; border: 1px solid #CCCCCC;">Présent</th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedUsers.forEach((user) => {
      tableHTML += `
        <tbody>
          <tr style="border-bottom: 1px solid #CCCCCC;">
            <td style="padding: 2px; border: 1px solid #CCCCCC;">${
              user.names
            }</td>
            <td style="color:green;padding: 2px; border: 1px solid #CCCCCC;">${
              user?.nombrePonctuelle
            }</td>
            <td  style="color:red;padding: 2px; border: 1px solid #CCCCCC;">${
              user?.nombreRetard
            }</td>
            <td style="color:red;padding: 2px; border: 1px solid #CCCCCC;">${
              user?.nombreAbsent
            }</td>
            <td style="color:orange;padding: 2px; border: 1px solid #CCCCCC;">${
              user?.nombrePermission
            }</td>
            <td style="color:green;padding: 2px; border: 1px solid #CCCCCC;">${
              user?.nombreRetard + user?.nombrePonctuelle
            }</td>
          </tr>
        </tbody>
      `;
    });

    tableHTML += `
      </tbody>
    </table>
  `;

    // ... (le reste du code reste inchangé) ...
    let user;
    user = await User.findOne({ _id: req.params.id });
    if (!user)
      return res.status(401).json({
        message: `Vous n'êtes pas sûrement un administrateur`,
      });
    const mailOptions = {
      from: `La Grâce Parle <${process.env.USER}>`,
      to: user.email,
      subject:
        "Tableau de présence des éléments de la PhilHarmonie La Grâce Parle",
      html: tableHTML, // Ajouter le tableau HTML contenant tous les utilisateurs avec leurs prénoms, noms, heures et statuts dans le corps du message
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: error });
      } else {
        res.json({
          message: "La liste des membres a été envoyé avec succès.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**17...Renvoyer la liste de l'évaluation*/
module.exports.sendPdfListeEvaluation = async_handler(async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstName lastName identification instrument average isSuperAdmin"
    ); // Récupérer tous les utilisateurs avec leurs prénoms, noms, instrument, average,identification

    // Créer un tableau HTML pour afficher tous les utilisateurs avec leurs prénoms, noms, identification, instrument et average
    let tableHTML = `
      <table style="width: 210mm; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #ECECEC; border-bottom: 1px solid #CCCCCC; text-align: center;">
      <th style="padding: 2px; border: 1px solid #CCCCCC;">Nom</th>
      <th style="padding: 2px; border: 1px solid #CCCCCC;">Prénom</th>
      <th style="padding: 2px; border: 1px solid #CCCCCC;">Identification</th>
      <th style="padding: 2px; border: 1px solid #CCCCCC;">Instrument</th>
      <th style="padding: 2px; border: 1px solid #CCCCCC;">Notes</th>
    </tr>
        </thead>
        <tbody>
    `;

    users
      .filter(
        (membre) => membre.isSuperAdmin === false || membre.isMember === true
      )
      // .slice(0, 80)
      .sort()
      .forEach((user) => {
        tableHTML += `
       <tbody>
    <tr style="border-bottom: 1px solid #CCCCCC;">
      <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.firstName}</td>
      <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.lastName}</td>
      <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.identification}</td>
      <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.instrument}</td>
      <td style="padding: 2px; border: 1px solid #CCCCCC;">${user.average}</td>
    </tr>
    </tbody>

      `;
      });

    tableHTML += `
        </tbody>
      </table>
    `;

    const mailOptions = {
      from: `La Grâce Parle <${process.env.USER}>`,
      // to: process.env.ADMINPUPITRE,
      to: process.env.USER,
      subject:
        "Liste de l'évaluation des membres du groupe PhilHarmonie La Grâce Parle",
      html: tableHTML, // Ajouter le tableau HTML contenant tous les utilisateurs avec leurs prénoms, noms, heures et statuts dans le corps du message
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        res.status(500).json({ message: error });
      } else {
        return res.status(200).json({
          message:
            "Le fichier a bien été envoyer, vous pouvez l'imprimer maintenant",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }

  // }
});

module.exports.souscrireUnMembre = async_handler(async (req, res) => {
  /*Vérifiez si l'id passé est dans notre base de donné */
  let user;
  const now = new Date(); // Récupérez la date et l'heure actuelle
  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }
  function getTimestampMinusNumber(num) {
    const currentDate = new Date();
    const timestamp = Math.floor(currentDate.getTime() / 1000); // convertir en secondes
    const result = timestamp - num;

    // formater en nombre à 10 chiffres en ajoutant des zéros en début si nécessaire
    const formattedResult = String(result).padStart(10, "0");

    return Number(formattedResult);
  }
  if (!ObjectdId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ message: `L'identifiant n'existe pas ${req.params.id} ` });
  }
  user = await User.findById({ _id: req.params.id });

  if (!user)
    return res.status(400).json({
      message: "L'identifiant n'existe pas ",
    });
  try {
    await user.updateOne({
      souscription: "1",
    });

    /**Renvoyer le borderau à notre user avec les informations comme son nom complet, l'id de transaction */
    const doc = new PDFDocument();
    const filePath = path.join(
      __dirname,
      "../souscription",
      `${user._id}_souscription.pdf`
    );

    doc.pipe(fs.createWriteStream(filePath));
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Bordereau de paiement", { align: "left" });
    doc.moveDown();
    doc.font("Helvetica").fontSize(12);

    // Ajout des informations de l'entreprise
    doc.text(`La Grâce Parle`, {
      align: "left",
    });
    doc.moveDown();
    doc.text(
      `Reference du compte: #acc_9820942086    N° Recu:nrct${getTimestampMinusNumber(
        1123456789
      )}`
    );
    doc.moveDown();
    doc.text(
      `Lot 1515 Maison Jesus est rois                            Reference: tlx_${getTimestampMinusNumber(
        1987654321
      )}`
    );
    doc.moveDown();
    doc.text(
      `+229 53 03 78 32                                                 Id Transaction générer: ${now}`
    );
    doc.moveDown();
    doc.text(
      `adinsiabdias@gmail.com                                     Date:${formatDate(
        now
      )}`
    );
    doc.moveDown();
    doc.text(`Moyen de paiement accepté: MTN-Mobile Money/Moov-Mobile Money`, {
      align: "right",
    });

    doc.moveDown();

    // Ajout des détails du paiement
    doc.text(`Payé par : `);

    doc.text(`Nom complet :${user.names}`, {
      align: "left",
    });
    doc.text(`Email :${user.email}`, {
      align: "left",
    });

    // Ajout des informations du client

    doc.text(
      `750 f payé par ${user.names} pour sa souscription sur l'application PhilHarmonie La Grâce Parle`,
      { align: "center" }
    );
    // Finalisation du document PDF
    doc.end();
    /** */

    await senSouscriptionBorderau(user.email, `${user._id}_souscription.pdf`);
    res.status(200).json({
      message: `Utilisateur souscrire, vous pouvez profitez maintenant des avantages qu'offre l'application pour façiliter la tâche et l'amélioration de performance de nous tous. Merçi et à bientôt ${user.names}`,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}); //No unsed in the app web

/**Incrémneter à chaque payement */
module.exports.payement = async_handler(async (req, res) => {
  /**Payer les 500f chaque lundi ou dans la sémaine */
  const { idTransaction } = req.body;
  let user;
  try {
    user = User.findById({ _id: req.params.id });
    if (!user)
      return res.status(403).json({ message: `Vous n'êtes pas autorisé` });
    user.updateOne({
      payementId: idTransaction,
    });
    return res
      .status(200)
      .json({ message: `Nous vérifions votre id dans les plus bref délail` });
  } catch (error) {
    return res.status(500).json({ message: `Erreur interne du serveur` });
  }
}); //No unsed in the app web

module.exports.validatePayement = async_handler(async (req, res) => {
  const { userId, value } = req.body;
  let user;
  try {
    user = User.findById({ _id: userId });
    if (!user)
      return res.status(403).json({ message: `Vous n'êtes pas autorisé` });

    user.updateOne({
      payementIncrement: +value,
    });
    return res.status(201).json({ message: `Opération éffectué` });
  } catch (error) {
    return res.status(500).json({ message: `Erreur interne du serveur` });
  }
}); //No unsed in the app web

// L'information d'un seul utilisateurs
module.exports.userInfo = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send("Id Inconnue" + req.params.body);
  }

  User.findById(req.params.id, (err, docs) => {
    if (!err) res.status(200).json({ message: docs });
    else
      return res.status(500).json({
        message: "Id de l'utilisateur est inconnu",
      });
  }).select("-password");
};

module.exports.onResetAllEvaluer = async_handler(async (req, res) => {
  try {
    const result = await User.updateMany({}, { $set: { average: "" } });
    res.status(200).json({
      message: `Mise à jour réussie de ${result.nModified} documents`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour des documents",
    });
  }
});
module.exports.onResetAll = async_handler(async (req, res) => {
  try {
    const result = await User.updateMany(
      {},
      { $set: { phoneName: "", status: "", heure: null, phoneType: "" } }
    );
    res.status(200).json({
      message: `Mise à jour réussie de ${result.nModified} documents`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour des documents",
    });
  }
});

module.exports.onReset = async_handler(async (req, res) => {
  try {
    const updateResult = await User.updateMany(
      { status: { $in: ["", null] } },
      {
        $set: { status: "Absent", heure: "Null" },
        $inc: { nombreAbsent: 1 }, // Incrémente le champ nombreAbsent de 1
      }
    );

    res.status(200).json({ message: "Mise à jour réussie", updateResult });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des utilisateurs",
      error: err.message,
    });
  }
});

module.exports.remeberEvenement = async_handler(async (req, res) => {
  const rehearsalDate = req.body.rehearsalDate; // Date de la répétition
  const subject = req.body.subject; // Sujet de la répétition
  const members = await User.find(); // Récupération de la liste des membres

  // Envoi d'un e-mail à chaque membre
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  members.slice(0, 30).forEach((member) => {
    const mailOptions = {
      from: `La Grâce Parle <${process.env.USER}>`,
      to: member.email,
      subject: subject,
      html: `<p>Bonjour ${member.names}</p>
      <p style="text-align:'justify'">${rehearsalDate}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("E-mail envoyé : " + info.response);
      }
    });
  });

  return res
    .status(200)
    .json({ message: "Rappels d'évènement envoyés avec succès !" });
}); //No unsed in the app web

module.exports.ReceiveNotificationDelectingUser = async_handler(
  async (req, res) => {
    let exisntingUser;
    try {
      exisntingUser = await User.findOne({ _id: req.params.id });
      if (exisntingUser) {
        const deleteUser = jwt.sign(
          { _id: exisntingUser._id },
          process.env.FORGET_PASSWORD_KEY,
          {
            expiresIn: 3600 * 24, // Expire après 24h
          }
        );
        /**Mettre à jour l'objet resetPasswordToken et resetPasswordExpires */
        await exisntingUser.updateOne({
          deleteUserToken: deleteUser,
          deleteUserExpires: Date.now() + 3600000 * 24, // Expire après 24h
        });

        /**L'url à envoyer dans l'email */
        const url = `${process.env.CLIENT_URL}/delete/${deleteUser}/${exisntingUser._id}`;
        /**Template html pour l'envoi du code à l"email de l'user */
        fs.readFile("./template/delete.html", "utf-8", async (err, data) => {
          if (err) {
            return res.status(401).json({ message: err });
          } else {
            const html = data
              .replace(
                /{name}/g,
                exisntingUser.names
              ) /**Remplacer dynamiquement firstName qui se trouve dans register.html */
              .replace(/{code}/g, exisntingUser.identification)
              .replace(/{reset_link}/g, url);

            await sendEmail(
              process.env.USER,
              `Suppression d'un utilisateur`,
              html
            );
          }
        });

        return res.status(200).json({
          message: `Démande de suppression en cours de traitement......`,
        });
      } else return res.status(401).json({ message: `Démande non exécuté` });
    } catch (error) {
      return res.status(500).json({
        message: `Erreur interne du serveur,veuillez réessayez plus tard`,
      });
    }
  }
);

module.exports.confirmDelete = async_handler(async (req, res, next) => {
  /**Verifie si le token est celle que nous avons générer avec un key forget_password_key  */
  const decoded = jwt.verify(req.params.token, process.env.FORGET_PASSWORD_KEY);
  try {
    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(403).json({
        message: `Authentification échoué, veuillez récommencez l'opération de suppression de l'user.
`,
      });
    /**Vérifez si le lien à expirer */
    if (user.deleteUserExpires < Date.now()) {
      return res.status(403).json({
        message:
          "Le lien de réinitialisation a expiré ou a déjà été cliquer,veuillez récommencez l'opération de suppression",
      });
    }
    await user.updateOne({
      deleteUserToken: ``,
      deleteUserExpires: ``,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Erreur intere du serveur ${error}` });
  }
  next();
});
module.exports.findUserByEmailorTel = async_handler(async (req, res) => {
  const { identifier } = req.body;
  /*2- Récuperer l'email ou le numéro de phone pour se connecter */
  let existingUser;
  if (validator.isEmail(identifier)) {
    existingUser = { email: identifier }; /**Accepte si c'est un email */
  } else if (validator.isMobilePhone(identifier, `any`)) {
    /**Acccepte si c'est un numéro de n'importe quel pays c'est pourquoi on à 'any' comme seconde valeur */
    existingUser = { tel: identifier };
  } else
    return res.status(400).json({
      message: `Veuillez saisir un émail ou un numéro de téléphone du Bénin valide.`,
    });

  User.findOne(existingUser)
    .then((user) => {
      if (!user)
        return res.status(401).json({
          message: `Vous n'avez pas de compte avec ces informations d'identification, veuillez vous inscrire en premier.`,
        });

      /**Réponse finale quand il est authentifié */
      return res.status(200).send(user);
    })
    .catch((err) => {
      return res.status(500).send({
        message: `Erreur interne du serveur, veuillez réessayez plus tard ! ${err}`,
      });
    });

  //   // .select(`-password`)
  //   .then((user) => {
  //     if (!user)
  //       return res.status(401).json({
  //         message: `Vous n'avez pas de compte avec ces informations d'identification. Veuillez vous inscrire`,
  //       });

  //     /**Réponse finale quand il est authentifié */
  //     return res.status(200).json(user);
  //   })
  //   .catch((err) => {
  //     return res.status(500).json({
  //       message: `Erreur interne du serveur, veuillez réessayez plus tard ! ${err}`,
  //     });
  //   });
});

module.exports.isMemberSouscription = async_handler(async (req, res) => {
  const id = req.params.id;

  let existingUser;
  try {
    existingUser = await User.findById(id);
    if (!existingUser)
      return res.status(400).json({ message: `L'utilisateur n'existe pas` });
    await existingUser.updateOne({
      isMember: true,
    });
    return res.status(200).json({
      message: `${existingUser.names} avec le code ${existingUser.identification} est devenue membre du PhilHarmonie La Grâce Parle `,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Erreur interne du serveur ${error}` });
  }
});
