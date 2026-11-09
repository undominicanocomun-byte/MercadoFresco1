import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { api } from './services/api';
import { Category, Order, Product } from './types';
import { SeasonalCalendar } from './components/SeasonalCalendar';
import { RecipeStudio } from './components/RecipeStudio';
import { ProducerSpotlight } from './components/ProducerSpotlight';
import { ColdChainShowcase } from './components/ColdChainShowcase';
import { CustomerStories } from './components/CustomerStories';
import { FaqSection } from './components/FaqSection';
import { StickyMobileBar } from './components/StickyMobileBar';
import {
  ShieldCheck,
  Truck,
  Leaf,
  Clock,
  Sparkles,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

function SupermarketStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(undefined);

  // Load products & categories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
    } catch (e) {
      console.error('Error fetching catalog data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort products client-side for ultra-fast response
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'ofertas') {
      if (!p.tags.includes('oferta') && (!p.compareAtPrice || p.compareAtPrice <= p.price)) {
        return false;
      }
    } else if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    if (selectedTag && !p.tags.includes(selectedTag)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  if (isAdminView) {
    return <AdminDashboard onBackToStore={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => {
          setActiveTrackingOrderId(undefined);
          setIsOrdersOpen(true);
        }}
        onToggleAdmin={() => setIsAdminView(!isAdminView)}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedTag(null);
        }}
      />

      {/* 2. Campaign Hero Showcase (Only on main view when no search) */}
      {!searchQuery && selectedCategory === 'all' && (
        <HeroBanner
          onExplore={() => {
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* 3. Sticky Category Navigation Bar */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedTag(null);
        }}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      {/* 4. Catalog Grid Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Section Header with Count & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : selectedCategory === 'ofertas'
                  ? 'Ofertas y Descuentos del Día'
                  : currentCategoryObj
                  ? currentCategoryObj.name
                  : 'Todos los Alimentos Frescos'}
              </h2>
              {selectedTag && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold capitalize">
                  Filtro: {selectedTag.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {sortedProducts.length}{' '}
              {sortedProducts.length === 1 ? 'producto disponible' : 'productos disponibles con envío hoy'}
            </p>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar:</span>
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer text-slate-800 shadow-2xs"
            >
              <option value="featured">Destacados y Recomendados</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="name">Alfabético (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No encontramos productos coincidentes</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta buscar con otros términos o retira los filtros activos para ver todo el catálogo fresco.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Editorial & Experience Sections */}
      <SeasonalCalendar
        onSelectTagOrCategory={(tagOrCat) => {
          if (categories.some((c) => c.id === tagOrCat)) {
            setSelectedCategory(tagOrCat);
            setSelectedTag(null);
          } else {
            setSelectedTag(tagOrCat);
          }
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <RecipeStudio products={products} />

      <ProducerSpotlight
        onFilterProducer={(tag) => {
          setSelectedTag(tag);
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ColdChainShowcase />

      <CustomerStories />

      <FaqSection />

      {/* 6. Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  M
                </span>
                <span className="text-base font-extrabold text-white">
                  Mercado<span className="text-emerald-500">Fresco</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Supermercado en línea comprometido con la producción agrícola sostenible, el comercio justo local y la alimentación saludable para tu familia.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Pasillos Populares</h4>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(c.id);
                        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-emerald-400 transition-colors text-xs text-left cursor-pointer"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Atención & Ayuda</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+34 910 123 456 (08:00 - 22:00)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>soporte@mercadofresco.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Almacén Central Madrid Norte</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Medios de Pago Aceptados</h4>
              <p className="text-slate-400 text-xs mb-3">
                Tarjetas Visa, Mastercard, American Express, Pago Contra Entrega en efectivo o datáfono, y Transferencia Inmediata.
              </p>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono font-bold text-[10px]">
                  SSL 256-bit
                </span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono font-bold text-[10px]">
                  3D Secure
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} MercadoFresco S.L. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span>Aviso Legal</span>
              <span>Privacidad</span>
              <span>Política de Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. Modals */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          // Keep checkout open on success step or allow tracking
          setActiveTrackingOrderId(order.orderNumber);
        }}
      />

      <OrderTrackerModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        initialOrderId={activeTrackingOrderId}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => loadData()}
      />

      {/* 8. Floating Mobile Cart Bar */}
      <StickyMobileBar onOpenCheckout={() => setIsCheckoutOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SupermarketStore />
      </CartProvider>
    </AuthProvider>
  );
}
