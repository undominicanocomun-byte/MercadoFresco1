import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'client' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (type === 'admin') {
        await login('admin@mercadofresco.com', 'Admin123!');
      } else {
        await login('cliente@mercadofresco.com', 'Cliente123!');
      }
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión de demostración.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isRegisterMode ? 'Crear Cuenta en MercadoFresco' : 'Iniciar Sesión'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRegisterMode ? 'Accede a descuentos exclusivos y envíos guardados' : 'Gestiona tus compras y pedidos guardados'}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal de autenticación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick-Login Bar */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acceso Rápido con Cuentas Reales:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('client')}
              disabled={isLoading}
              className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Cliente Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Tienda</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre y apellido"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono (opcional)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
          >
            {isLoading ? 'Comprobando...' : isRegisterMode ? 'Registrarme' : 'Entrar a mi Cuenta'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage(null);
              }}
              className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              {isRegisterMode
                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta todavía? Regístrate en 30 segundos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
