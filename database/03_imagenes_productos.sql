-- =====================================================================
--  VentaFácil · Fotos de los productos de prueba (las mismas del prototipo de Figma Make)
--  Úsalo solo si ya ejecutaste 02_datos_prueba.sql antes de que incluyera las fotos.
--  Ejecutar con "Execute SQL Script" (Alt+X)
-- =====================================================================
UPDATE productos SET imagen_url = CASE codigo
  WHEN 'BEB-001' THEN 'https://images.unsplash.com/photo-1656269457984-bd54c519129a?auto=format&fit=crop&w=600&q=80'
  WHEN 'BEB-014' THEN 'https://images.unsplash.com/photo-1598830853058-3474f6a66003?auto=format&fit=crop&w=600&q=80'
  WHEN 'ALI-021' THEN 'https://images.unsplash.com/photo-1665088127661-83aeff6104c4?auto=format&fit=crop&w=600&q=80'
  WHEN 'ALI-008' THEN 'https://images.unsplash.com/photo-1702097034630-88a759b9923f?auto=format&fit=crop&w=600&q=80'
  WHEN 'BEB-027' THEN 'https://images.unsplash.com/photo-1656269438626-9e900263bc64?auto=format&fit=crop&w=600&q=80'
  WHEN 'ASE-004' THEN 'https://images.unsplash.com/photo-1656269457984-bd54c519129a?auto=format&fit=crop&w=600&q=80'
  WHEN 'ALI-034' THEN 'https://images.unsplash.com/photo-1702097034630-88a759b9923f?auto=format&fit=crop&w=600&q=80'
  WHEN 'BEB-033' THEN 'https://images.unsplash.com/photo-1598830853058-3474f6a66003?auto=format&fit=crop&w=600&q=80'
  ELSE imagen_url
END
WHERE codigo IN ('BEB-001', 'BEB-014', 'ALI-021', 'ALI-008', 'BEB-027', 'ASE-004', 'ALI-034', 'BEB-033');

SELECT codigo, nombre, imagen_url FROM productos;
