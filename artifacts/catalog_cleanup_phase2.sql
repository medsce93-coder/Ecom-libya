BEGIN;

-- Phase 2 catalog cleanup (data only, no schema changes)
-- Safe goals:
-- 1) normalize weak product names
-- 2) improve awkward slugs where clearly broken
-- 3) upgrade placeholder descriptions
-- 4) reassign clearly wrong categories with high confidence

-- 1) Name normalization (Arabic-first, keep concise/store-friendly)
WITH base_names AS (
  SELECT
    p.id,
    trim(
      regexp_replace(
        replace(replace(coalesce(NULLIF(p.name_ar, ''), NULLIF(p.name, ''), ''), '-', ' '), '_', ' '),
        '\s+',
        ' ',
        'g'
      )
    ) AS raw_name
  FROM products p
),
fixed_names AS (
  SELECT
    b.id,
    trim(
      regexp_replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(b.raw_name, 'اداة', 'أداة'),
                      'الاطفال', 'الأطفال'),
                    'للاطفال', 'للأطفال'),
                  'الادن', 'الأذن'),
                'سياراة', 'سيارة'),
              'ميرايا', 'مرايا'),
            'النسخة التانية', 'النسخة الثانية'),
          'لتقويه', 'لتقوية'),
        'تقويه', 'تقوية'),
        '\s+',
        ' ',
        'g'
      )
    ) AS clean_name_ar
  FROM base_names b
),
updated AS (
  UPDATE products p
  SET
    name_ar = f.clean_name_ar,
    name = f.clean_name_ar,
    updated_at = NOW()
  FROM fixed_names f
  WHERE p.id = f.id
    AND f.clean_name_ar <> ''
    AND (
      coalesce(p.name_ar, '') IS DISTINCT FROM f.clean_name_ar
      OR coalesce(p.name, '') IS DISTINCT FROM f.clean_name_ar
    )
  RETURNING p.id
)
SELECT 'names_normalized' AS step, COUNT(*)::int AS affected_rows FROM updated;

-- 2) Slug normalization only for obviously awkward slugs
WITH name_source AS (
  SELECT
    p.id,
    trim(
      regexp_replace(
        replace(replace(coalesce(NULLIF(p.name_ar, ''), NULLIF(p.name, ''), p.id::text), '-', ' '), '_', ' '),
        '\s+',
        ' ',
        'g'
      )
    ) AS clean_name
  FROM products p
),
slug_candidates AS (
  SELECT
    n.id,
    trim(
      BOTH '-'
      FROM regexp_replace(
        regexp_replace(
          lower(
            replace(
              replace(
                replace(
                  replace(
                    replace(n.clean_name, '،', '-'),
                  ',', '-'),
                '/', '-'),
              '(', ''),
            ')', '')
          ),
          '\s+',
          '-',
          'g'
        ),
        '-{2,}',
        '-',
        'g'
      )
    ) AS slug_base
  FROM name_source n
),
slug_ready AS (
  SELECT
    p.id,
    sc.slug_base,
    lower(
      substr(
        regexp_replace(coalesce(p.id::text, ''), '[^a-zA-Z0-9]+', '', 'g') || md5(p.id::text),
        1,
        6
      )
    ) AS stable_suffix
  FROM products p
  INNER JOIN slug_candidates sc ON sc.id = p.id
),
updated AS (
  UPDATE products p
  SET
    slug = CASE
      WHEN sr.slug_base = '' THEN coalesce(p.slug, p.id::text)
      ELSE sr.slug_base || '-' || sr.stable_suffix
    END,
    updated_at = NOW()
  FROM slug_ready sr
  WHERE p.id = sr.id
    AND sr.slug_base <> ''
    AND (
      p.slug IS NULL
      OR p.slug ~ '[A-Z ]'
      OR p.slug ~ '--'
      OR p.slug LIKE '%,%'
      OR p.slug LIKE '%،%'
      OR p.slug LIKE '%/%'
      OR p.slug LIKE '%(%'
      OR p.slug LIKE '%)%'
    )
  RETURNING p.id
)
SELECT 'slugs_normalized' AS step, COUNT(*)::int AS affected_rows FROM updated;

