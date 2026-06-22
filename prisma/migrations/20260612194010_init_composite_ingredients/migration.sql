-- AlterTable
ALTER TABLE "CustomIngredient" ADD COLUMN     "applicationArea" TEXT,
ADD COLUMN     "contraindications" JSONB DEFAULT '[]',
ADD COLUMN     "dilutionScale" TEXT,
ADD COLUMN     "dosageForm" TEXT,
ADD COLUMN     "effects" JSONB DEFAULT '[]',
ADD COLUMN     "processingTech" TEXT,
ADD COLUMN     "sideEffects" JSONB DEFAULT '[]',
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "applicationArea" TEXT,
ADD COLUMN     "dilutionScale" TEXT,
ADD COLUMN     "dosageForm" TEXT,
ADD COLUMN     "processingTech" TEXT,
ADD COLUMN     "sideEffects" JSONB DEFAULT '[]',
ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "ActiveMolecule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "casNumber" TEXT,
    "chemicalClassId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveMolecule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Effect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Effect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientEffect" (
    "id" TEXT NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "effectId" TEXT NOT NULL,

    CONSTRAINT "IngredientEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contraindication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contraindication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientContraindication" (
    "id" TEXT NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "contraindicationId" TEXT NOT NULL,

    CONSTRAINT "IngredientContraindication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Synergy" (
    "id" TEXT NOT NULL,
    "ingredientAId" INTEGER NOT NULL,
    "ingredientBId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Synergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibilityRule" (
    "id" TEXT NOT NULL,
    "classA" INTEGER NOT NULL,
    "classB" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompatibilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Effect_name_key" ON "Effect"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientEffect_ingredientId_effectId_key" ON "IngredientEffect"("ingredientId", "effectId");

-- CreateIndex
CREATE UNIQUE INDEX "Contraindication_name_key" ON "Contraindication"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientContraindication_ingredientId_contraindicationId_key" ON "IngredientContraindication"("ingredientId", "contraindicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Synergy_ingredientAId_ingredientBId_key" ON "Synergy"("ingredientAId", "ingredientBId");

-- AddForeignKey
ALTER TABLE "ActiveMolecule" ADD CONSTRAINT "ActiveMolecule_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientEffect" ADD CONSTRAINT "IngredientEffect_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientEffect" ADD CONSTRAINT "IngredientEffect_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "Effect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientContraindication" ADD CONSTRAINT "IngredientContraindication_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientContraindication" ADD CONSTRAINT "IngredientContraindication_contraindicationId_fkey" FOREIGN KEY ("contraindicationId") REFERENCES "Contraindication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Synergy" ADD CONSTRAINT "Synergy_ingredientAId_fkey" FOREIGN KEY ("ingredientAId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Synergy" ADD CONSTRAINT "Synergy_ingredientBId_fkey" FOREIGN KEY ("ingredientBId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
