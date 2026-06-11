-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "indicatorNoteId" INTEGER;

-- CreateTable
CREATE TABLE "public"."IndicatorNote" (
    "id" SERIAL NOT NULL,
    "areaId" INTEGER NOT NULL,
    "indicatorCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "includedInHandover" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorNote_areaId_indicatorCode_date_shift_key" ON "public"."IndicatorNote"("areaId", "indicatorCode", "date", "shift");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_indicatorNoteId_fkey" FOREIGN KEY ("indicatorNoteId") REFERENCES "public"."IndicatorNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorNote" ADD CONSTRAINT "IndicatorNote_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorNote" ADD CONSTRAINT "IndicatorNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