-- 3) Replace low-quality placeholder descriptions with cleaner, product-aware copy
WITH placeholders(txt) AS (
  VALUES
    ('منتج عناية مختار بعناية وجودة مناسبة للاستخدام اليومي.'),
    ('مكمل غذائي داعم للصحة العامة ضمن الاستخدام اليومي.'),
    ('منتج للعناية الشخصية والراحة اليومية.'),
    ('منتج عملي للمنزل والمطبخ والاستخدام اليومي.'),
    ('جهاز أو ملحق تقني عملي للاستخدام اليومي.'),
    ('منتج مخصص للأطفال للاستخدام المنزلي.'),
    ('منتج متنوع للاستخدام اليومي.')
),
targets AS (
  SELECT
    p.id,
    trim(coalesce(NULLIF(p.name_ar, ''), NULLIF(p.name, ''), 'منتج')) AS clean_name_ar,
    coalesce(p.category_id, 'various') AS category_id
  FROM products p
  WHERE EXISTS (
    SELECT 1
    FROM placeholders ph
    WHERE p.description_ar = ph.txt OR p.description = ph.txt
  )
),
updated AS (
  UPDATE products p
  SET
    description_ar = CASE
      WHEN t.category_id = 'beauty' THEN t.clean_name_ar || '، منتج للعناية بالبشرة والشعر بتركيبة مناسبة للاستخدام اليومي.'
      WHEN t.category_id = 'supplements' THEN t.clean_name_ar || '، مكمل غذائي داعم للصحة العامة ضمن الاستخدام اليومي.'
      WHEN t.category_id = 'personal' THEN t.clean_name_ar || '، منتج للعناية الشخصية والراحة اليومية.'
      WHEN t.category_id = 'home' THEN t.clean_name_ar || '، منتج عملي للمنزل والمطبخ والاستخدام اليومي.'
      WHEN t.category_id = 'smart' THEN t.clean_name_ar || '، جهاز أو ملحق تقني عملي للاستخدام اليومي.'
      WHEN t.category_id = 'kids' THEN t.clean_name_ar || '، منتج مناسب لاستخدام الأطفال داخل المنزل.'
      ELSE t.clean_name_ar || '، منتج متنوع للاستخدام اليومي.'
    END,
    description = CASE
      WHEN t.category_id = 'beauty' THEN t.clean_name_ar || '، منتج للعناية بالبشرة والشعر بتركيبة مناسبة للاستخدام اليومي.'
      WHEN t.category_id = 'supplements' THEN t.clean_name_ar || '، مكمل غذائي داعم للصحة العامة ضمن الاستخدام اليومي.'
      WHEN t.category_id = 'personal' THEN t.clean_name_ar || '، منتج للعناية الشخصية والراحة اليومية.'
      WHEN t.category_id = 'home' THEN t.clean_name_ar || '، منتج عملي للمنزل والمطبخ والاستخدام اليومي.'
      WHEN t.category_id = 'smart' THEN t.clean_name_ar || '، جهاز أو ملحق تقني عملي للاستخدام اليومي.'
      WHEN t.category_id = 'kids' THEN t.clean_name_ar || '، منتج مناسب لاستخدام الأطفال داخل المنزل.'
      ELSE t.clean_name_ar || '، منتج متنوع للاستخدام اليومي.'
    END,
    updated_at = NOW()
  FROM targets t
  WHERE p.id = t.id
  RETURNING p.id
)
SELECT 'descriptions_upgraded' AS step, COUNT(*)::int AS affected_rows FROM updated;

