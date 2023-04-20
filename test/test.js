const date = new Date(); // crée un objet Date avec la date et l'heure actuelles
const jour = String(date.getDate()).padStart(2, "0"); // extrait le jour et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
const mois = String(date.getMonth() + 1).padStart(2, "0"); // extrait le mois (en commençant par 0 pour janvier) et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
const annee = date.getFullYear(); // extrait l'année
const heures = String(date.getHours()).padStart(2, "0"); // extrait les heures et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
const minutes = String(date.getMinutes()).padStart(2, "0"); // extrait les minutes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
const secondes = String(date.getSeconds()).padStart(2, "0"); // extrait les secondes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
const dateFormatee = `${jour}/${mois}/${annee} ${heures}:${minutes}:${secondes}`; // combine les valeurs pour créer la chaîne de date et heure formatée
console.log(dateFormatee);
