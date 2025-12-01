-- CreateTable
CREATE TABLE "Mountain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "altitude" TEXT,
    "has_death_zone" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "first_climber" TEXT,
    "first_climbed_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mountain_img" TEXT,
    "country_flag_img" TEXT,

    CONSTRAINT "Mountain_pkey" PRIMARY KEY ("id")
);
