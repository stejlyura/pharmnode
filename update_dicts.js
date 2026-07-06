const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/i18n/dictionaries/en-US.json');
const ruPath = path.join(__dirname, 'src/i18n/dictionaries/ru-RU.json');

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ruDict = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

// Keys to add
const additions = {
  "header_cant_downgrade": { en: "Cannot downgrade to Hobby with active Pro", ru: "Нельзя переключиться на Hobby при активном Pro" },
  "card_dilution_scale": { en: "Dilution Scale", ru: "Разведение" },
  "card_source": { en: "Source", ru: "Источник" },
  "card_dosage_form": { en: "Dosage Form", ru: "Форма выпуска" },
  "card_application_area": { en: "Application Area", ru: "Область применения" },
  "card_processing_tech": { en: "Processing Tech", ru: "Технология" },
  "header_google_mock": { en: "Google Mock (Hobby)", ru: "Google Mock (Hobby)" },
  "header_github_mock": { en: "GitHub Mock (Pro)", ru: "GitHub Mock (Pro)" },

  // Ingredients Names (English is default, so RU gets the translation)
  "Amlodipine Besylate": { en: "Amlodipine Besylate", ru: "Амлодипина безилат" },
  "Lactose Monohydrate": { en: "Lactose Monohydrate", ru: "Лактозы моногидрат" },
  "Microcrystalline Cellulose PH-102": { en: "Microcrystalline Cellulose PH-102", ru: "Микрокристаллическая целлюлоза PH-102" },
  "Magnesium Stearate": { en: "Magnesium Stearate", ru: "Магния стеарат" },
  "Aerosil 200": { en: "Aerosil 200", ru: "Аэросил 200" },
  "Paracetamol (Acetaminophen)": { en: "Paracetamol (Acetaminophen)", ru: "Парацетамол" },
  "Ibuprofen": { en: "Ibuprofen", ru: "Ибупрофен" },
  "Ascorbic Acid (Vitamin C)": { en: "Ascorbic Acid (Vitamin C)", ru: "Аскорбиновая кислота (Витамин C)" },
  "Mannitol (Direct Compression)": { en: "Mannitol (Direct Compression)", ru: "Маннит (для прямого прессования)" },
  "Dicalcium Phosphate Dihydrate": { en: "Dicalcium Phosphate Dihydrate", ru: "Дикальция фосфат дигидрат" },
  "Croscarmellose Sodium": { en: "Croscarmellose Sodium", ru: "Кроскармеллоза натрия" },
  "Stearic Acid": { en: "Stearic Acid", ru: "Стеариновая кислота" },
  "Talc (Ph. Eur.)": { en: "Talc (Ph. Eur.)", ru: "Тальк (Ph. Eur.)" },
  "Aspirin (Acetylsalicylic Acid)": { en: "Aspirin (Acetylsalicylic Acid)", ru: "Аспирин (Ацетилсалициловая кислота)" },
  "Caffeine Anhydrous": { en: "Caffeine Anhydrous", ru: "Кофеин безводный" },
  "Metformin Hydrochloride": { en: "Metformin Hydrochloride", ru: "Метформина гидрохлорид" },
  "Vitamin D3 (Cholecalciferol)": { en: "Vitamin D3 (Cholecalciferol)", ru: "Витамин D3 (Холекальциферол)" },
  "Calcium Carbonate": { en: "Calcium Carbonate", ru: "Кальция карбонат" },
  "Sorbitol": { en: "Sorbitol", ru: "Сорбит" },
  "Sucrose": { en: "Sucrose", ru: "Сахароза" },
  "Povidone K30 (PVP)": { en: "Povidone K30 (PVP)", ru: "Повидон K30 (ПВП)" },
  "Hydroxypropyl Methylcellulose (HPMC)": { en: "Hydroxypropyl Methylcellulose (HPMC)", ru: "Гидроксипропилметилцеллюлоза (ГПМЦ)" },
  "Pregelatinized Starch": { en: "Pregelatinized Starch", ru: "Прежелатинизированный крахмал" },
  "Sodium Starch Glycolate": { en: "Sodium Starch Glycolate", ru: "Натрия крахмал гликолят" },
  "Sodium Stearyl Fumarate": { en: "Sodium Stearyl Fumarate", ru: "Натрия стеарилфумарат" },
  "Macrogol 6000 (PEG 6000)": { en: "Macrogol 6000 (PEG 6000)", ru: "Макрогол 6000 (ПЭГ 6000)" },

  // Effects & Side Effects
  "Обезболивающее": { en: "Analgesic", ru: "Обезболивающее" },
  "Жаропонижающее": { en: "Antipyretic", ru: "Жаропонижающее" },
  "Печеночная недостаточность": { en: "Hepatic impairment", ru: "Печеночная недостаточность" },
  "Аллергическая сыпь": { en: "Allergic rash", ru: "Аллергическая сыпь" },
  "редко": { en: "rarely", ru: "редко" },
  "часто": { en: "often", ru: "часто" },
  "Противовоспалительное": { en: "Anti-inflammatory", ru: "Противовоспалительное" },
  "Язва желудка": { en: "Stomach ulcer", ru: "Язва желудка" },
  "Почечная недостаточность": { en: "Renal failure", ru: "Почечная недостаточность" },
  "Аспириновая астма": { en: "Aspirin-induced asthma", ru: "Аспириновая астма" },
  "Боли в желудке": { en: "Stomach pain", ru: "Боли в желудке" },
  "Тошнота": { en: "Nausea", ru: "Тошнота" },
  "Иммунитет": { en: "Immunity", ru: "Иммунитет" },
  "Энергия": { en: "Energy", ru: "Энергия" },
  "Антиоксидант": { en: "Antioxidant", ru: "Антиоксидант" },
  "Гипероксалурия": { en: "Hyperoxaluria", ru: "Гипероксалурия" },
  "Тромбофлебит": { en: "Thrombophlebitis", ru: "Тромбофлебит" },
  "Изжога": { en: "Heartburn", ru: "Изжога" },
  "Стимулятор": { en: "Stimulant", ru: "Стимулятор" },
  "Фокусировка": { en: "Focus", ru: "Фокусировка" },
  "Гипертония": { en: "Hypertension", ru: "Гипертония" },
  "Бессонница": { en: "Insomnia", ru: "Бессонница" },
  "Аритмия": { en: "Arrhythmia", ru: "Аритмия" },
  "Тахикардия": { en: "Tachycardia", ru: "Тахикардия" },
  "Здоровье костей": { en: "Bone health", ru: "Здоровье костей" },
  "Гиперкальциемия": { en: "Hypercalcemia", ru: "Гиперкальциемия" },
  "Головная боль": { en: "Headache", ru: "Головная боль" }
};

for (const [key, trans] of Object.entries(additions)) {
  enDict[key] = trans.en;
  ruDict[key] = trans.ru;
}

fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2), 'utf8');
fs.writeFileSync(ruPath, JSON.stringify(ruDict, null, 2), 'utf8');

console.log('Dictionaries updated successfully.');
