-- Remove featured column that was dropped directly on the DB
ALTER TABLE "products" DROP COLUMN IF EXISTS "featured";

-- CreateTable
CREATE TABLE "psa_certs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "certNumber" TEXT NOT NULL,
    "specId" INTEGER NOT NULL,
    "specNumber" TEXT NOT NULL,
    "labelType" TEXT,
    "reverseBarCode" BOOLEAN NOT NULL DEFAULT false,
    "year" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "cardNumber" TEXT,
    "subject" TEXT,
    "variety" TEXT,
    "gradeDescription" TEXT,
    "cardGrade" TEXT,
    "totalPopulation" INTEGER NOT NULL DEFAULT 0,
    "totalPopulationWithQualifier" INTEGER NOT NULL DEFAULT 0,
    "populationHigher" INTEGER NOT NULL DEFAULT 0,
    "isPsaDna" BOOLEAN NOT NULL DEFAULT false,
    "isDualCert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psa_certs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "psa_certs_productId_key" ON "psa_certs"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "psa_certs_certNumber_key" ON "psa_certs"("certNumber");

-- AddForeignKey
ALTER TABLE "psa_certs" ADD CONSTRAINT "psa_certs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
