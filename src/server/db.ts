import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Address,
  CartItem,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
  User,
} from '../types';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  orders: Order[];
  settings: StoreSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'supermarket_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default settings
const defaultSettings: StoreSettings = {
  storeName: 'MercadoFresco',
  storeAddress: 'Av. Libertador 1250, Distrito Central',
  storePhone: '+34 910 123 456',
  supportEmail: 'soporte@mercadofresco.com',
  standardDeliveryFee: 3.99,
  freeDeliveryThreshold: 40.0,
  taxRate: 0.10,
  currencySymbol: '$',
  currencyCode: 'USD',
  workingHours: 'Lunes a Domingo 08:00 - 22:00',
  announcementBanner: {
    enabled: true,
    text: '🌱 Envío GRATIS en compras mayores a $40 · Entrega fresca el mismo día en franja horaria a tu elección',
  },
};

const initialCategories: Category[] = [
  {
    id: 'frutas-verduras',
    name: 'Frutas y Verduras',
    slug: 'frutas-verduras',
    icon: 'Apple',
    description: 'Cosechas frescas locales seleccionadas diariamente',
    bannerImage: '/src/assets/images/category_fresh_produce_1794193229627.jpg',
  },
  {
    id: 'lacteos-huevos',
    name: 'Lácteos y Huevos',
    slug: 'lacteos-huevos',
    icon: 'Milk',
    description: 'Leches de granja, quesos artesanales y huevos camperos',
    bannerImage: '/src/assets/images/category_bakery_dairy_1794193229267.jpg',
  },
  {
    id: 'panaderia',
    name: 'Panadería y Masas',
    slug: 'panaderia',
    icon: 'Croissant',
    description: 'Panes de masa madre, hojaldres y harinas ecológicas',
    bannerImage: '/src/assets/images/category_bakery_dairy_1794193229267.jpg',
  },
  {
    id: 'carnes-pescados',
    name: 'Carnes y Pescados',
    slug: 'carnes-pescados',
    icon: 'Beef',
    description: 'Cortes premium de origen certificado y pescadería fresca',
  },
  {
    id: 'despensa',
    name: 'Despensa y Granos',
    slug: 'despensa',
    icon: 'Package',
    description: 'Aceites vírgenes, pastas artesanales, arroces y legumbres',
  },
  {
    id: 'bebidas',
    name: 'Bebidas y Zumos',
    slug: 'bebidas',
    icon: 'Coffee',
    description: 'Cafés de especialidad, zumos 100% naturales y aguas de manantial',
  },
  {
    id: 'limpieza',
    name: 'Limpieza y Hogar',
    slug: 'limpieza',
    icon: 'Sparkles',
    description: 'Detergentes biodegradables y artículos esenciales para el hogar',
  },
  {
    id: 'cuidado-personal',
    name: 'Cuidado Personal',
    slug: 'cuidado-personal',
    icon: 'Heart',
    description: 'Jabones botánicos, champús naturales e higiene diaria',
  },
];

