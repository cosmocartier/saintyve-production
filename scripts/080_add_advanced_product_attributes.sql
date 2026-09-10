-- Add advanced product attribute columns to products table
-- This extends the existing products table with category-specific attributes

-- A) Global fields (apply to all products)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS fit_profile TEXT
  CHECK (fit_profile IN (
    'true_to_size',
    'slightly_oversized', 
    'oversized',
    'relaxed_fit',
    'slim_fit',
    'cropped_fit',
    'boxy_fit'
  )),
ADD COLUMN IF NOT EXISTS sizing_recommendation TEXT
  CHECK (sizing_recommendation IN (
    'take_usual_size',
    'size_up_for_looser_fit',
    'size_down_for_closer_fit',
    'if_between_size_up',
    'if_between_size_down'
  )),
ADD COLUMN IF NOT EXISTS weight_feel TEXT
  CHECK (weight_feel IN (
    'lightweight',
    'midweight',
    'heavyweight',
    'structured',
    'soft_structured'
  )),
ADD COLUMN IF NOT EXISTS seasonality TEXT[]
  CHECK (seasonality <@ ARRAY['spring', 'summer', 'autumn', 'winter', 'all_season']::TEXT[]);

-- B) Apparel / Footwear fields (Sneaker, Jacket, Vest)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS silhouette TEXT
  CHECK (silhouette IN (
    'low_top',
    'mid_top',
    'high_top',
    'boxy',
    'straight_cut',
    'cropped',
    'longline'
  )),
ADD COLUMN IF NOT EXISTS closure_type TEXT
  CHECK (closure_type IN (
    'lace_up',
    'zip',
    'buttons',
    'snaps',
    'pullover'
  )),
ADD COLUMN IF NOT EXISTS lining_type TEXT
  CHECK (lining_type IN (
    'unlined',
    'light_lining',
    'sherpa_lining',
    'quilted_lining',
    'down_filled'
  ));

-- C) Bags / Accessories fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS dimension_width_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS dimension_height_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS dimension_depth_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS capacity_type TEXT
  CHECK (capacity_type IN (
    'compact_essentials',
    'daily_essentials',
    'laptop_compatible',
    'travel_sized',
    'statement_accessory'
  )),
ADD COLUMN IF NOT EXISTS carry_style TEXT
  CHECK (carry_style IN (
    'handheld',
    'shoulder',
    'crossbody',
    'convertible',
    'wrist'
  ));

-- D) Watches / Jewelry fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_mm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS length_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS fastening_type TEXT
  CHECK (fastening_type IN (
    'clasp',
    'adjustable_clasp',
    'buckle',
    'slip_on'
  ));

-- E) Optional narrative signals
ALTER TABLE products
ADD COLUMN IF NOT EXISTS statement_level TEXT
  CHECK (statement_level IN (
    'minimal',
    'subtle_statement',
    'bold_statement'
  )),
ADD COLUMN IF NOT EXISTS drop_context TEXT
  CHECK (drop_context IN (
    'seasonal_release',
    'limited_style_release',
    'core_collection'
  ));

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_products_fit_profile ON products(fit_profile) WHERE fit_profile IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_silhouette ON products(silhouette) WHERE silhouette IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_carry_style ON products(carry_style) WHERE carry_style IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_capacity_type ON products(capacity_type) WHERE capacity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_weight_feel ON products(weight_feel) WHERE weight_feel IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_statement_level ON products(statement_level) WHERE statement_level IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.fit_profile IS 'How the product fits relative to standard sizing';
COMMENT ON COLUMN products.sizing_recommendation IS 'Sizing guidance for customers';
COMMENT ON COLUMN products.seasonality IS 'Seasons this product is suitable for (array)';
COMMENT ON COLUMN products.silhouette IS 'Overall shape/cut of the product';
COMMENT ON COLUMN products.closure_type IS 'How the product fastens/closes';
COMMENT ON COLUMN products.lining_type IS 'Interior lining material/construction';
COMMENT ON COLUMN products.dimension_width_cm IS 'Width in centimeters (bags/accessories)';
COMMENT ON COLUMN products.dimension_height_cm IS 'Height in centimeters (bags/accessories)';
COMMENT ON COLUMN products.dimension_depth_cm IS 'Depth in centimeters (bags/accessories)';
COMMENT ON COLUMN products.capacity_type IS 'What the bag can hold/carry';
COMMENT ON COLUMN products.carry_style IS 'How the bag is carried';
COMMENT ON COLUMN products.size_mm IS 'Size in millimeters (watches)';
COMMENT ON COLUMN products.length_cm IS 'Length in centimeters (jewelry)';
COMMENT ON COLUMN products.fastening_type IS 'How the watch/jewelry fastens';
COMMENT ON COLUMN products.statement_level IS 'How bold/statement-making the design is';
COMMENT ON COLUMN products.drop_context IS 'Product release/collection context';
