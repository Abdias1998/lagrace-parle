const USER = [
  {
    name: "Adinsi Abdias",
    partition: "Soprano",
    status: "A l'heure",
  },
  {
    name: "Adinsi Morel",
    partition: "Alto",
    status: "Retard",
  },
  {
    name: "Adinsi Ines",
    partition: "Alto",
    status: "A l'heure",
  },
  {
    name: "Adinsi Priscille",
    partition: "Ténor",
    status: "Absent",
  },
  {
    name: "Adinsi Priscille",
    partition: "Ténor",
    status: "A l'heure",
  },
  {
    name: "Adinsi Léon",
    partition: "Ténor",
    status: "Absent",
  },
];

// Compter le nombre d'utilisateurs Absents par partition
const absentCounts = {};
USER.forEach((user) => {
  const { partition, status } = user;
  if (status === "Absent") {
    if (!absentCounts[partition]) {
      absentCounts[partition] = 1;
    } else {
      absentCounts[partition]++;
    }
  }
});

// Trouver la partition avec le plus grand nombre d'utilisateurs Absents
let maxAbsentPartition = null;
let maxAbsentCount = 0;

for (const partition in absentCounts) {
  const count = absentCounts[partition];
  if (count > maxAbsentCount) {
    maxAbsentCount = count;
    maxAbsentPartition = partition;
  }
}

// Générer le rapport
let report =
  "Rapport des partitions avec le plus grand nombre d'utilisateurs Absents :\n";
if (maxAbsentPartition !== null) {
  report += `Partition avec le plus grand nombre d'Absents : ${maxAbsentPartition}\n`;
  report += `Nombre d'utilisateurs Absents : ${maxAbsentCount}\n`;
} else {
  report += "Aucune partition avec des utilisateurs Absents trouvée.\n";
}

console.log(report);

// Compter les utilisateurs par partition et par statut
const counts = {};
USER.forEach((user) => {
  const { partition, status } = user;
  if (!counts[partition]) {
    counts[partition] = {};
  }
  if (!counts[partition][status]) {
    counts[partition][status] = 1;
  } else {
    counts[partition][status]++;
  }
});

// Générer le paragraphe
let paragraph = "Récapitulatif des utilisateurs :\n";
for (const partition in counts) {
  paragraph += `Partition : ${partition}\n`;
  for (const status in counts[partition]) {
    const count = counts[partition][status];
    paragraph += `- Statut "${status}" : ${count} utilisateur(s)\n`;
  }
}

console.log(paragraph);
