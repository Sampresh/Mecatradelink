-- Catalogue media, brands and gallery.
-- Existing Product.brand strings become Brand rows and Product.imageUrl becomes the
-- first ProductImage before the old columns are dropped, so no data is lost.

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('SHOWROOM', 'PRODUCTS', 'STOCK', 'PROJECTS', 'INSTALLATIONS', 'COMPANY');

-- AlterTable
ALTER TABLE "Enquiry" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable (old columns are dropped after the data copy below)
ALTER TABLE "Product" ADD COLUMN "brandId" TEXT,
ADD COLUMN     "model" TEXT;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "caption" TEXT,
    "category" "GalleryCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrandCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "GalleryImage_category_sortOrder_idx" ON "GalleryImage"("category", "sortOrder");

-- CreateIndex
CREATE INDEX "_BrandCategories_B_index" ON "_BrandCategories"("B");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandCategories" ADD CONSTRAINT "_BrandCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandCategories" ADD CONSTRAINT "_BrandCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data: free-text brands -> Brand rows (slug from name), linked back to products
INSERT INTO "Brand" ("id", "name", "slug", "updatedAt")
SELECT 'brd_' || md5(b.name), b.name,
       trim(both '-' from regexp_replace(lower(b.name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(md5(b.name), 1, 6),
       CURRENT_TIMESTAMP
FROM (SELECT DISTINCT trim("brand") AS name FROM "Product" WHERE "brand" IS NOT NULL AND trim("brand") <> '') b;

UPDATE "Product" p SET "brandId" = 'brd_' || md5(trim(p."brand"))
WHERE p."brand" IS NOT NULL AND trim(p."brand") <> '';

-- Data: single product image -> cover ProductImage
INSERT INTO "ProductImage" ("id", "productId", "url", "publicId", "sortOrder")
SELECT 'img_' || md5(p."id" || p."imageUrl"), p."id", p."imageUrl", coalesce(p."imagePublicId", ''), 0
FROM "Product" p WHERE p."imageUrl" IS NOT NULL;

-- Drop the superseded columns
ALTER TABLE "Product" DROP COLUMN "brand",
DROP COLUMN "imagePublicId",
DROP COLUMN "imageUrl";
