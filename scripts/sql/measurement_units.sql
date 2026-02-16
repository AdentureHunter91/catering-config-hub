-- Measurement units table
CREATE TABLE IF NOT EXISTS measurement_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE COMMENT 'e.g. g, kg, ml, l, szt',
  name VARCHAR(50) NOT NULL COMMENT 'e.g. gram, kilogram, mililitr',
  type ENUM('mass','volume','piece') NOT NULL DEFAULT 'mass',
  base_unit_symbol VARCHAR(10) DEFAULT NULL COMMENT 'base unit for conversions: g for mass, ml for volume',
  to_base_factor DECIMAL(15,6) NOT NULL DEFAULT 1.000000 COMMENT 'multiply by this to get base unit value',
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default units
INSERT INTO measurement_units (symbol, name, type, base_unit_symbol, to_base_factor, sort_order) VALUES
('g',   'gram',      'mass',   NULL,  1.000000, 1),
('kg',  'kilogram',  'mass',   'g',   1000.000000, 2),
('ml',  'mililitr',  'volume', NULL,  1.000000, 3),
('l',   'litr',      'volume', 'ml',  1000.000000, 4),
('szt', 'sztuka',    'piece',  NULL,  1.000000, 5);
