-- CreateTable
CREATE TABLE "user_feature_usage" (
    "id" TEXT NOT NULL,
    "isPopulated" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_feature_usage_userId_key" ON "user_feature_usage"("userId");

-- AddForeignKey
ALTER TABLE "user_feature_usage" ADD CONSTRAINT "user_feature_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
