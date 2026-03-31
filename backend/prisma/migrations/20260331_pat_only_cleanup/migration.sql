ALTER TABLE "User" ADD COLUMN "authIdentityKey" TEXT;

UPDATE "User"
SET "authIdentityKey" = COALESCE("entraObjectId", "email", 'legacy-user:' || "id")
WHERE "authIdentityKey" IS NULL;

ALTER TABLE "User" ALTER COLUMN "authIdentityKey" SET NOT NULL;

CREATE UNIQUE INDEX "User_authIdentityKey_key" ON "User"("authIdentityKey");

DROP INDEX IF EXISTS "User_entraObjectId_key";

ALTER TABLE "User" DROP COLUMN IF EXISTS "entraObjectId";

ALTER TABLE "AzureConnection" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "AzureConnection" DROP COLUMN IF EXISTS "encryptedRefreshToken";
ALTER TABLE "AzureConnection" DROP COLUMN IF EXISTS "tokenExpiresAt";