-- 4) High-confidence category correction
-- Conservative:
-- - For kids/supplements/smart we allow correction even if current category differs.
-- - For beauty/personal/home we mostly fill NULL/various only.
WITH base AS (
  SELECT
    p.id,
    p.category_id,
    lower(
      coalesce(p.name_ar, '') || ' ' ||
      coalesce(p.name, '') || ' ' ||
      coalesce(p.image_url, '')
    ) AS haystack
  FROM products p
),
predicted AS (
  SELECT
    b.id,
    b.category_id,
    CASE
      WHEN b.haystack ~ '(أطفال|الاطفال|لعبة|رضع|حظيرة|خيمة-لعب|درج-المرحاض-للأطفال|سجادات-صلاة-للأطفال|مدفأة-زجاجات-الأطفال)' THEN 'kids'
      WHEN b.haystack ~ '(فيتامين|ميلاتونين|مغنيزيوم|كيتو|قهوة-خضراء|اشواغاندا|بروبيوتيك|كولاجين|الزنك|جنجكة|بيوتين|قولون|السنا|شاي-علاجي|عرق-السوس|أحماض-دهنية)' THEN 'supplements'
      WHEN b.haystack ~ '(بلوتوث|واي-فاي|usb|lcd|كاميرا|مكبر-صوت|سماعة|تحكم-عن-بعد|جهاز-عرض|led|وحدة-تحكم-ألعاب|بانوراما)' THEN 'smart'
      WHEN b.haystack ~ '(كريم|سيروم|شامبو|ماسكارا|صبغة|عطر|تونر|قناع|تقشير|لوشن|تبييض|مكياج|حواجب|رموش|الشعر|البشرة|مزيل-شعر)' THEN 'beauty'
      WHEN b.haystack ~ '(دعامة|الركبة|العنق|القدمين|تدليك|مساج|ضغط|السكري|السمع|الأسنان|فطرية|البواسير|المفاصل|ظهر|الندبات|الأظافر)' THEN 'personal'
      WHEN b.haystack ~ '(مكنسة|مطبخ|قطاعة|خلاط|عصارة|ممسحة|دلو|خزانة|منظم|موقد|خرطوم|سكاكين|ميزان|ملعقة|صندوق-غداء|مضخة-مياه|موزع|رف-المطبخ|طاولة|كرسي|مصباح|ولاعة|فوهة|فلتر|كشاف|ختم-الأكياس|قوالب-الزلابية|مجفف-الأحذية)' THEN 'home'
      ELSE NULL
    END AS predicted_category
  FROM base b
),
to_update AS (
  SELECT p.*
  FROM predicted p
  WHERE p.predicted_category IS NOT NULL
    AND (
      p.category_id IS NULL
      OR p.category_id = 'various'
      OR (p.predicted_category IN ('kids', 'supplements', 'smart') AND p.category_id IS DISTINCT FROM p.predicted_category)
    )
),
updated AS (
  UPDATE products pr
  SET
    category_id = t.predicted_category,
    updated_at = NOW()
  FROM to_update t
  WHERE pr.id = t.id
    AND pr.category_id IS DISTINCT FROM t.predicted_category
  RETURNING pr.id
)
SELECT 'categories_corrected' AS step, COUNT(*)::int AS affected_rows FROM updated;

COMMIT;

-- ---------------------------
-- Manual review queries
-- ---------------------------

-- A) Exact duplicates by image_url
-- SELECT image_url, COUNT(*) AS dup_count, array_agg(id ORDER BY created_at) AS product_ids
-- FROM products
-- WHERE coalesce(image_url, '') <> ''
-- GROUP BY image_url
-- HAVING COUNT(*) > 1
-- ORDER BY dup_count DESC, image_url;

-- B) Near-duplicates by normalized Arabic name
-- WITH n AS (
--   SELECT
--     id,
--     trim(regexp_replace(lower(replace(replace(coalesce(name_ar, name, ''), '-', ' '), '_', ' ')), '\s+', ' ', 'g')) AS norm_name
--   FROM products
-- )
-- SELECT norm_name, COUNT(*) AS dup_count, array_agg(id) AS product_ids
-- FROM n
-- WHERE norm_name <> ''
-- GROUP BY norm_name
-- HAVING COUNT(*) > 1
-- ORDER BY dup_count DESC, norm_name;

-- C) Items still uncategorized / mixed quality
-- SELECT id, name_ar, slug, category_id, image_url
-- FROM products
-- WHERE category_id IS NULL OR category_id = 'various'
-- ORDER BY updated_at DESC
-- LIMIT 200;
