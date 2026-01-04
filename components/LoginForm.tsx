
import React, { useState } from 'react';
import { Lock, ArrowRight, User, KeyRound } from 'lucide-react';

interface LoginFormProps {
  // Fix: onLogin can return a Promise<boolean> (as it does in App.tsx)
  onLogin: (email: string, pass: string) => Promise<boolean> | boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fix: Changed to async to properly handle the onLogin promise
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Fix: Await the onLogin call which is asynchronous in App.tsx
      const success = await onLogin(email, password);
      if (!success) {
        setError('Credenciales incorrectas.');
        setLoading(false);
      }
    } catch (err) {
      setError('Error al intentar iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-[#2fb344] p-8 text-center relative">
          <div className="mx-auto bg-green-800/40 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Acceso Técnico</h2>
          <p className="text-green-50 text-sm opacity-90">Municipalidad de La Unión</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 animate-pulse font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Corporativo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2fb344] focus:border-transparent outline-none transition-all bg-slate-50"
                  placeholder="ejemplo@munilaunion.cl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contraseña</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2fb344] focus:border-transparent outline-none transition-all bg-slate-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-[#2fb344] hover:bg-[#269137] text-white rounded-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar al Panel'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
