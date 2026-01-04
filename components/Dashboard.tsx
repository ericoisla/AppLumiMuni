import React, { useState } from 'react';
import { Incident, IncidentStatus, IncidentPriority, Technician } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { CheckCircle2, Clock, AlertCircle, Map as MapIcon, List, Hash, Users, PlusCircle, UserCheck } from 'lucide-react';
import MapComponent from './MapComponent';

interface DashboardProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
  isAdmin: boolean;
  technicians: Technician[];
  onAddTechnician: (tech: Omit<Technician, 'id' | 'createdAt'>) => void;
}

const COLORS = ['#ef4444', '#f97316', '#22c55e'];

const Dashboard: React.FC<DashboardProps> = ({ incidents, onUpdateStatus, isAdmin, technicians, onAddTechnician }) => {
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'TECHS' | 'STATS'>('INCIDENTS');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [newTech, setNewTech] = useState({ name: '', email: '', password: '' });

  const stats = {
    open: incidents.filter(i => i.status === IncidentStatus.OPEN).length,
    progress: incidents.filter(i => i.status === IncidentStatus.IN_PROGRESS).length,
    resolved: incidents.filter(i => i.status === IncidentStatus.RESOLVED).length
  };

  const priorityData = [
    { name: 'Baja', val: incidents.filter(i => i.aiAnalysis?.priority === IncidentPriority.LOW).length },
    { name: 'Media', val: incidents.filter(i => i.aiAnalysis?.priority === IncidentPriority.MEDIUM).length },
    { name: 'Alta', val: incidents.filter(i => i.aiAnalysis?.priority === IncidentPriority.HIGH).length },
    { name: 'Crítica', val: incidents.filter(i => i.aiAnalysis?.priority === IncidentPriority.CRITICAL).length }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <button onClick={() => setActiveTab('INCIDENTS')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'INCIDENTS' ? 'bg-[#2fb344] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <List size={16} /> INCIDENCIAS
        </button>
        <button onClick={() => setActiveTab('STATS')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'STATS' ? 'bg-[#2fb344] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <AlertCircle size={16} /> ESTADÍSTICAS
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab('TECHS')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'TECHS' ? 'bg-[#2fb344] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Users size={16} /> GESTIÓN PERSONAL
          </button>
        )}
      </div>

      {activeTab === 'INCIDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Listado de Trabajo</h3>
                <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
                   <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-md ${viewMode === 'LIST' ? 'bg-white shadow-sm' : ''}`}><List size={14}/></button>
                   <button onClick={() => setViewMode('MAP')} className={`p-1.5 rounded-md ${viewMode === 'MAP' ? 'bg-white shadow-sm' : ''}`}><MapIcon size={14}/></button>
                </div>
             </div>
             
             {viewMode === 'MAP' ? (
               <div className="h-[500px] rounded-3xl overflow-hidden border border-slate-200">
                  <MapComponent mode="VIEWER" incidents={incidents} />
               </div>
             ) : (
               <div className="space-y-4">
                 {incidents.map(inc => (
                   <div key={inc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${inc.aiAnalysis?.priority === 'Crítica' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{inc.aiAnalysis?.priority}</span>
                           <span className="text-[10px] font-black bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase tracking-tighter">ID: {inc.id}</span>
                         </div>
                         <h4 className="font-bold text-slate-800 text-lg">{inc.aiAnalysis?.summary}</h4>
                         <p className="text-xs text-slate-400 font-bold mb-1">CIUDADANO: {inc.userEmail}</p>
                       </div>
                       <div className="text-right">
                         <span className="text-[10px] font-black text-slate-300 block mb-1">{new Date(inc.createdAt).toLocaleDateString()}</span>
                         <span className={`text-xs font-black px-3 py-1 rounded-full ${inc.status === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{inc.status}</span>
                       </div>
                     </div>
                     <p className="text-sm text-slate-600 mb-4 font-medium">{inc.description}</p>
                     <div className="flex gap-2 border-t border-slate-50 pt-4">
                        {inc.status !== IncidentStatus.RESOLVED && (
                          <button onClick={() => onUpdateStatus(inc.id, IncidentStatus.RESOLVED)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all">Finalizar</button>
                        )}
                        {inc.status === IncidentStatus.OPEN && (
                          <button onClick={() => onUpdateStatus(inc.id, IncidentStatus.IN_PROGRESS)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">En Revisión</button>
                        )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Resumen General</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pendientes</p>
                <p className="text-4xl font-black text-red-600">{stats.open}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Resueltos</p>
                <p className="text-4xl font-black text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'STATS' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[500px]">
          <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-tight">Incidencias por Prioridad</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
              <YAxis fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="val" fill="#2fb344" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'TECHS' && isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <PlusCircle className="text-green-600" /> REGISTRAR TÉCNICO
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); onAddTechnician(newTech); setNewTech({name:'', email:'', password:''}); }} className="space-y-4">
              <input type="text" placeholder="Nombre Completo" className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none font-bold text-sm" value={newTech.name} onChange={e => setNewTech({...newTech, name: e.target.value})} required />
              <input type="email" placeholder="Correo @munilaunion.cl" className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none font-bold text-sm" value={newTech.email} onChange={e => setNewTech({...newTech, email: e.target.value})} required />
              <input type="password" placeholder="Contraseña Inicial" className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none font-bold text-sm" value={newTech.password} onChange={e => setNewTech({...newTech, password: e.target.value})} required />
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">Agregar al Equipo</button>
            </form>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Equipo Registrado</h3>
            <div className="space-y-3">
              {technicians.map(t => (
                <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><UserCheck size={18} className="text-slate-400"/></div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded">ACTIVO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;