INSERT INTO store_settings (key, value, updated_at)
VALUES
  ('currency_symbol', 'د.ل', now()),
  ('facebook_pixel_id', '', now()),
  ('tiktok_pixel_id', '', now()),
  ('logo_url', '', now()),
  ('primary_color', '#1d4ed8', now()),
  ('announcement_text', '🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!', now()),
  ('announcement_active', 'true', now())
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO categories (id, name, name_ar, description, image_url, created_at)
VALUES
  ('beauty', 'Beauty & Care', 'الجمال والعناية', 'بشرة وشعر بمنتجات موثوقة.', null, now()),
  ('personal', 'Health & Personal Care', 'الصحة والعناية الشخصية', 'أدوات صحة ويومية أساسية.', null, now()),
  ('home', 'Home & Kitchen', 'المنزل والمطبخ', 'تنظيم المطبخ والبيت بذكاء.', null, now()),
  ('smart', 'Smart Devices', 'الأجهزة الذكية', 'إلكترونيات وأجهزة حديثة.', null, now()),
  ('kids', 'Kids', 'الأطفال', 'ألعاب تعليمية وآمنة.', null, now()),
  ('supplements', 'Supplements', 'المكملات الغذائية', 'فيتامينات وجودة مضمونة.', null, now()),
  ('various', 'Various', 'منتجات متنوعة', 'إكسسوارات وأدوات يومية.', null, now()),
  ('skincare', 'Skin Care', 'العناية بالبشرة', 'عناية متخصصة بالبشرة.', null, now())
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- Product catalog seed is intentionally omitted here because this project uses
-- a large existing catalog from production/backups.
-- If your database is empty, import product rows from your previous database
-- dump before going live.
