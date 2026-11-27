import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, Building2 } from 'lucide-react';
import { USUARIOS_SINTETICOS } from '../data/mockUsers';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('infraestructura@unt.edu.pe');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const encontrado = USUARIOS_SINTETICOS.find(
      (u) => u.usuario === email.trim() && u.password === password
    );
    if (!encontrado) {
      setError('Credenciales inválidas. Usa uno de los perfiles sintéticos.');
      return;
    }
    onLogin(encontrado);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-900 text-white rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">OBRA TRAZA</h1>
            <p className="text-xs text-slate-500">Control Contractual • Ley N° 32069</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Institucional (Sintético)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Ingresar al Sistema
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
            Acceso rápido de demostración (Datos Sintéticos):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {USUARIOS_SINTETICOS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onLogin(u)}
                className="text-left p-2 rounded border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition text-xs"
              >
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> {u.rol}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{u.nombre}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Entorno aislado TRL 3-4 • Cumplimiento Ley N° 29733</span>
        </div>
      </div>
    </div>
  );
}