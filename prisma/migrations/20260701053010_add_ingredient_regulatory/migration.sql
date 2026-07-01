-- CreateTable
CREATE TABLE "IngredientRegulatory" (
    "id" TEXT NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "pharmacopoeiaGrade" TEXT,
    "allergenStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientRegulatory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientRegulatory_ingredientId_key" ON "IngredientRegulatory"("ingredientId");

-- AddForeignKey
ALTER TABLE "IngredientRegulatory" ADD CONSTRAINT "IngredientRegulatory_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
