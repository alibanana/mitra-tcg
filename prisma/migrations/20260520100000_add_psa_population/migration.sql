-- AlterTable
ALTER TABLE "psa_certs" ADD COLUMN "psa_population" JSONB,
ADD COLUMN "psa_pop_populated_at" TIMESTAMP(3);
