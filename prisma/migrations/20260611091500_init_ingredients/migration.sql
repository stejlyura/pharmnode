-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "tariff" TEXT NOT NULL DEFAULT 'hobby',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "connections" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomIngredient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "casNumber" TEXT,
    "looseBulkDensity" DOUBLE PRECISION NOT NULL,
    "tappedBulkDensity" DOUBLE PRECISION NOT NULL,
    "trueDensity" DOUBLE PRECISION,
    "costPerKgUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxSafePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "incompatibleWith" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "compatibleWith" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "isAllergen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "casNumber" TEXT,
    "role" TEXT NOT NULL,
    "chemicalClassId" INTEGER NOT NULL,
    "looseBulkDensity" DOUBLE PRECISION NOT NULL,
    "tappedBulkDensity" DOUBLE PRECISION NOT NULL,
    "trueDensity" DOUBLE PRECISION,
    "averageParticleSizeUm" DOUBLE PRECISION,
    "isAllergen" BOOLEAN NOT NULL DEFAULT false,
    "benefit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "risk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerKgUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "manufacturability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxSafePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomIngredient" ADD CONSTRAINT "CustomIngredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
