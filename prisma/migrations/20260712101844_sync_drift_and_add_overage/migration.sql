-- AlterTable
ALTER TABLE "CustomIngredient" ADD COLUMN     "bitterness" DOUBLE PRECISION,
ADD COLUMN     "moistureContent" DOUBLE PRECISION,
ADD COLUMN     "overagePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "solubility" TEXT;

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "bitterness" DOUBLE PRECISION,
ADD COLUMN     "moistureContent" DOUBLE PRECISION,
ADD COLUMN     "overagePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "solubility" TEXT;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "productionYield" DOUBLE PRECISION NOT NULL DEFAULT 100.0;

-- CreateTable
CREATE TABLE "CapsuleSize" (
    "id" SERIAL NOT NULL,
    "size" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapsuleSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapsuleSize_size_key" ON "CapsuleSize"("size");
