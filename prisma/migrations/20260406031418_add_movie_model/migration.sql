-- CreateTable
CREATE TABLE "movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "tagline" TEXT,
    "overview" TEXT NOT NULL,
    "posterUrl" TEXT,
    "backdropUrl" TEXT,
    "trailerUrl" TEXT,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "runtime" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "originalLanguage" TEXT NOT NULL,
    "certification" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "voteAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budget" BIGINT,
    "revenue" BIGINT,
    "profit" BIGINT,
    "genres" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movie" ADD CONSTRAINT "movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
