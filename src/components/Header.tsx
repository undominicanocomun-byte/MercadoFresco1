import React, { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, ShieldCheck, Truck, Sparkles, X, ChevronDown, LogOut, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/supermarket';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenOrders,
  onToggleAdmin,
  isAdminView,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const { itemCount, openCart, totals, settings } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Promotional Top Announcement Banner (Slim <= 40px) */}
      {showBanner && settings?.announcementBanner.enabled && (
        <aside
          aria-label="Anuncio promocional"
          className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 flex items-center justify-between border-b border-emerald-950 transition-all"
        >
          <div className="mx-auto flex items-center gap-3 font-medium">
            <span className="hidden sm:inline">🌱</span>
            <span>{settings.announcementBanner.text}</span>
            <span className="hidden md:inline text-emerald-300 font-semibold underline cursor-pointer" onClick={() => onSelectCategory('all')}>
              Ver catálogo completo
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Cerrar aviso promocional"
            className="text-emerald-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (isAdminView) onToggleAdmin();
              onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group whitespace-nowrap shrink-0"
          >
            <span className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              M
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              Mercado<span className="text-emerald-600">Fresco</span>
            </span>
          </a>

          {/* Zone 2: 4–5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                if (isAdminView) onToggleAdmin();
                onSelectCategory('all');
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all' && !isAdminView ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              Pasillos & Frescos
            </button>
            <button
              onClick={() => {
                if (isAdminView) onToggleAdmin();
                onSelectCategory('ofertas');
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'ofertas' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              Ofertas de Temporada
            </button>
            <button
              onClick={onOpenOrders}
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mis Pedidos
            </button>
            <a
              href="#compromiso-calidad"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('compromiso-calidad')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Garantía de Origen
            </a>
          </nav>

          {/* Zone 3: 1 primary action group */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin Switcher */}
            {isAdmin && (
              <button
                onClick={onToggleAdmin}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isAdminView
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                {isAdminView ? 'Volver a Tienda' : 'Panel Admin'}
              </button>
            )}

            {/* User Account / Auth */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-800 text-sm font-medium cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setShowUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500">Sesión iniciada como</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                        Historial de Pedidos
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onToggleAdmin();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Panel Administrativo
                        </button>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>

            {/* Primary Action: Shopping Cart Button with Live Counter and Total */}
            <button
              onClick={openCart}
              aria-label={`Ver carrito de compras con ${itemCount} artículos`}
              className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-mono tabular-nums">
                {formatCurrency(totals.subtotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        {!isAdminView && (
          <div className="py-2.5 border-t border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar frutas frescas, pan de masa madre, lácteos, carnes, despensa..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Entrega Hoy en Madrid y alrededores</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
