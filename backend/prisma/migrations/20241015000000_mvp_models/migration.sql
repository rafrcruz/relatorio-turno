-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('ANNOTATION','URGENCY','PENDENCY');

-- CreateTable Area
CREATE TABLE "Area" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

-- CreateTable User
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "role" TEXT NOT NULL,
  "avatar" TEXT
);

-- CreateTable Post
CREATE TABLE "Post" (
  "id" SERIAL PRIMARY KEY,
  "areaId" INTEGER NOT NULL REFERENCES "Area"("id"),
  "date" DATE NOT NULL,
  "shift" INTEGER NOT NULL,
  "type" "PostType" NOT NULL,
  "content" TEXT NOT NULL,
  "authorId" INTEGER NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Reply
CREATE TABLE "Reply" (
  "id" SERIAL PRIMARY KEY,
  "postId" INTEGER NOT NULL REFERENCES "Post"("id"),
  "authorId" INTEGER NOT NULL REFERENCES "User"("id"),
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Attachment
CREATE TABLE "Attachment" (
  "id" SERIAL PRIMARY KEY,
  "postId" INTEGER REFERENCES "Post"("id"),
  "replyId" INTEGER REFERENCES "Reply"("id"),
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL
);

-- CreateTable Indicator
CREATE TABLE "Indicator" (
  "id" SERIAL PRIMARY KEY,
  "areaId" INTEGER NOT NULL REFERENCES "Area"("id"),
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "target" DOUBLE PRECISION
);

-- CreateTable IndicatorValue
CREATE TABLE "IndicatorValue" (
  "id" SERIAL PRIMARY KEY,
  "indicatorId" INTEGER NOT NULL REFERENCES "Indicator"("id"),
  "areaId" INTEGER NOT NULL REFERENCES "Area"("id"),
  "date" DATE NOT NULL,
  "shift" INTEGER NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "source" TEXT NOT NULL
);

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id"),
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
