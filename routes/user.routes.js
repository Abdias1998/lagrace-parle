const router = require("express").Router();
const auth_controller = require("../controller/user.controler");

const partition_controller = require("../controller/partition.controller");
const middleware = require("../middlewre/verify.token");

const multer = require("multer");

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./partition");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
// const uploads = multer({ storage: storages });
const uploads = multer({
  storage: storages,
  limits: { fileSize: 7 * 1024 * 1024 },
});
router.get(
  "/read",
  partition_controller.readPartition
); /**Lire une partition */
router.post(
  "/create",
  uploads.array("partition", 50),
  partition_controller.createPartition
); /**Créer une partition */
/**La prémière liste de présence de 50 personne */

router.get("/fiche/:id", auth_controller.sendPdfListeMember);
/*Multer callback function */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./image");
  },

  filename: (req, file, cb) => {
    cb(null, `${req.body.userId}.jpg`);
  },
});
const upload = multer({ storage: storage });

//Auth router
/**Inscription de l'utilisateur */
router.post("/register", auth_controller.register);

/**Reçevoir le pdf du règlément intérieur du groupe fanfare */
router.post(
  "/pdf/get/:id",
  middleware.verifyToken,
  auth_controller.generatePdf
);

/**Envoyer son id de transaction après le payement via Fedapay */
router.post(
  "/verified/:id",
  middleware.verifyToken,
  auth_controller.sendIdTransaction
);

/**Valider la transaction du payement via Fedapay en lui envoyant son borderau de payement */
router.post(
  "/validate",
  middleware.verifyToken,
  auth_controller.validateTransaction
);

/**Recevoir son borderau directement sur le site */
router.get(
  "/receive/:id",
  middleware.verifyToken,
  auth_controller.receiveTransaction
);

/**Vérifiez si son token est valide en renvoyant ses informations sans son mot de passse*/
router.get("/jwt", middleware.verifyToken, middleware.getUser);
/**Télécharger un fichier de profil */
router.post(
  "/upload",
  upload.single("user"),
  middleware.verifyToken,
  auth_controller.upload_profil
);

/**Faire la liste de présence toutls les lundis à partir de 17h00 à 19h30 */
router.post(
  "/liste/:userId",
  middleware.verifyToken,
  auth_controller.updateUserStatus
);
router.post(
  "/permission/:userId",
  middleware.verifyToken,
  auth_controller.permissionnaire
);
/**Evaluer les membres */
router.post("/note/:id", auth_controller.Evaluer);

/**La liste d'évaluation */

router.get("/note", auth_controller.sendPdfListeEvaluation);

/**Connexion */
router.post("/login", auth_controller.login);

router.get("/liste", middleware.verifyToken, auth_controller.sendPdfListe);
/**Procédure de changement du mot de passe */
router.post("/forget", auth_controller.forgetPassword);

router.put("/souscriptionMember/:id", auth_controller.isMemberSouscription);

router.post(
  "/deleteUser/:id",
  auth_controller.ReceiveNotificationDelectingUser
);

/**Souscrire un membre pour les 3 premier mois */
router.post("/souscription/:id", auth_controller.souscrireUnMembre);

router.post("/findUser", auth_controller.findUserByEmailorTel);
/**Mettre un nouveau mot de passe */
router.put("/reset/:token", auth_controller.resetPassword);
// router.put("/reset/:delete", auth_controller.confirmDelete);

/**Déconnexion */

router.post("/logout", middleware.verifyToken, auth_controller.logOut);
router.post(
  "/logoutSession",
  middleware.verifyToken,
  auth_controller.logOutSession
);

/**Mettre à jour ses informations de profil */
router.put(
  "/update/:id",
  middleware.verifyToken,
  auth_controller.update_profil
);

/**Suppromer un utilisateur de la base de donnée */
router.delete(
  "/delete/:token/:id",
  auth_controller.confirmDelete,
  auth_controller.deleteUser
);

/**Récuperer touts les utilisateurs */

router.get("/", middleware.verifyToken, auth_controller.getAllUsers);
/**Récuperer les infos d'un utilisateur */
router.get("/:id", middleware.verifyToken, auth_controller.userInfo);
router.delete(
  "/delete_partition/:id",
  middleware.verifyToken,
  partition_controller.deletePartition
);

/**Mettre à jour après avoir rèçu le pdf */
router.put("/reset", middleware.verifyToken, auth_controller.onReset);
router.put("/resetAll", middleware.verifyToken, auth_controller.onResetAll);
router.put(
  "/resetAllEvaluer",
  middleware.verifyToken,
  auth_controller.onResetAllEvaluer
);
router.post(
  "/remember",
  middleware.verifyToken,
  auth_controller.remeberEvenement
);
module.exports = router;
