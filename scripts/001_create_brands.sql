-- Table des marques avec leur prix de base
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Désactiver RLS car c'est une table publique en lecture seule
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "Allow public read access" ON brands FOR SELECT USING (true);

-- Insérer quelques marques de luxe avec leurs prix de base
INSERT INTO brands (name, base_price) VALUES
  ('Louis Vuitton', 1500.00),
  ('Gucci', 1200.00),
  ('Chanel', 2000.00),
  ('Hermès', 3000.00),
  ('Dior', 1400.00),
  ('Prada', 1100.00),
  ('Balenciaga', 900.00),
  ('Burberry', 800.00),
  ('Versace', 950.00),
  ('Fendi', 1000.00),
  ('Saint Laurent', 1100.00),
  ('Givenchy', 1050.00),
  ('Valentino', 1200.00),
  ('Bottega Veneta', 1300.00),
  ('Celine', 1150.00),
  ('Loewe', 1000.00),
  ('Moncler', 850.00),
  ('Off-White', 600.00),
  ('Acne Studios', 500.00),
  ('The North Face', 250.00),
  ('Nike', 150.00),
  ('Adidas', 120.00),
  ('Zara', 80.00),
  ('H&M', 50.00)
ON CONFLICT (name) DO NOTHING;