const initialProducts: Product[] = [
  // Frutas y Verduras
  {
    id: 'prod-01',
    sku: 'FV-001',
    name: 'Plátano de Canarias IGP',
    description: 'Plátanos madurados al sol en La Palma, dulces y ricos en potasio. Cosecha fresca con indicación geográfica protegida.',
    category: 'frutas-verduras',
    subcategory: 'Frutas',
    price: 2.19,
    compareAtPrice: 2.65,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 45,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'local', 'oferta'],
    origin: 'Canarias, España',
    nutritionalInfo: { calories: 89, carbs: '23g', fiber: '2.6g', protein: '1.1g' },
    isFeatured: true,
    barcode: '841000100101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-02',
    sku: 'FV-002',
    name: 'Aguacate Hass Premium',
    description: 'Aguacate cremoso punto óptimo de maduración, cultivado de forma sostenible sin pesticidas sintéticos.',
    category: 'frutas-verduras',
    subcategory: 'Frutas',
    price: 4.80,
    compareAtPrice: 5.50,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 32,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    origin: 'Málaga, España',
    nutritionalInfo: { calories: 160, carbs: '9g', fiber: '7g', protein: '2g', fat: '15g' },
    isFeatured: true,
    barcode: '841000100102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-03',
    sku: 'FV-003',
    name: 'Tomate Rosa de Barbastro',
    description: 'Tomates gigantes de piel fina, pulpa carnosa y sabor intenso aromático tradicional.',
    category: 'frutas-verduras',
    subcategory: 'Verduras',
    price: 3.95,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 28,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'local'],
    origin: 'Huesca, España',
    nutritionalInfo: { calories: 18, carbs: '3.9g', fiber: '1.2g', protein: '0.9g' },
    isFeatured: true,
    barcode: '841000100103',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-04',
    sku: 'FV-004',
    name: 'Espinacas Baby Orgánicas',
    description: 'Hojas tiernas listas para ensaladas o salteados rápidos, lavadas con agua purificada ozonizada.',
    category: 'frutas-verduras',
    subcategory: 'Verduras',
    price: 1.85,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 20,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'vegano'],
    origin: 'Navarra, España',
    nutritionalInfo: { calories: 23, protein: '2.9g', fiber: '2.2g' },
    barcode: '841000100104',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-05',
    sku: 'FV-005',
    name: 'Manzana Fuji de Montaña',
    description: 'Manzanas crujientes, de dulzura equilibrada y textura jugosa cultivadas a más de 800m de altitud.',
    category: 'frutas-verduras',
    subcategory: 'Frutas',
    price: 2.75,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 50,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    tags: ['local'],
    origin: 'Girona, España',
    barcode: '841000100105',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-06',
    sku: 'FV-006',
    name: 'Limón Primofiori Ecológico',
    description: 'Limones con alto contenido en zumo aromático y piel sin ceras químicas, ideales para repostería.',
    category: 'frutas-verduras',
    subcategory: 'Frutas',
    price: 2.30,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 35,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    origin: 'Murcia, España',
    barcode: '841000100106',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Lácteos y Huevos
  {
    id: 'prod-07',
    sku: 'LH-001',
    name: 'Leche Entera de Pastoreo Bio',
    description: 'Leche fresca pasteurizada de vacas criadas en libertad alimentadas exclusivamente con pastos verdes.',
    category: 'lacteos-huevos',
    subcategory: 'Leche',
    price: 1.65,
    compareAtPrice: 1.95,
    unit: 'litro',
    unitStep: 1,
    stockQuantity: 60,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'local', 'oferta'],
    origin: 'Galicia, España',
    nutritionalInfo: { calories: 64, protein: '3.2g', carbs: '4.8g', fat: '3.6g' },
    isFeatured: true,
    barcode: '841000200101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-08',
    sku: 'LH-002',
    name: 'Huevos Camperos Clase 0 Bio (12 uds)',
    description: 'Huevos de gallinas libres en praderas ecológicas. Yema de color intenso dorado y sabor auténtico.',
    category: 'lacteos-huevos',
    subcategory: 'Huevos',
    price: 3.45,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 40,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'local'],
    origin: 'Segovia, España',
    nutritionalInfo: { calories: 143, protein: '12.6g', fat: '9.5g' },
    isFeatured: true,
    barcode: '841000200102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-09',
    sku: 'LH-003',
    name: 'Queso Manchego Curado DO 6 Meses',
    description: 'Cuña de 300g elaborada con leche pura de oveja manchega. Textura firme con notas a frutos secos.',
    category: 'lacteos-huevos',
    subcategory: 'Quesos',
    price: 6.90,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 25,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten', 'local'],
    origin: 'Castilla-La Mancha, España',
    barcode: '841000200103',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-10',
    sku: 'LH-004',
    name: 'Yogur Griego Natural Artesanal 500g',
    description: 'Cremoso, espeso y sin azúcares añadidos ni conservantes. Fermentación lenta tradicional.',
    category: 'lacteos-huevos',
    subcategory: 'Yogures',
    price: 2.25,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 30,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten'],
    barcode: '841000200104',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Panadería y Masas
  {
    id: 'prod-11',
    sku: 'PAN-001',
    name: 'Hogaza de Masa Madre Tradicional 800g',
    description: 'Fermentación en bloque durante 24 horas con harina molida a la piedra. Corteza crujiente y miga esponjosa.',
    category: 'panaderia',
    subcategory: 'Pan Artesanal',
    price: 3.20,
    compareAtPrice: 3.75,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 24,
    inStock: true,
    image: '/src/assets/images/category_bakery_dairy_1794193229267.jpg',
    tags: ['organico', 'vegano', 'oferta'],
    origin: 'Obrador Local',
    isFeatured: true,
    barcode: '841000300101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-12',
    sku: 'PAN-002',
    name: 'Croissant de Mantequilla Francesa (4 uds)',
    description: 'Auténtico hojaldrado con mantequilla pura AOP de Charentes. Crujiente por fuera y tierno por dentro.',
    category: 'panaderia',
    subcategory: 'Bollería',
    price: 4.10,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 18,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    tags: ['local'],
    barcode: '841000300102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-13',
    sku: 'PAN-003',
    name: 'Pan de Centeno 100% Integral con Semillas',
    description: 'Rico en fibra natural con semillas tostadas de calabaza, sésamo y girasol. Ideal para tostadas nutritivas.',
    category: 'panaderia',
    subcategory: 'Pan Artesanal',
    price: 3.40,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 15,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    barcode: '841000300103',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Carnes y Pescados
  {
    id: 'prod-14',
    sku: 'CP-001',
    name: 'Pechuga de Pollo Campero Certificado',
    description: 'Filetes limpios de pollo alimentado con cereales nobles y libre de antibióticos preventivos.',
    category: 'carnes-pescados',
    subcategory: 'Aves',
    price: 7.95,
    compareAtPrice: 8.90,
    unit: 'kg',
    unitStep: 0.5,
    stockQuantity: 22,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten', 'oferta', 'local'],
    origin: 'Castilla y León',
    nutritionalInfo: { calories: 120, protein: '26g', fat: '1.5g' },
    isFeatured: true,
    barcode: '841000400101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-15',
    sku: 'CP-002',
    name: 'Lomos de Salmón Noruego Fresco 400g',
    description: 'Corte limpio sin espinas, rico en ácidos grasos Omega-3. Ideal para plancha o tartar.',
    category: 'carnes-pescados',
    subcategory: 'Pescados',
    price: 9.80,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 14,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten'],
    nutritionalInfo: { calories: 208, protein: '20g', fat: '13g' },
    barcode: '841000400102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-16',
    sku: 'CP-003',
    name: 'Entrecot de Ternera Madurada 350g',
    description: 'Ternera criada en dehesas, con maduración mínima de 28 días para una terneza y jugosidad excepcionales.',
    category: 'carnes-pescados',
    subcategory: 'Carnes',
    price: 11.50,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 16,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten', 'local'],
    barcode: '841000400103',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Despensa y Granos
  {
    id: 'prod-17',
    sku: 'DES-001',
    name: 'Aceite de Oliva Virgen Extra Picual 1L',
    description: 'Extracción en frío de primera cosecha. Aromas herbáceos, notas a tomatera y equilibrado amargor suave.',
    category: 'despensa',
    subcategory: 'Aceites',
    price: 8.95,
    compareAtPrice: 10.50,
    unit: 'litro',
    unitStep: 1,
    stockQuantity: 50,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'vegano', 'local', 'oferta'],
    origin: 'Jaén, España',
    isFeatured: true,
    barcode: '841000500101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-18',
    sku: 'DES-002',
    name: 'Pasta Tagliatelle de Trigo Bronce 500g',
    description: 'Trefilada al bronce con secado lento a baja temperatura. Superficie porosa que retiene a la perfección las salsas.',
    category: 'despensa',
    subcategory: 'Pastas',
    price: 2.45,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 38,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80',
    tags: ['vegano'],
    origin: 'Gragnano, Italia',
    barcode: '841000500102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-19',
    sku: 'DES-003',
    name: 'Arroz Bomba D.O. Calasparra 1kg',
    description: 'Grano redondo especial para paellas y arroces melosos. Gran capacidad de absorción de caldos sin pasarse.',
    category: 'despensa',
    subcategory: 'Arroces',
    price: 3.60,
    unit: 'kg',
    unitStep: 1,
    stockQuantity: 30,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten', 'local'],
    barcode: '841000500103',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-20',
    sku: 'DES-004',
    name: 'Café Grano Colombia Geisha 250g',
    description: 'Café de especialidad tostado artesanalmente. Notas a jazmín, melocotón y caramelo dulce.',
    category: 'despensa',
    subcategory: 'Café',
    price: 7.50,
    unit: 'pack',
    unitStep: 1,
    stockQuantity: 25,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    barcode: '841000500104',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Bebidas y Zumos
  {
    id: 'prod-21',
    sku: 'BEB-001',
    name: 'Zumo de Naranja Natural 100% Exprimido 1L',
    description: 'Sin concentrados, sin conservantes ni azúcares añadidos. Embotellado en frío el mismo día.',
    category: 'bebidas',
    subcategory: 'Zumos',
    price: 2.85,
    unit: 'litro',
    unitStep: 1,
    stockQuantity: 40,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'vegano', 'local'],
    origin: 'Valencia, España',
    barcode: '841000600101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-22',
    sku: 'BEB-002',
    name: 'Agua Mineral de Manantial Cabreiroá 1.5L',
    description: 'Agua de mineralización equilibrada embotellada en botella de vidrio retornable 100% sostenible.',
    category: 'bebidas',
    subcategory: 'Agua',
    price: 0.95,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 70,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    tags: ['sin_gluten', 'vegano'],
    barcode: '841000600102',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-23',
    sku: 'BEB-003',
    name: 'Kombucha Artesana de Jengibre y Limón 330ml',
    description: 'Té fermentado probiótico natural, bajo en azúcar, burbuja fina y refrescante toque cítrico picante.',
    category: 'bebidas',
    subcategory: 'Fermentados',
    price: 2.50,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 25,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'sin_gluten', 'vegano'],
    barcode: '841000600103',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Limpieza y Hogar
  {
    id: 'prod-24',
    sku: 'LIM-001',
    name: 'Detergente Ecológico Lavadora 1.5L (30 lavados)',
    description: 'Fórmula vegetal biodegradable para ropa blanca y color. Hipoalergénico sin fosfatos ni perfumes artificiales.',
    category: 'limpieza',
    subcategory: 'Ropa',
    price: 6.45,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 28,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=800&auto=format&fit=crop&q=80',
    tags: ['organico'],
    barcode: '841000700101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-25',
    sku: 'LIM-002',
    name: 'Lavavajillas Concentrado Aloe Vera 750ml',
    description: 'Desengrasa eficazmente cuidando la piel de las manos con extracto puro de aloe vera ecológico.',
    category: 'limpieza',
    subcategory: 'Vajilla',
    price: 2.70,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 35,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=80',
    tags: ['organico'],
    barcode: '841000700102',
    createdAt: '2026-01-01T00:00:00Z',
  },

  // Cuidado Personal
  {
    id: 'prod-26',
    sku: 'CP-001-P',
    name: 'Gel de Baño Botánico Lavanda & Romero 500ml',
    description: 'Limpia suavemente con aceites esenciales relajantes de cultivo biológico. Envase de aluminio recargable.',
    category: 'cuidado-personal',
    subcategory: 'Higiene',
    price: 4.90,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 22,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    barcode: '841000800101',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-27',
    sku: 'CP-002-P',
    name: 'Pasta Dentífrica Natural con Menta & Xilitol 100ml',
    description: 'Sin flúor artificial ni sulfatos, remineraliza el esmalte de forma natural dejando un aliento fresco duradero.',
    category: 'cuidado-personal',
    subcategory: 'Dental',
    price: 3.50,
    unit: 'unidad',
    unitStep: 1,
    stockQuantity: 30,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1559591937-e1032c25e40e?w=800&auto=format&fit=crop&q=80',
    tags: ['organico', 'vegano'],
    barcode: '841000800102',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const initialCoupons: Coupon[] = [
  {
    code: 'FRESCO10',
    discountPercent: 10,
    minPurchase: 20.0,
    expiresAt: '2030-12-31T23:59:59Z',
    isActive: true,
    timesUsed: 14,
  },
  {
    code: 'ENVIOGRATIS',
    isFreeShipping: true,
    minPurchase: 25.0,
    expiresAt: '2030-12-31T23:59:59Z',
    isActive: true,
    timesUsed: 31,
  },
  {
    code: 'BIENVENIDO',
    discountFixed: 5.0,
    minPurchase: 25.0,
    expiresAt: '2030-12-31T23:59:59Z',
    isActive: true,
    timesUsed: 9,
  },
  {
    code: 'SUPER20',
    discountPercent: 20,
    minPurchase: 60.0,
    expiresAt: '2030-12-31T23:59:59Z',
    isActive: true,
    timesUsed: 4,
  },
];

// Helper to seed database with users and historical orders
function createInitialDatabase(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
  const clientPasswordHash = bcrypt.hashSync('Cliente123!', 10);

  const customerAddress: Address = {
    id: 'addr-1',
    label: 'Casa Principal',
    recipient: 'Sofía Navarro',
    street: 'Calle Serrano 48',
    apartment: '3º Izquierda',
    city: 'Madrid',
    postalCode: '28001',
    phone: '+34 612 345 678',
    instructions: 'Tocar el interfono 3B, dejar con el conserje si no responde.',
    isDefault: true,
  };

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'Administrador MercadoFresco',
      email: 'admin@mercadofresco.com',
      phone: '+34 910 000 001',
      role: 'admin',
      addresses: [],
      createdAt: '2026-01-01T00:00:00Z',
      passwordHash: adminPasswordHash,
    },
    {
      id: 'usr-client-1',
      name: 'Sofía Navarro',
      email: 'cliente@mercadofresco.com',
      phone: '+34 612 345 678',
      role: 'customer',
      addresses: [customerAddress],
      createdAt: '2026-01-10T00:00:00Z',
      passwordHash: clientPasswordHash,
    },
  ];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const orders: Order[] = [
    {
      id: 'ord-9021',
      orderNumber: 'MF-9021',
      userId: 'usr-client-1',
      customerName: 'Sofía Navarro',
      customerEmail: 'cliente@mercadofresco.com',
      customerPhone: '+34 612 345 678',
      deliveryAddress: customerAddress,
      deliveryDate: todayStr,
      deliverySlot: 'Hoy 19:00 - 21:00',
      items: [
        {
          productId: 'prod-01',
          name: 'Plátano de Canarias IGP',
          unit: 'kg',
          quantity: 2,
          price: 2.19,
          lineTotal: 4.38,
          image: initialProducts[0].image,
        },
        {
          productId: 'prod-07',
          name: 'Leche Entera de Pastoreo Bio',
          unit: 'litro',
          quantity: 4,
          price: 1.65,
          lineTotal: 6.60,
          image: initialProducts[6].image,
        },
        {
          productId: 'prod-11',
          name: 'Hogaza de Masa Madre Tradicional 800g',
          unit: 'unidad',
          quantity: 1,
          price: 3.20,
          lineTotal: 3.20,
          image: initialProducts[10].image,
        },
        {
          productId: 'prod-17',
          name: 'Aceite de Oliva Virgen Extra Picual 1L',
          unit: 'litro',
          quantity: 2,
          price: 8.95,
          lineTotal: 17.90,
          image: initialProducts[16].image,
        },
      ],
      subtotal: 32.08,
      discount: 3.21,
      couponCode: 'FRESCO10',
      deliveryFee: 3.99,
      tax: 2.89,
      total: 35.75,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      orderStatus: 'in_transit',
      statusHistory: [
        { status: 'received', timestamp: new Date(now.getTime() - 7200000).toISOString(), note: 'Orden recibida en sistema.' },
        { status: 'confirmed', timestamp: new Date(now.getTime() - 5400000).toISOString(), note: 'Pago aprobado y orden confirmada.' },
        { status: 'preparing', timestamp: new Date(now.getTime() - 3600000).toISOString(), note: 'En empaque y control de calidad en bodega.' },
        { status: 'in_transit', timestamp: new Date(now.getTime() - 1200000).toISOString(), note: 'Repartidor en camino en furgoneta refrigerada.' },
      ],
      notes: 'Llamar antes de subir.',
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: 'ord-8840',
      orderNumber: 'MF-8840',
      userId: 'usr-client-1',
      customerName: 'Sofía Navarro',
      customerEmail: 'cliente@mercadofresco.com',
      customerPhone: '+34 612 345 678',
      deliveryAddress: customerAddress,
      deliveryDate: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
      deliverySlot: 'Ayer 10:00 - 12:00',
      items: [
        {
          productId: 'prod-02',
          name: 'Aguacate Hass Premium',
          unit: 'kg',
          quantity: 1.5,
          price: 4.80,
          lineTotal: 7.20,
        },
        {
          productId: 'prod-08',
          name: 'Huevos Camperos Clase 0 Bio (12 uds)',
          unit: 'pack',
          quantity: 2,
          price: 3.45,
          lineTotal: 6.90,
        },
        {
          productId: 'prod-15',
          name: 'Lomos de Salmón Noruego Fresco 400g',
          unit: 'pack',
          quantity: 2,
          price: 9.80,
          lineTotal: 19.60,
        },
      ],
      subtotal: 33.70,
      discount: 0,
      deliveryFee: 3.99,
      tax: 3.37,
      total: 41.06,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      statusHistory: [
        { status: 'received', timestamp: new Date(now.getTime() - 90000000).toISOString() },
        { status: 'confirmed', timestamp: new Date(now.getTime() - 88000000).toISOString() },
        { status: 'preparing', timestamp: new Date(now.getTime() - 85000000).toISOString() },
        { status: 'in_transit', timestamp: new Date(now.getTime() - 83000000).toISOString() },
        { status: 'delivered', timestamp: new Date(now.getTime() - 80000000).toISOString(), note: 'Entregado en mano en el domicilio.' },
      ],
      createdAt: new Date(now.getTime() - 90000000).toISOString(),
    },
  ];

  return {
    users,
    products: initialProducts,
    categories: initialCategories,
    coupons: initialCoupons,
    orders,
    settings: defaultSettings,
  };
}

