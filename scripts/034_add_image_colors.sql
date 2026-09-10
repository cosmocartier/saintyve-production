-- Add color support to product images
ALTER TABLE product_images
ADD COLUMN color_name TEXT,
ADD COLUMN color_hex TEXT;

-- Create index for color filtering
CREATE INDEX idx_product_images_color ON product_images(color_name);

-- Add comment
COMMENT ON COLUMN product_images.color_name IS 'Display name for the color (e.g., "Black", "White", "Navy")';
COMMENT ON COLUMN product_images.color_hex IS 'Hex code for the color swatch (e.g., "#000000")';
