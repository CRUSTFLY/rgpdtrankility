import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Footer, PageNumber } from "docx";
import archiver from "archiver";
import express from "express";
import { PassThrough } from "stream";

/**
 * Retourne { pdfBase64, docxBase64, zipBase64 }.
 */
 
// ===== Variable pour le nom du fichier =====
const nomFichier = "Politique de confidentialité générale RGPD"; // <-- change ici le nom du document

export async function generateRGPD(nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege) {

      // --- Texte ---
const titre = nomFichier;
const introduction = `
Le présent document est établi au nom de la ${entreprise} sus nommée ${sigle}.
	`;
    const soustitre1  = `
1. Politique de confidentialité
	`;
    const texte1  = `
${entreprise} s’engage fermement à protéger votre sphère privée.\n
La présente politique de confidentialité (la Politique) s’applique au traitement de vos données personnelles en relation avec l’utilisation de nos services et à l’exécution de nos prestations.
	`;
	 
    const soustitre2  = `
2. Qui sommes-nous ?
	`;
    const texte2  = `
Le responsable du traitement est l’entreprise qui détermine lesquelles de vos données personnelles sont traitées, à quelles fins et de quelle manière. En ce qui concerne le traitement de vos données personnelles en vertu de la présente Politique, nous agissons en tant que responsable du traitement et sommes donc responsables du traitement connexe, y compris de vos données personnelles.\n
En cas de questions concernant la présente Politique ou tout autre problème lié à la protection des données, vous pouvez nous contacter aux coordonnées ci-dessous :
	`;
    const texte22  = `
${entreprise}
${adressesiege}
${cpsiege} ${villesiege}
Par téléphone : ${numtelsiege}
Par email : dpo@neosys-info.fr
	`;	 

    const soustitre3  = `
3. Les données personnelles que nous traitons
	`;
    const texte3  = `
${entreprise} peut traiter les données personnelles suivantes, vous concernant :
	`;	

    const puces3 = [
        "Données à caractère personnel courantes",
        "RH : vie personnelle (situation familiale, identité ayants-droits mutuelle …)",
        "RH : vie professionnelle (CV, scolarité formation professionnelle, distinctions …)",
        "RH : informations d’ordre économique et financier (revenus, situation financière, situation fiscale …)",
		"RH : Données de connexion (identifiants / mot de passe, adresses IP, journaux d’événements …)",
		"RH : données de gestion des déplacements : permis conduire",
		"Données fournisseurs : nom contact, email, téléphone",
		"Données « patients » : NIR, nom, prénom, adresse, contact de confiance, sexe, date naissance, n° téléphone, coordonnées AMELI / mutuelle / ayants-droits",
		"Données « Familles, enfants » : nom, prénom, photo (pas obligatoire), livret de famille, certificat médical et de vaccination, email, tél., RIB, revenus, n° NIR, n° CAF (CAFPRO et aides), avis imposition, entreprise et profession (Ville de PAU, TEREGA, TOTAL, Hôpital de Pau)",
		"Données à caractère personnel perçues comme sensibles",
		"Numéro de sécurité sociale (NIR)",
		"Données bancaires (RIB)",
		"Données médicales dans le cadre de certains examens dentaires",
		"Données personnes protégées : prisonniers, demandeurs d’asile, handicapé, tutelles",
		"Nationalité : expatriés, réfugiés",
      ];
	
    const texte32 = `	  
Des données concernant des enfants sont traités, dans le cadre de la « Petite Enfance » (identité, photo, date naissance, carnet vaccinations …).\n
Ces données peuvent également comprendre des données sensibles, c’est-à-dire des données qui demandent une protection plus élevée. Nous ne traitons pas ces informations, sauf si vous y consentez au préalable.\n
Vous n’êtes pas obligé de nous fournir ces informations. Toutefois, veuillez noter que si vous ne souhaitez pas partager ces données avec nous, vous ne pourrez possiblement pas utiliser l’ensemble de nos services.\n
De façon générale, nous recueillons ces informations directement auprès de vous. Cependant, nous pouvons également recueillir de temps à autre vos données personnelles à partir d’autres sources, par exemple pour maintenir vos informations à jour en utilisant des sources accessibles au public. Nous avons besoin de vos données personnelles uniquement dans le cadre de la bonne exécution de nos prestations. \n
Par ailleurs, si vous nous fournissez des données personnelles par l’intermédiaire d’un tiers, nous nous appuyons sur la légalité de cette divulgation et vous demandons de vous assurer que vous êtes autorisé à partager ces informations avec nous.\n
De plus, ${entreprise} vise à assurer que vos données personnelles sont exactes, complètes et actuelles, mais nous nous attendons à ce que vous mettiez à jour ou corrigiez vos informations personnelles chaque fois qu’il s’avère nécessaire.
`;

    const soustitre4  = `
4. Comment nous utilisons vos données personnelles
	`;
    const texte4  = `
Nous utilisons vos données personnelles dans les situations suivantes :
	`;
    const puces4 = [
        "Pour communiquer avec vous, notamment lorsque vous nous contactez par téléphone, par e-mail ou au moyen de notre formulaire de contact sur le Site web",
        "Pour exécuter nos prestations ainsi qu’à remplir nos obligations contractuelles",
        "Pour promouvoir nos services, notamment par l’envoi d’alertes, de mises à jour, de bulletins d’information, d’invitations à des événements",
        "Pour se conformer à nos obligations légales, réglementaires et de gestion de risques, notamment en établissant, exerçant ou défendant des actions en justice",
      ];
	  
    const soustitre5  = `
5. Sur quelle base nous utilisons vos données personnelles
	`;
    const texte5  = `
Nous traitons vos données personnelles sur les bases juridiques suivantes :
	`;
    const puces5 = [
        "L’exécution d’un contrat",
        "Nos intérêts légitimes",
        "Votre consentement",
        "Le respect des obligations et exigences légales et réglementaires",
      ];
	  
    const soustitre6  = `
6. Prise de décision individuelle automatisée
	`;
    const texte6  = `
La « prise de décision individuelle automatisée » concerne les décisions qui reposent uniquement sur des moyens automatisés et qui entraînent des effets juridiques négatifs ou d’autres effets négatifs similaires pour vous.\n
Le « profilage » est un processus par lequel des données personnelles sont traitées automatiquement pour évaluer, analyser ou prévoir des aspects personnels, par exemple le rendement professionnel, la situation économique, la santé, les préférences personnelles, les intérêts, la fiabilité, le comportement, le lieu ou les déplacements.\n
Nous n’utilisons pas ces méthodes pour utiliser et traiter vos données personnelles.
	`;
	
    const soustitre7  = `
7. Avec qui nous partageons vos données personnelles
	`;
    const texte7  = `
Nous pouvons partager vos données personnelles avec des tiers de confiance, y compris :
	`;
    const puces7 = [
        "Les administrations liées à nos activités : AMELI, organismes sociaux",
        "Les mutuelles",
        "Les fournisseurs auxquels nous sous-traitons certains services d’assistance, tels que les prestataires de services informatiques",
        "Auditeurs",
		"Nos partenaires qui peuvent être amenés à mettre en œuvre nos solutions logicielles ou à exercer des activités de conseil",
      ];
    const texte72  = `
Aux fins énoncées dans la présente Politique et lorsque cela est nécessaire, nous pouvons partager vos données personnelles avec des tribunaux, des autorités règlementaires, des agences gouvernementales et des autorités policières. Bien que cela soit peu probable, nous pouvons être amenés à divulguer vos données personnelles pour nous conformer aux exigences légales ou réglementaires. Nous ferons tout notre possible pour vous avertir au préalable, à moins que la loi ne nous l’interdise.
	`;

    const soustitre8  = `
8. Pays avec lesquels nous transférons vos données personnelles
	`;
    const texte8  = `
Nous ne transférerons aucune donnée personnelle à des destinataires à l’étranger.
	`;

    const soustitre9  = `
9. Cookies
	`;
    const texte9  = `
Un cookie est un petit fichier en format texte composé de lettres et de chiffres que nous conservons sur votre navigateur ou sur le disque dur de votre ordinateur, si vous y consentez. Notre Site web utilise les cookies pour vous distinguer des autres utilisateurs de notre Site web. Cela nous aide à vous offrir une meilleure expérience lorsque vous naviguez sur notre Site web et nous permet également d’améliorer notre Site web.\n
Avant que les cookies ne soient placés sur votre ordinateur ou votre appareil, une fenêtre de dialogue apparaît et vous demander votre accord pour placer ces cookies. En continuant à naviguer sur notre Site web, vous acceptez que nous utilisions des cookies.\n
Notre Site web n’utilise pas de cookie.
	`;

    const soustitre10  = `
10. Comment nous protégeons vos données personnelles
	`;
    const texte10  = `
Nous mettons en œuvre diverses mesures techniques et organisationnelles pour contribuer à protéger vos données personnelles contre tout accès, utilisation, divulgation, altération ou obstruction non autorisés.\n
En particulier, nous prenons les mesures techniques et organisationnelles nécessaires pour assurer un niveau de protection des données adéquat et adapté au risque lié au traitement concerné. À l’exception des autorités policières dans des circonstances limitées, seuls nos employés ou d’autres personnes qui ont besoin d’accéder à vos informations afin d’exercer leurs fonctions sont autorisés à le faire.\n
Lorsque vous utilisez notre Site web, nous nous assurons la transmission sécurisée de vos informations de votre ordinateur à nos serveurs en utilisant un logiciel de chiffrement. Toutefois, en raison de la nature ouverte inhérente de l’Internet, nous ne pouvons pas garantir que les communications entre vous et nous seront exemptes d’accès non autorisés par des tiers.
	`;

    const soustitre11  = `
11. Comment nous conservons vos données personnelles
	`;
    const texte11  = `
Nous conservons vos données personnelles aussi longtemps que cela est nécessaire aux fins pour lesquelles elles ont été collectées et aussi longtemps que nous avons un intérêt légitime à conserver des données personnelles (par exemple, pour faire valoir ou défendre des créances, ou à des fins d’archivage et de sécurité informatique). Nous conservons également vos données personnelles aussi longtemps qu’elles sont soumises à une obligation légale de conservation.
	`;
	
    const soustitre12  = `
12. Changements à la présente Politique
	`;
    const texte12  = `
La présente Politique peut être mise à jour à l’avenir, notamment si nous modifions le traitement de vos données personnelles ou si une nouvelle législation entre en vigueur. Nous informons activement les personnes dont les données personnelles sont enregistrées chez nous de ces changements dans le cas où ceux-ci sont significatifs, si cela est possible, sans effort disproportionné. En général, la Politique de confidentialité dans sa version actuelle au début du traitement respectif s’applique toutefois au traitement des données.
	`;

    const soustitre13  = `
13. Vos droits
	`;
    const texte13  = `
Selon le droit applicable, vous disposez du droit de :
	`;
    const puces13 = [
        "Demander d’accès à vos données personnelles",
        "Demander de la modification des données personnelles que nous détenons à votre sujet, si elles sont inexactes",
        "Demander d’effacer vos données personnelles, si nous n’avons aucune raison valable de continuer à les traiter",
        "Demander la cessation du traitement de vos données personnelles (lorsque nous nous fondons sur un intérêt légitime), si vous souhaitez vous opposer au traitement pour ce motif",
		"Retirer votre consentement au traitement de vos données personnelles",
		"Demander la limitation du traitement de vos données personnelles",
        "Demander le transfert de vos données personnelles à une autre partie",
        "Formuler une réclamation auprès de la CNIL dont le site internet est accessible à l’adresse suivante www.cnil.fr et le siège est situé 3 Place de Fontenoy – TSA 80715 - 75334 Paris Cedex 07",
      ];

  // --- Génération PDF dans un buffer ---
  const pdfDoc = new PDFDocument({ margin: 50 });
  const pdfStream = new PassThrough();
  const pdfChunks = [];
  pdfStream.on("data", chunk => pdfChunks.push(chunk));
  const pdfFinished = new Promise((resolve, reject) => {
    pdfStream.on("end", resolve);
    pdfStream.on("error", reject);
  });
  pdfDoc.pipe(pdfStream);
  
// Polices 
const fontsDir = path.resolve("public/fonts"); 

if (fs.existsSync(path.join(fontsDir, "calibril.ttf"))) 
pdfDoc.registerFont("Calibri Light", path.join(fontsDir, "calibril.ttf")); 

if (fs.existsSync(path.join(fontsDir, "calibrib.ttf"))) 
	pdfDoc.registerFont("Calibri Bold", path.join(fontsDir, "calibrib.ttf"));
		
		  // ---- Nettoyage du texte ----
		const clean = txt =>
		(txt || "")
		.replace(/[“”«»]/g, '"')
		.replace(/[’‘]/g, "'")
		.replace(/[–—]/g, "-")
		.replace(/[•·‣◦▪]/g, "-")
		.replace(/[^\x09\x0A\x0D\x20-\x7EÀ-ÿ€]/g, "") // supprime caractères invisibles
		.trim();

		// === PAGE 1 : Page de garde ===
		const pageWidth = pdfDoc.page.width;
		const pageHeight = pdfDoc.page.height;

		// Titre centré verticalement
		pdfDoc
			.font("Calibri Bold")
			.fontSize(32)
			.fillColor("#ebc015")
			.text(titre, pageWidth / 2 - 250, pageHeight / 2 - 100, {
				width: 500,
				align: "center",
			});

		// Logo centré sous le titre
		const logoPath = "public/images/logo_rgpd_trankility.png";
		if (fs.existsSync(logoPath)) {
			pdfDoc.image(logoPath, pageWidth / 2 - 75, pageHeight / 2, { width: 150 });
		} else {
			console.warn("⚠️ Logo introuvable :", logoPath);
		}

		// === PAGE 2 : Contenu principal ===
		pdfDoc.addPage();
		
		//drawHeader();
		//pdfDoc.on("pageAdded", drawHeader);
		
		// ---- Titres ----
		//pdfDoc.font("Calibri Light").fontSize(22).fillColor("#ebc015").text(clean(titre), { align: "center"}).moveDown(1);

		// ---- Introduction ----
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(introduction), { align: "justify"}).moveDown(1);
		
		// ---- Bloc 1 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre1), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte1)).moveDown(1);

		// ---- Bloc 2 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre2), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte2)).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte22), {indent: 30}).moveDown(1);

		// ---- Bloc 3 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre3), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte3)).moveDown(1);
		puces3.forEach(point => {pdfDoc.font("Calibri Light").fontSize(11).text(`• ${point}`, { indent: 20, continued: false }).moveDown(0.3);}); //Puces
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte32), { align: "justify" }).moveDown(1);

		// ---- Bloc 4 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre4), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte4)).moveDown(1);
		puces4.forEach(point => {pdfDoc.font("Calibri Light").fontSize(11).text(`• ${point}`, { indent: 20, continued: false }).moveDown(0.3);}); //Puces

		// ---- Bloc 5 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre5), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte5)).moveDown(1);
		puces5.forEach(point => {pdfDoc.font("Calibri Light").fontSize(11).text(`• ${point}`, { indent: 20, continued: false }).moveDown(0.3);}); //Puces

		// ---- Bloc 6 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre6), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte6)).moveDown(1);

		// ---- Bloc 7 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre7), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte7)).moveDown(1);
		puces7.forEach(point => {pdfDoc.font("Calibri Light").fontSize(11).text(`• ${point}`, { indent: 20, continued: false }).moveDown(0.3);}); //Puces
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte72)).moveDown(1);
	
		// ---- Bloc 8 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre8), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte8)).moveDown(1);

		// ---- Bloc 9 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre9), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte9)).moveDown(1);
	
		// ---- Bloc 10 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre10), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte10)).moveDown(1);
		
		// ---- Bloc 11 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre11), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte11)).moveDown(1);
		
		// ---- Bloc 12 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre12), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte12)).moveDown(1);

		// ---- Bloc 13 ----
		pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre13), { align: "left"}).moveDown(1);
		pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000").text(clean(texte13)).moveDown(1);
		puces13.forEach(point => {pdfDoc.font("Calibri Light").fontSize(11).text(`• ${point}`, { indent: 20, continued: false }).moveDown(0.3);}); //Puces
		
  pdfDoc.end();
  await pdfFinished;
  const pdfBuffer = Buffer.concat(pdfChunks);
  const pdfBase64 = pdfBuffer.toString("base64");

  // --- DOCX ---
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [ new TextRun({ text: "Politique de confidentialité RGPD", bold: true, size: 36 }) ],
          alignment: AlignmentType.CENTER
        }),
        ...texte1.split("\n").map(line => new Paragraph({ children: [ new TextRun({ text: line }) ] }))
      ]
    }]
  });
  const docxBuffer = await Packer.toBuffer(doc);
  const docxBase64 = docxBuffer.toString("base64");

  // --- ZIP (archive en mémoire via archiver) ---
  const zipStream = new PassThrough();
  const zipChunks = [];
  zipStream.on("data", c => zipChunks.push(c));
  const zipFinished = new Promise((resolve, reject) => {
    zipStream.on("end", resolve);
    zipStream.on("error", reject);
  });

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  archive.append(pdfBuffer, { name: "Politique_RGPD.pdf" });
  archive.append(docxBuffer, { name: "Politique_RGPD.docx" });
  await archive.finalize();
  await zipFinished;
  const zipBuffer = Buffer.concat(zipChunks);
  const zipBase64 = zipBuffer.toString("base64");

  return { pdfBase64, docxBase64, zipBase64 };
}
