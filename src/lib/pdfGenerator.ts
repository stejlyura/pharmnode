import { jsPDF } from "jspdf";
import { CalculatedResults, EditorNode } from "../hooks/useNodeEditor";
import { UserProfile } from "../context/AuthContext";
import { Ingredient } from "../types/pharm";

export function generateGMPReport(
  nodes: EditorNode[],
  calculatedResults: CalculatedResults,
  user: UserProfile | null,
  region: string,
  allIngredients: Ingredient[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 20;

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
  doc.text("Role", 110, y + 4);
  doc.text("Percentage", 145, y + 4);
  doc.text("Cost/kg", 170, y + 4);
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

      doc.text(displayRole, 110, y + 4);
      doc.text(`${(node.data.percentage ?? 0).toFixed(1)}%`, 145, y + 4);
      doc.text(`$${ing.costPerKgUsd.toFixed(2)}`, 170, y + 4);
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

  doc.text(`Flowability: ${blend.flowability.rating.toUpperCase()}`, 105, y + 6);
  doc.text(`Punch Diameter: ${(diameterCm * 10).toFixed(1)} mm`, 105, y + 12);
  doc.text(`Matrix Fill Depth: ${(depthCm * 10).toFixed(1)} mm`, 105, y + 18);
  doc.text(`Tablet Porosity (Est): ${(tableting.porosity * 100).toFixed(1)}%`, 105, y + 24);
  y += 38;

  // 4. CHEMICAL INCOMPATIBILITIES & WARNINGS
  checkPageBreak(32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 94, 184);
  doc.text("3. Safety, Allergens & Compliance Auditing", 20, y);
  y += 6;

  const hasWarnings = calculatedResults.warnings.length > 0;
  if (hasWarnings) {
    doc.setFillColor(254, 242, 242);
    doc.rect(20, y, 170, 26, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text("WARNINGS DETECTED", 25, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    
    calculatedResults.warnings.slice(0, 3).forEach((w, idx) => {
      doc.text(`- ${w.message}`, 25, y + 12 + idx * 5);
    });
  } else {
    doc.setFillColor(240, 253, 250);
    doc.rect(20, y, 170, 16, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136);
    doc.text("FORMULATION VERIFIED & COMPLIANT", 25, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.text("- No chemical incompatibilities or allergen alerts found.", 25, y + 11);
  }
  y += hasWarnings ? 32 : 22;

  // Allergen profile
  if (calculatedResults.allergens.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`Contains Allergens: ${calculatedResults.allergens.join(", ")}`, 20, y);
    y += 8;
  }

  // 5. REGULATORY NOTICE & DISCLAIMER
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

  // 6. TECH SIGNATURE SIGN-OFF BLOCK
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
