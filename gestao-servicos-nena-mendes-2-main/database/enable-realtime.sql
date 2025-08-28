-- Habilitar Real-time para as tabelas
-- Execute este SQL no Supabase SQL Editor

-- Habilitar Real-time para produtos
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Habilitar Real-time para categorias
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- Habilitar Real-time para marcas
ALTER PUBLICATION supabase_realtime ADD TABLE brands;

-- Habilitar Real-time para serviços
ALTER PUBLICATION supabase_realtime ADD TABLE services;

-- Habilitar Real-time para produtos de serviços
ALTER PUBLICATION supabase_realtime ADD TABLE service_products;
