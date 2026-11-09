import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  ShieldCheck,
  Truck,
  Sparkles,
  X,
  ChevronDown,
  LogOut,
  PackageCheck,
  MapPin,
  Clock,
  Menu,
} from 'lucide-react';
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
  const [postalCode, setPostalCode] = useState('28001');
  const [isChangingPostal, setIsChangingPostal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Popular quick tags for rapid exploration
  const quickSearchTags = [
    { label: 'Tomate Rosa', query: 'Tomate Rosa' },
    { label: 'Masa Madre', query: 'Masa Madre' },
    { label: 'AOVE Picual', query: 'Picual' },
    { label: 'Salmón Noruego', query: 'Salmón' },
    { label: 'Huevos Clase 0', query: 'Huevos' },
    { label: 'Kombucha', query: 'Kombucha' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      {/* Promotional Top Announcement Banner */}
      {showBanner && settings?.announcementBanner.enabled && (
        <aside
          aria-label="Anuncio promocional"
          className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 flex items-center justify-between border-b border-emerald-900 transition-all"
        >
          <div className="mx-auto flex items-center gap-3 font-medium">
            <span className="hidden sm:inline">🌱</span>
            <span>{settings.announcementBanner.text}</span>
            <span
              className="hidden md:inline text-emerald-300 font-semibold underline cursor-pointer hover:text-white transition-colors"
              onClick={() => onSelectCategory('all')}
            >
              Ver catálogo de hoy
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

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-18">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Zone 1: Brand Wordmark with subtle organic seal */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (isAdminView) onToggleAdmin();
              onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm font-black text-lg transition-transform group-hover:scale-105">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors leading-none">
                Mercado<span className="text-emerald-600">Fresco</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-400 font-mono mt-0.5">
                Huerto & Despensa
              </span>
            </div>
          </a>

          {/* Zip Code Selector Badge */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-stone-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Entregar en:</span>
              {isChangingPostal ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    maxLength={5}
                    className="w-16 px-1.5 py-0.5 text-xs font-bold font-mono border border-emerald-500 rounded bg-white"
                  />
                  <button
                    onClick={() => setIsChangingPostal(false)}
                    className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsChangingPostal(true)}
                  className="font-bold text-stone-800 hover:text-emerald-700 underline text-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Madrid ({postalCode})</span>
                  <span className="text-[10px] text-emerald-600 font-semibold no-underline">· Cambiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold text-stone-600">
            <button
              onClick={() => {
                if (isAdminView) onToggleAdmin();
                onSelectCategory('all');
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all' && !isAdminView ? 'text-emerald-700 font-bold' : ''
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
                selectedCategory === 'ofertas' ? 'text-emerald-700 font-bold' : ''
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

          {/* Zone 3: Actions Group */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin Switcher */}
            {isAdmin && (
              <button
                onClick={onToggleAdmin}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isAdminView
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
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
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-800 text-sm font-medium cursor-pointer border border-stone-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-semibold text-stone-700 max-w-[110px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {showUserDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setShowUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-medium text-stone-500">Sesión iniciada como</p>
                        <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                        Historial & Seguimiento
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onToggleAdmin();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Panel Administrativo
                        </button>
                      )}

                      <div className="border-t border-stone-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-stone-200"
                >
                  <UserIcon className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              aria-label={`Ver carrito de compras con ${itemCount} artículos`}
              className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold font-mono tabular-nums">
                {formatCurrency(totals.subtotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Global Instant Search Bar & Quick Suggestion Chips */}
        {!isAdminView && (
          <div className="py-2.5 border-t border-stone-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar frutas frescas, pan de masa madre, lácteos, carnes, despensa... (Presiona '/' para buscar)"
                  className="w-full pl-10 pr-9 py-2 bg-stone-100 hover:bg-stone-200/60 focus:bg-white text-xs sm:text-sm text-stone-900 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-stone-500 font-medium shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Bodega Activa 4.0°C · Entrega hoy Madrid</span>
              </div>
            </div>

            {/* Quick Search Tag Suggestions */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-500 pb-0.5">
              <span className="text-stone-400 font-medium shrink-0">Populares:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => onSearchChange(tag.query)}
                  className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectCategory('all');
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-left font-bold text-sm text-stone-800 py-1.5"
          >
            Pasillos & Frescos
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectCategory('ofertas');
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-left font-bold text-sm text-stone-800 py-1.5 text-emerald-700"
          >
            Ofertas de Temporada
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenOrders();
            }}
            className="w-full text-left font-bold text-sm text-stone-800 py-1.5"
          >
            Mis Pedidos
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              document.getElementById('compromiso-calidad')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-left font-bold text-sm text-stone-800 py-1.5"
          >
            Garantía de Origen
          </button>
        </div>
      )}
    </header>
  );
};