// Database class with thread-safe atomic file writes
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required collections exist
        if (parsed.users && parsed.products && parsed.categories && parsed.orders && parsed.settings) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load existing database, re-initializing...', e);
    }
    const fresh = createInitialDatabase();
    this.persist(fresh);
    return fresh;
  }

  private persist(dataToSave: DatabaseSchema = this.data) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Users
  getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'customer' | 'admin';
  }) {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      role: userData.role || 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    this.data.users.push(newUser);
    this.persist();
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  verifyCredentials(email: string, passwordAttempt: string) {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const isValid = bcrypt.compareSync(passwordAttempt, user.passwordHash);
    if (!isValid) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  updateUserProfile(userId: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado.');
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      id: userId,
      role: this.data.users[idx].role, // Prevent unauthorized role escalation
      email: this.data.users[idx].email,
    };
    this.persist();
    const { passwordHash: _, ...safeUser } = this.data.users[idx];
    return safeUser;
  }

  addUserAddress(userId: string, address: Omit<Address, 'id'>) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado.');
    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    if (newAddress.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(newAddress);
    this.persist();
    return newAddress;
  }

  // Products
  getProducts(filters?: {
    category?: string;
    search?: string;
    tag?: string;
    sort?: 'price_asc' | 'price_desc' | 'name' | 'featured';
    inStockOnly?: boolean;
  }) {
    let result = [...this.data.products];

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters?.tag) {
      result = result.filter((p) => p.tags.includes(filters.tag!));
    }

    if (filters?.inStockOnly) {
      result = result.filter((p) => p.inStock && p.stockQuantity > 0);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  }

  getProductById(id: string) {
    return this.data.products.find((p) => p.id === id) || null;
  }

  createProduct(productData: Omit<Product, 'id' | 'createdAt'>) {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      inStock: productData.stockQuantity > 0,
    };
    this.data.products.unshift(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Producto no encontrado.');

    const updated = {
      ...this.data.products[idx],
      ...updates,
      id,
    };

    if (typeof updates.stockQuantity === 'number') {
      updated.inStock = updates.stockQuantity > 0;
    }

    this.data.products[idx] = updated;
    this.persist();
    return updated;
  }

  deleteProduct(id: string) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Producto no encontrado.');
    this.data.products.splice(idx, 1);
    this.persist();
    return true;
  }

  // Categories
  getCategories() {
    // Dynamically calculate product counts
    return this.data.categories.map((cat) => ({
      ...cat,
      productCount: this.data.products.filter((p) => p.category === cat.id).length,
    }));
  }

  // Coupons
  getCoupons() {
    return this.data.coupons;
  }

  getCouponByCode(code: string) {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase()) || null;
  }

  createCoupon(couponData: Omit<Coupon, 'timesUsed'>) {
    const existing = this.getCouponByCode(couponData.code);
    if (existing) throw new Error('Ya existe un cupón con este código.');
    const newCoupon: Coupon = {
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
      timesUsed: 0,
    };
    this.data.coupons.push(newCoupon);
    this.persist();
    return newCoupon;
  }

  deleteCoupon(code: string) {
    const idx = this.data.coupons.findIndex((c) => c.code === code.toUpperCase());
    if (idx === -1) throw new Error('Cupón no encontrado.');
    this.data.coupons.splice(idx, 1);
    this.persist();
    return true;
  }

  // Orders
  getOrders(filters?: { userId?: string; status?: OrderStatus }) {
    let result = [...this.data.orders];
    if (filters?.userId) {
      result = result.filter((o) => o.userId === filters.userId);
    }
    if (filters?.status) {
      result = result.filter((o) => o.orderStatus === filters.status);
    }
    // Newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>) {
    // Decrement stock for ordered items
    for (const item of orderData.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stockQuantity - item.quantity);
        this.updateProduct(product.id, {
          stockQuantity: newStock,
          inStock: newStock > 0,
        });
      }
    }

    // Increment coupon usage if used
    if (orderData.couponCode) {
      const coupon = this.getCouponByCode(orderData.couponCode);
      if (coupon) {
        coupon.timesUsed += 1;
      }
    }

    const orderNumber = `MF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: orderData.orderStatus || 'received',
          timestamp: new Date().toISOString(),
          note: 'Pedido recibido en el sistema y registrado correctamente.',
        },
      ],
    };

    this.data.orders.unshift(newOrder);
    this.persist();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Pedido no encontrado.');

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Estado actualizado a ${status}.`,
    });

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    this.persist();
    return order;
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings: Partial<StoreSettings>) {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings,
    };
    this.persist();
    return this.data.settings;
  }

  // Dashboard Analytics & KPI Metrics
  getAdminMetrics() {
    const totalOrders = this.data.orders.length;
    const deliveredOrders = this.data.orders.filter((o) => o.orderStatus === 'delivered');
    const activeOrders = this.data.orders.filter(
      (o) => !['delivered', 'cancelled'].includes(o.orderStatus)
    );
    const totalRevenue = this.data.orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const lowStockProducts = this.data.products.filter(
      (p) => p.stockQuantity < 10 || !p.inStock
    );

    // Sales by category
    const categorySales: Record<string, number> = {};
    for (const order of this.data.orders) {
      if (order.orderStatus === 'cancelled') continue;
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        const cat = product?.category || 'otros';
        categorySales[cat] = (categorySales[cat] || 0) + item.lineTotal;
      }
    }

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      activeOrdersCount: activeOrders.length,
      averageTicket: Number(averageTicket.toFixed(2)),
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 8),
      recentOrders: this.data.orders.slice(0, 6),
      categorySales,
    };
  }
}

export const db = new Database();
