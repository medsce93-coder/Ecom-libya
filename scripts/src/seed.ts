import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const categories = [
  { id: "beauty", name: "Beauty & Care", nameAr: "الجمال والعناية", description: "بشرة وشعر بمنتجات موثوقة", imageUrl: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=400&q=80" },
  { id: "personal", name: "Health & Personal Care", nameAr: "الصحة والعناية الشخصية", description: "أدوات صحة ويومية أساسية", imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80" },
  { id: "home", name: "Home & Kitchen", nameAr: "المنزل والمطبخ", description: "تنظيم المطبخ والبيت بذكاء", imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80" },
  { id: "smart", name: "Smart Devices", nameAr: "الأجهزة الذكية", description: "إلكترونيات وأجهزة حديثة", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80" },
  { id: "kids", name: "Kids", nameAr: "الأطفال", description: "ألعاب تعليمية وآمنة", imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80" },
  { id: "supplements", name: "Supplements", nameAr: "المكملات الغذائية", description: "فيتامينات وجودة مضمونة", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
  { id: "various", name: "Various Products", nameAr: "منتجات متنوعة", description: "إكسسوارات وأدوات يومية", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80" },
];

const catIdMap: Record<string, string> = {
  "الجمال والعناية": "beauty",
  "الصحة والعناية الشخصية": "personal",
  "المنزل والمطبخ": "home",
  "الأجهزة الذكية": "smart",
  "الأطفال": "kids",
  "المكملات الغذائية": "supplements",
  "منتجات متنوعة": "various",
};

const products = [
  { name: "كريم ايه سي ام ديبي وايت أدفانسد", price: 76, oldPrice: 146, rating: 4.8, stock: 13, category: "الجمال والعناية", badge: "الأكثر طلباً", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80", description: "هو حل فعّال لعلاج التصبغات والبقع الداكنة وتوحيد لون البشرة، حيث يعمل على تقليل ظهور الكلف والتصبغات الناتجة عن الشمس أو العوامل الهرمونية، مع المساعدة على منع عودتها مرة أخرى.", featured: true },
  { name: "سير 100 طلاء الكولاجين للشعر", price: 182, oldPrice: 207, rating: 4.7, stock: 11, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80", description: "عناية فاخرة بنتيجة واضحة للشعر.", featured: true },
  { name: "تقنية نبض عضلي لتدليك القدمين", price: 206, oldPrice: 255, rating: 4.4, stock: 24, category: "الصحة والعناية الشخصية", badge: "محدود", image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=400&q=80", description: "راحة يومية ودعم صحي موثوق.", featured: true },
  { name: "يوسرين Q10 مضاد للتجاعيد كريم الليل", price: 79, oldPrice: 116, rating: 4.9, stock: 24, category: "الجمال والعناية", badge: "جديد", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80", description: "كريم ليلي مضاد للتجاعيد بتقنية Q10 المتطورة.", featured: true },
  { name: "قماشي الشعر لفافة وردي", price: 142, oldPrice: 226, rating: 4.9, stock: 16, category: "الجمال والعناية", badge: "محدود", image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=400&q=80", description: "لفافة شعر قماشية ناعمة.", featured: true },
  { name: "مقشر طبيعي للوجه", price: 316, oldPrice: 349, rating: 4.6, stock: 29, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80", description: "مقشر طبيعي للوجه للعناية بالبشرة.", featured: false },
  { name: "جهاز إزالة الشعر فلولس ليجز", price: 323, oldPrice: 400, rating: 4.8, stock: 9, category: "الجمال والعناية", badge: "محدود", image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=400&q=80", description: "إزالة الشعر بسهولة وفعالية.", featured: true },
  { name: "كي 18 قناع إصلاح الشعر", price: 253, oldPrice: 323, rating: 4.6, stock: 28, category: "الجمال والعناية", badge: "الأكثر طلباً", image: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=400&q=80", description: "قناع إصلاح الشعر التالف بتقنية K18.", featured: true },
  { name: "مشد الذقن سيليكون قابل لإعادة الاستخدام", price: 306, oldPrice: 364, rating: 4.6, stock: 10, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80", description: "مشد لتقليم الوجه والذقن.", featured: false },
  { name: "منتج تبييض الأسنان 5D", price: 259, oldPrice: 319, rating: 4.4, stock: 19, category: "منتجات متنوعة", badge: "محدود", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80", description: "منتج تبييض الأسنان المتطور.", featured: false },
  { name: "في 10 كريم فيتامين تون أب لتفتيح وترطيب البشرة", price: 313, oldPrice: 388, rating: 4.6, stock: 8, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=400&q=80", description: "كريم فيتامين لتفتيح وترطيب البشرة.", featured: false },
  { name: "مروحة توربو جيت X8", price: 100, oldPrice: 173, rating: 4.9, stock: 16, category: "المنزل والمطبخ", badge: "محدود", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80", description: "مروحة توربو قوية للمنزل.", featured: true },
  { name: "آلة ختم الأكياس المحمولة", price: 128, oldPrice: 188, rating: 4.7, stock: 28, category: "منتجات متنوعة", badge: "عرض", image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=400&q=80", description: "آلة ختم الأكياس لحفظ الطعام.", featured: false },
  { name: "آلة صنع قوالب الزلابية الأوتوماتيكية", price: 255, oldPrice: 316, rating: 4.9, stock: 29, category: "منتجات متنوعة", badge: "جديد", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80", description: "آلة أوتوماتيكية لصنع الزلابية.", featured: true },
  { name: "أداة إزالة شعر الجسم والإبط للنساء", price: 158, oldPrice: 233, rating: 4.3, stock: 10, category: "الجمال والعناية", badge: "جديد", image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80", description: "أداة متخصصة لإزالة الشعر.", featured: false },
  { name: "أداة تصفيف الشعر 5 في 1", price: 267, oldPrice: 320, rating: 4.8, stock: 28, category: "الجمال والعناية", badge: "جديد", image: "https://images.unsplash.com/photo-1522337359734-e576b5c7cf5c?auto=format&fit=crop&w=400&q=80", description: "أداة تصفيف شعر متعددة الوظائف.", featured: true },
  { name: "أداة تنظيف الصرف", price: 155, oldPrice: 241, rating: 4.9, stock: 6, category: "المنزل والمطبخ", badge: "عرض", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80", description: "أداة فعالة لتنظيف مجاري الصرف.", featured: false },
  { name: "جهاز ضغط الهواء للسيارات", price: 189, oldPrice: 250, rating: 4.7, stock: 20, category: "الأجهزة الذكية", badge: "جديد", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80", description: "جهاز ضخ الهواء الذكي للسيارات.", featured: false },
  { name: "فيتامينات ب المتعددة", price: 145, oldPrice: 200, rating: 4.6, stock: 30, category: "المكملات الغذائية", badge: "الأكثر طلباً", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", description: "مكمل غذائي بفيتامينات ب المتعددة.", featured: true },
  { name: "ألعاب تعليمية للأطفال", price: 95, oldPrice: 150, rating: 4.8, stock: 40, category: "الأطفال", badge: "جديد", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80", description: "ألعاب تعليمية مسلية وآمنة للأطفال.", featured: false },
  { name: "جهاز مساج الرقبة والكتف", price: 220, oldPrice: 280, rating: 4.7, stock: 15, category: "الصحة والعناية الشخصية", badge: "الأكثر طلباً", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80", description: "جهاز مساج للرقبة والكتف بتقنية متطورة.", featured: true },
  { name: "سيروم فيتامين C للوجه", price: 185, oldPrice: 240, rating: 4.9, stock: 22, category: "الجمال والعناية", badge: "جديد", image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80", description: "سيروم فيتامين سي لتفتيح البشرة.", featured: true },
  { name: "واقي شمس SPF50", price: 110, oldPrice: 155, rating: 4.6, stock: 35, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=400&q=80", description: "واقي شمس عالي الحماية SPF50.", featured: false },
  { name: "مكنسة كهربائية لاسلكية", price: 350, oldPrice: 450, rating: 4.8, stock: 12, category: "المنزل والمطبخ", badge: "الأكثر طلباً", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80", description: "مكنسة كهربائية لاسلكية فائقة القوة.", featured: true },
  { name: "كريم مرطب للجسم بالشيا", price: 88, oldPrice: 130, rating: 4.5, stock: 50, category: "الجمال والعناية", badge: "عرض", image: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&w=400&q=80", description: "كريم مرطب غني بزبدة الشيا.", featured: false },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await db.insert(categoriesTable)
      .values(cat)
      .onConflictDoNothing();
  }
  console.log(`Seeded ${categories.length} categories`);

  console.log("Seeding products...");
  let seeded = 0;
  for (const p of products) {
    const id = randomUUID();
    const categoryId = catIdMap[p.category] ?? "various";
    await db.insert(productsTable)
      .values({
        id,
        name: p.name,
        nameAr: p.name,
        description: p.description,
        descriptionAr: p.description,
        price: String(p.price),
        compareAtPrice: String(p.oldPrice),
        imageUrl: p.image,
        images: [p.image],
        categoryId,
        stock: p.stock,
        featured: p.featured,
        active: true,
        badge: p.badge,
        rating: String(p.rating),
      })
      .onConflictDoNothing();
    seeded++;
  }
  console.log(`Seeded ${seeded} products`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
