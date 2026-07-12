import { CalculatedResults, EditorNode } from "../hooks/useNodeEditor";
import { UserProfile } from "../context/AuthContext";
import { Ingredient } from "../types/pharm";
import { checkCompatibilityAndLimits, getPackagingRecommendations, validateProcessCompatibility } from "./calculator";
import enUsDict from "../i18n/dictionaries/en-US.json";
import enEuDict from "../i18n/dictionaries/en-EU.json";

export async function generateGMPReport(
  nodes: EditorNode[],
  calculatedResults: CalculatedResults,
  user: UserProfile | null,
  region: string,
  allIngredients: Ingredient[]
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 20;

  const blendIngredients = nodes
    .filter((n) => n.type === "ingredient")
    .map((node) => {
      const ing = allIngredients.find((i) => String(i.id) === String(node.data.ingredientId));
      return {
        ingredient: ing!,
        percentage: node.data.percentage ?? 0,
      };
    })
    .filter((item) => item.ingredient !== undefined);

  function checkPageBreak(amount: number) {
    if (y + amount > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // 1. BRAND HEADER
  doc.setFillColor(0, 94, 184); // clinical blue block
  doc.rect(20, y, 8, 8, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 94, 184);
  doc.text("PharmNode", 31, y + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Virtual Formulation Studio MVP", 140, y + 6);
  y += 15;

  // Separator
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y, 190, y);
  y += 8;

  // REPORT TITLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("GMP FORMULATION VALIDATION REPORT", 20, y);
  y += 8;

  // METADATA BOX
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, 170, 24, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  
  const dateStr = new Date().toUTCString();
  doc.text(`Date: ${dateStr}`, 25, y + 6);
  doc.text(`Technologist: ${user ? user.name : "Guest Pharmacist"}`, 25, y + 12);
  doc.text(`Email: ${user ? user.email : "guest@pharmnode-studio.com"}`, 25, y + 18);

  const stdStr = region === "US" ? "FDA CFR Title 21 (US)" : "EFSA Food Supp. Directive (EU)";
  doc.text(`Regulatory Standard: ${stdStr}`, 105, y + 6);
  doc.text(`Active plan: ${user ? user.tariff.toUpperCase() : "HOBBY"}`, 105, y + 12);
  doc.text(`Report ID: PN-GMP-${Date.now().toString().slice(-6)}`, 105, y + 18);
  y += 32;

  // 2. INGREDIENTS MATRIX (TABLE)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("1. Formulation Recipe (Composition)", 20, y);
  y += 6;

  // Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Ingredient Name", 23, y + 4);
  doc.text("CAS Number", 75, y + 4);
  doc.text("Role", 112, y + 4);
  doc.text("Percentage", 165, y + 4);
  y += 6;

  // Rows
  const ingredientNodes = nodes.filter((n) => n.type === "ingredient");

  doc.setFont("helvetica", "normal");
  ingredientNodes.forEach((node, idx: number) => {
    const ing = allIngredients.find((i) => String(i.id) === String(node.data.ingredientId));
    if (ing) {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y, 170, 6, "F");
      }
      doc.text(ing.name, 23, y + 4);
      doc.text(ing.casNumber || "N/A", 75, y + 4);

      // Explicitly adjust functional roles for coating/sweetener components
      let displayRole = ing.role.toUpperCase();
      if (ing.name.includes("HPMC") || ing.name.includes("Hydroxypropyl Methylcellulose")) {
        displayRole = "DRY-BINDER / COATING";
      } else if (ing.name.includes("Sucrose") || ing.name.includes("Sorbitol") || ing.name.includes("Mannitol")) {
        displayRole = "FILLER / SWEETENER";
      } else if (ing.name.includes("PEG 6000") || ing.name.includes("Macrogol 6000")) {
        displayRole = "LUBRICANT / PLASTICIZER";
      }

      doc.text(displayRole, 112, y + 4);
      doc.text(`${(node.data.percentage ?? 0).toFixed(1)}%`, 165, y + 4);
      y += 6;
    }
  });

  // Table line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  // 1.1. COATING (SHELL) & ORGANOLEPTIC ADDITIVES
  checkPageBreak(38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("1.1. Coating (Shell) & Organoleptic Specifications", 20, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, 170, 24, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  doc.setFont("helvetica", "bold");
  doc.text("Film-Forming Polymers (Shell):", 23, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text("HPMC (Hydroxypropyl Methylcellulose), PVA, Opadry II series.", 75, y + 5);
  doc.text("Role: Film coat forming, mechanical protection, light/moisture barrier protection.", 23, y + 9);

  doc.setFont("helvetica", "bold");
  doc.text("Organoleptic Corrugents:", 23, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text("Sucrose, Sorbitol, Mannitol, Mint/Fruit flavors, FDA/EFSA colorants.", 75, y + 14);
  doc.text("Role: Taste-masking of bitter active ingredients, odor improvement, tablet color coding.", 23, y + 18);

  const hasCoatingInRecipe = ingredientNodes.some(node => {
    const ing = allIngredients.find((i) => String(i.id) === String(node.data.ingredientId));
    return ing && (
      ing.name.includes("HPMC") || 
      ing.name.includes("PVA") || 
      ing.name.includes("Opadry") || 
      ing.name.includes("Sucrose") || 
      ing.name.includes("Sorbitol") || 
      ing.name.includes("Mannitol")
    );
  });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  if (hasCoatingInRecipe) {
    doc.text("Status: Active coating or sweetening ingredients detected in the recipe composition above.", 23, y + 22);
  } else {
    doc.text("Status: Recommended standard aqueous film coating formula applied (Opadry II / HPMC based).", 23, y + 22);
  }
  y += 34;

  // 3. PHYSICAL PROPERTIES
  checkPageBreak(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("2. Powder Blend & Compaction Stats", 20, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, 170, 32, "F");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const { blend, tableting } = calculatedResults;
  doc.text(`Loose Bulk Density: ${blend.looseDensity.toFixed(3)} g/mL`, 25, y + 6);
  doc.text(`Tapped Bulk Density: ${blend.tappedDensity.toFixed(3)} g/mL`, 25, y + 12);
  doc.text(`Hausner Ratio (H): ${blend.flowability.hausner.toFixed(2)}`, 25, y + 18);
  doc.text(`Carr Index (C): ${blend.flowability.carr.toFixed(1)}%`, 25, y + 24);

  const pressNode = nodes.find((n) => n.type === "press");
  const diameterCm = pressNode?.data.diameterCm ?? 0.3;
  const depthCm = pressNode?.data.depthCm ?? 0.5;

  const outputNode = nodes.find((n) => n.type === "output");
  const formType = outputNode?.data.formType || "tablet";

  doc.text(`Flowability: ${blend.flowability.rating.toUpperCase()}`, 105, y + 6);
  if (formType === "tablet") {
    doc.text(`Punch Diameter: ${(diameterCm * 10).toFixed(1)} mm`, 105, y + 12);
    doc.text(`Matrix Fill Depth: ${(depthCm * 10).toFixed(1)} mm`, 105, y + 18);
    doc.text(`Tablet Porosity (Est): ${(tableting.porosity * 100).toFixed(1)}%`, 105, y + 24);
    y += 38;
  } else if (formType === "capsule") {
    const { dosageFormFit } = calculatedResults;
    doc.text(`Recommended Capsule: ${dosageFormFit.recommendedCapsuleSize || "N/A"}`, 105, y + 12);
    doc.text(`Capsule Fill: ${dosageFormFit.fillPercentage.toFixed(1)}%`, 105, y + 18);
    doc.text(`Capsule Count: ${dosageFormFit.capsuleCount}`, 105, y + 24);
    y += 38;

    // Output a dedicated Capsule Sizing block
    checkPageBreak(30);
    doc.setFillColor(240, 246, 252);
    doc.rect(20, y, 170, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 94, 184);
    doc.text("CAPSULE SIZING & FILLING LOGISTICS", 25, y + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`- Recommended Capsule Size: ${dosageFormFit.recommendedCapsuleSize || "None"}`, 25, y + 10);
    doc.text(`- Fill Percentage: ${dosageFormFit.fillPercentage.toFixed(1)}% (Volume: ${dosageFormFit.volumeMl.toFixed(4)} mL)`, 25, y + 14);
    if (dosageFormFit.alternativeSizes && dosageFormFit.alternativeSizes.length > 0) {
      const altSizesStr = dosageFormFit.alternativeSizes.slice(0, 3).map(a => `${a.size} (${a.fillPercentage.toFixed(0)}%)`).join(", ");
      doc.text(`- Alternative Sizes: ${altSizesStr}`, 25, y + 18);
    } else {
      doc.text(`- Fits in a single capsule: ${dosageFormFit.fitsInSingleCapsule ? "Yes" : "No"}`, 25, y + 18);
    }
    y += 26;
  } else {
    doc.text(`Dosage Form: POWDER`, 105, y + 12);
    doc.text(`Serving Weight: ${tableting.recommendedWeightMg.toFixed(1)} mg`, 105, y + 18);
    doc.text(`Total Servings: ${calculatedResults.batch.totalTablets.toLocaleString()}`, 105, y + 24);
    y += 38;
  }

  // 2.1. PRODUCTION MASTER FORMULA (BATCH LAYOUT)
  checkPageBreak(40 + (ingredientNodes.length * 6));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("2.1. Production Master Formula (Batch Layout)", 20, y);
  y += 6;

  // Table Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Component Name", 23, y + 4.5);
  doc.text("Nominal %", 75, y + 4.5);
  doc.text("Overage %", 97, y + 4.5);
  doc.text("Nominal Qty (kg)", 120, y + 4.5);
  doc.text("Actual Qty (kg)", 155, y + 4.5);
  y += 6;

  // Draw rows using ingredientsBreakdown
  const ingredientsBreakdown = calculatedResults.batch.ingredientsBreakdown || [];

  if (ingredientsBreakdown.length > 0) {
    ingredientsBreakdown.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y, 170, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      doc.text(item.name, 23, y + 4);
      doc.text(`${(blendIngredients.find(bi => String(bi.ingredient.id) === String(item.ingredientId))?.percentage ?? 0).toFixed(1)}%`, 75, y + 4);
      doc.text(`${item.overagePercent.toFixed(1)}%`, 97, y + 4);
      doc.text(`${item.nominalWeightKg.toFixed(4)} kg`, 120, y + 4);
      doc.text(`${item.finalWeightKg.toFixed(4)} kg`, 155, y + 4);
      y += 6;
    });
  } else {
    // Fallback if breakdown not populated
    ingredientNodes.forEach((node, idx) => {
      const ing = allIngredients.find((i) => String(i.id) === String(node.data.ingredientId));
      if (ing) {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, y, 170, 6, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);

        const percentage = node.data.percentage ?? 0;
        const overage = ing.overagePercent ?? 0;
        const yieldFraction = (outputNode?.data.expectedLossPercentage !== undefined)
          ? (100 - Number(outputNode.data.expectedLossPercentage)) / 100
          : 1.0;

        const nominalWeightKg = (calculatedResults.batch.totalTablets * (tableting.recommendedWeightMg || 0) * (percentage / 100)) / 1000000;
        const finalWeightKg = nominalWeightKg * (1 + overage / 100) / (yieldFraction > 0 ? yieldFraction : 1.0);

        doc.text(ing.name, 23, y + 4);
        doc.text(`${percentage.toFixed(1)}%`, 75, y + 4);
        doc.text(`${overage.toFixed(1)}%`, 97, y + 4);
        doc.text(`${nominalWeightKg.toFixed(4)} kg`, 120, y + 4);
        doc.text(`${finalWeightKg.toFixed(4)} kg`, 155, y + 4);
        y += 6;
      }
    });
  }

  // Draw bottom border line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  // 4. CHEMICAL INCOMPATIBILITIES & WARNINGS
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("3. Safety & Allergen Auditing", 20, y);
  y += 6;

  const enDict = region === "US" ? enUsDict : enEuDict;
  const enT = (key: string) => (enDict as Record<string, string>)[key] || key;
  const englishWarnings = checkCompatibilityAndLimits(blendIngredients, enT);

  const hasWarnings = englishWarnings.length > 0;
  if (hasWarnings) {
    doc.setFillColor(254, 242, 242);
    doc.rect(20, y, 170, 22, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text("WARNINGS DETECTED", 25, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    
    englishWarnings.slice(0, 3).forEach((w, idx) => {
      doc.text(`- ${w.message}`, 25, y + 12 + idx * 4);
    });
  } else {
    doc.setFillColor(240, 253, 250);
    doc.rect(20, y, 170, 12, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136);
    doc.text("FORMULATION VERIFIED & COMPLIANT", 25, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("- No chemical incompatibilities or allergen alerts found.", 25, y + 10);
  }
  y += hasWarnings ? 28 : 18;

  // Allergen profile
  if (calculatedResults.allergens.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`Contains Allergens: ${calculatedResults.allergens.join(", ")}`, 20, y);
    y += 8;
  }
  y += 4;

  // 5. REGULATORY COMPLIANCE REPORT (Section 4)
  checkPageBreak(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("4. Regulatory Compliance Report", 20, y);
  y += 6;

  // Table Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Ingredient", 23, y + 4.5);
  doc.text("Quality Grade", 75, y + 4.5);
  doc.text("Allergen Status", 112, y + 4.5);
  doc.text("Compliance Status", 150, y + 4.5);
  y += 6;

  let hasMissingGrade = false;
  blendIngredients.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 6, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.ingredient.name, 23, y + 4);

    const grade = item.ingredient.regulatoryInfo?.pharmacopoeiaGrade;
    const allergen = item.ingredient.regulatoryInfo?.allergenStatus;

    doc.text(grade || "N/A", 75, y + 4);
    doc.text(allergen || "None", 112, y + 4);

    if (grade) {
      doc.setTextColor(13, 148, 136); // green
      doc.text("Compliant", 150, y + 4);
    } else {
      hasMissingGrade = true;
      doc.setTextColor(220, 38, 38); // red
      doc.text("No Grade Data", 150, y + 4);
    }
    y += 6;
  });

  if (hasMissingGrade) {
    y += 2;
    doc.setFillColor(254, 242, 242);
    doc.rect(20, y, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    const missingWarningText = region === "US" 
      ? "Warning: Not all ingredients have a verified pharmacopoeia standard."
      : "Warning: Not all ingredients have a verified pharmacopoeia standard (EU/EMA).";
    doc.text(missingWarningText, 23, y + 5.5);
    y += 12;
  } else {
    y += 4;
  }

  // 6. PACKAGING PROTOCOL (Section 5)
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("5. Packaging Protocol Recommendations", 20, y);
  y += 6;

  const packagingRecs = getPackagingRecommendations(blendIngredients, enT);

  // Table Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Protection Type", 23, y + 4.5);
  doc.text("Recommended Action", 65, y + 4.5);
  doc.text("Target / Cause", 130, y + 4.5);
  y += 6;

  packagingRecs.forEach((rec, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 6, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let typeText = "Standard";
    let iconText = "[Standard] ";
    if (rec.type === "moisture_protection") {
      typeText = "Moisture Protection";
      iconText = "[Moisture] ";
    } else if (rec.type === "light_protection") {
      typeText = "Light Protection";
      iconText = "[Light] ";
    } else if (rec.type === "heat_protection") {
      typeText = "Temperature Chain";
      iconText = "[Temperature] ";
    }

    doc.text(typeText, 23, y + 4);
    doc.text(rec.message, 65, y + 4);
    doc.text(rec.details, 130, y + 4);
    y += 6;
  });
  y += 4;

  // 7. PROCESS VALIDATION (Section 6)
  const blendingNode = nodes.find(n => n.type === 'blending');
  const processType = blendingNode?.data.processType || pressNode?.data.processType;

  if (processType) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 94, 184);
    doc.text("6. Process Validation Report", 20, y);
    y += 6;

    const processValidation = validateProcessCompatibility(blendIngredients, processType);
    let processLabel = String(processType).replace(/_/g, ' ').toUpperCase();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Selected Process: ${processLabel}`, 20, y + 4);
    y += 8;

    if (processValidation.warnings.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(254, 242, 242);
      const boxHeight = 10 + processValidation.warnings.length * 5;
      doc.rect(20, y, 170, boxHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(220, 38, 38);
      doc.text("PROCESS WARNINGS:", 23, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      processValidation.warnings.forEach((warn, idx) => {
        doc.text(`• ${warn}`, 23, y + 10 + idx * 5);
      });
      y += boxHeight + 4;
    }

    if (processValidation.recommendations.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(240, 253, 250);
      const boxHeight = 10 + processValidation.recommendations.length * 5;
      doc.rect(20, y, 170, boxHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(13, 148, 136);
      doc.text("PROCESS RECOMMENDATIONS:", 23, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      processValidation.recommendations.forEach((rec, idx) => {
        doc.text(`• ${rec}`, 23, y + 10 + idx * 5);
      });
      y += boxHeight + 4;
    }

    if (processValidation.isValid && processValidation.warnings.length === 0) {
      doc.setFillColor(240, 253, 250);
      doc.rect(20, y, 170, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(13, 148, 136);
      doc.text("✔ PROCESS COMPATIBLE: Selected process is compatible with blend stability profile.", 23, y + 6.5);
      y += 14;
    }
  }

  // 8. REGULATORY NOTICE & DISCLAIMER
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("REGULATORY DISCLAIMER & TERMS OF USE", 20, y);
  y += 4;
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  
  const disclLine1 = "All mathematical parameters and density calculations generated by PharmNode serve as decision-support models only.";
  const disclLine2 = "Laboratory experimental validation (FTIR, DSC, HPLC) is strictly mandatory prior to formulation industrial scaling.";
  doc.text(disclLine1, 20, y);
  doc.text(disclLine2, 20, y + 3.5);
  y += 12;

  // 9. TECH SIGNATURE SIGN-OFF BLOCK
  checkPageBreak(30);
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  
  doc.text("Prepared By: ___________________________", 20, y + 6);
  doc.text("Authorized By (QA): ___________________________", 110, y + 6);

  doc.text("Date: ___________________________", 20, y + 14);
  doc.text("Signature Stamp: ___________________________", 110, y + 14);

  doc.save("gmp-formulation-report.pdf");
}
