-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL
);
