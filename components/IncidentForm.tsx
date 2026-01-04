
import React, { useState } from 'react';
import { Loader2, MapPin, Send, AlertTriangle, Hash, Mail } from 'lucide-react';
import { GeoLocation } from '../types';
import MapComponent from './MapComponent';

// Define MUNI_GREEN constant to resolve the error on line 112
const MUNI_GREEN = '#2fb344';

interface IncidentFormProps {
  onSubmit: (description: string, poleId: string, userEmail: string, location: GeoLocation) => Promise<void>;
  isSubmitting: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, isSubmitting }) => {
  const [description, setDescription] = useState('');
  const [poleId, setPoleId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [location, setLocation] = useState<GeoLocation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return alert("Selecciona la ubicación en el mapa.");
    if (!description.trim()) return alert("Describe el problema.");
    if (!userEmail.includes('@')) return alert("Ingresa un correo válido para notificarte.");
    
    await onSubmit(description, poleId, userEmail, location);
    setDescription('');
    setPoleId('');
    setUserEmail('');
    setLocation(null);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-[#2fb344] p-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle size={80} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Nueva Incidencia</h2>
        <p className="text-green-50 text-sm font-medium opacity-80">Completa los datos para el equipo técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tu Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Para avisarte cuando esté listo"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-[#2fb344] outline-none transition-all bg-slate-50 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID Poste (Opcional)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={poleId}
                    onChange={(e) => setPoleId(e.target.value)}
                    placeholder="Ej: UP-44"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-[#2fb344] outline-none transition-all bg-slate-50 font-bold"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                        () => alert("Activa el GPS")
                      );
                    }
                  }}
                  className="h-[52px] flex items-center justify-center gap-2 bg-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-tighter"
                >
                  <MapPin size={16} /> Usar GPS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción de la falla</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué sucede con la luminaria?"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#2fb344] outline-none transition-all h-28 resize-none bg-slate-50 font-medium"
              />
            </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ubicar en el mapa</label>
          <div className="h-52 rounded-3xl overflow-hidden border-2 border-slate-100 relative shadow-inner">
             <MapComponent mode="PICKER" selectedLocation={location} onLocationSelect={setLocation} />
             {!location && <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-[400] font-bold text-slate-400 text-xs">Toca el mapa</div>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: MUNI_GREEN }}
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'ENVIAR REPORTE'}
        </button>
      </form>
    </div>
  );
};

export default IncidentForm;