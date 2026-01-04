
import React, { useState, useEffect } from 'react';
import { ViewMode, Incident, IncidentStatus, GeoLocation, Technician } from './types';
import IncidentForm from './components/IncidentForm';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import { analyzeIncidentDescription } from './services/geminiService';
import { apiService } from './services/apiService';
import { 
  Plus, LayoutDashboard, LogOut, Download, Cloud, 
  RefreshCw, ShieldCheck, Flame
} from 'lucide-react';

const MUNI_GREEN = '#2fb344';
const ADMIN_EMAIL = 'erico.isla@munilaunion.cl';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('USER');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [currentUser, setCurrentUser] = useState<Technician | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Efecto para manejar la sesión de Firebase
  useEffect(() => {
    const unsubscribeAuth = apiService.onAuthChange(async (user) => {
      if (user) {
        // Podríamos buscar los datos extendidos del técnico aquí
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          createdAt: Date.now()
        });
      } else {
        setCurrentUser(null);
      }
    });

    // 2. Efecto para incidencias en tiempo real
    const unsubscribeIncidents = apiService.subscribeToIncidents((data) => {
      setIncidents(data);
      setIsLoading(false);
    });

    // 3. Cargar técnicos (solo una vez)
    apiService.getTechnicians().then(setTechnicians);

    return () => {
      unsubscribeAuth();
      unsubscribeIncidents();
    };
  }, []);

  const handleIncidentSubmit = async (description: string, poleId: string, userEmail: string, location: GeoLocation) => {
    setIsSubmitting(true);
    try {
      const analysis = await analyzeIncidentDescription(description);
      const newIncident: Incident = {
        id: '', // Firebase generará el ID automáticamente
        poleId: poleId || 'S/N',
        description,
        userEmail,
        location,
        status: IncidentStatus.OPEN,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        aiAnalysis: analysis
      };
      
      await apiService.saveIncident(newIncident);
      alert(`¡Gracias! Tu reporte ha sido recibido y será procesado.`);
      setView('USER');
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al enviar el reporte. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: IncidentStatus) => {
    try {
      await apiService.updateIncidentStatus(id, newStatus);
    } catch (error) {
      alert("Error al actualizar el estado.");
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setView('USER');
  };

  const exportToCSV = () => {
    if (incidents.length === 0) return;
    const headers = ["ID", "Fecha", "Email", "Poste", "Descripcion", "Estado", "Prioridad"];
    const rows = incidents.map(i => [
      i.id, new Date(i.createdAt).toLocaleString(), i.userEmail, i.poleId, `"${i.description.replace(/"/g, '""')}"`, i.status, i.aiAnalysis?.priority
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reportes_lumifix_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="text-white shadow-md sticky top-0 z-50 border-b" style={{ backgroundColor: MUNI_GREEN, borderColor: '#269137' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('USER')}>
            <div className="bg-white p-1 rounded shadow-sm">
               <img src="https://munilaunion.cl/wp-content/uploads/2021/08/logo-muni-1.png" alt="La Union" className="h-8 md:h-10 w-auto" />
            </div>
            <span className="font-black tracking-tight text-sm md:text-lg">ALUMBRADO PÚBLICO</span>
          </div>
          <nav className="flex gap-1 bg-black/10 p-1 rounded-lg">
            <button onClick={() => setView('USER')} className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${view === 'USER' ? 'bg-white text-green-700 shadow-sm' : 'text-white hover:bg-white/10'}`}>
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Reportar</span>
            </button>
            <button onClick={() => currentUser ? setView('TECHNICIAN') : setView('LOGIN')} className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${view !== 'USER' ? 'bg-green-800 text-white shadow-sm' : 'text-white hover:bg-white/10'}`}>
              <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Panel</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Firebase Status Bar */}
      <div className="bg-orange-50 border-b border-orange-100 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-orange-700">
          <div className="flex items-center gap-2">
            <Flame size={12} className="animate-pulse" /> Motor de Datos Firebase Activo
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} /> Sincronización en Tiempo Real
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">Sincronizando con Firestore...</p>
          </div>
        ) : (
          <>
            {view === 'USER' && (
              <div className="animate-fade-in">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Reporte Ciudadano</h2>
                  <div className="h-1.5 w-20 bg-[#2fb344] mx-auto rounded-full mb-4"></div>
                  <p className="text-slate-500 max-w-lg mx-auto font-medium italic">Tu reporte llega instantáneamente al equipo de emergencias de La Unión.</p>
                </div>
                <IncidentForm onSubmit={handleIncidentSubmit} isSubmitting={isSubmitting} />
              </div>
            )}

            {view === 'LOGIN' && <LoginForm onLogin={async (e, p) => { 
              const u = await apiService.login(e, p); 
              if(u) { setView('TECHNICIAN'); return true; } 
              return false; 
            }} />}

            {view === 'TECHNICIAN' && currentUser && (
              <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl uppercase">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 leading-none mb-1 uppercase">{currentUser.name}</h2>
                      <p className="text-slate-400 text-sm font-medium">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-100 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-200 transition-all">
                      <Download className="w-4 h-4 text-blue-600" /> EXPORTAR CSV
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-red-100 transition-all">
                      <LogOut className="w-4 h-4" /> CERRAR SESIÓN
                    </button>
                  </div>
                </div>
                <Dashboard 
                  incidents={incidents} 
                  onUpdateStatus={handleStatusUpdate} 
                  isAdmin={currentUser.email === ADMIN_EMAIL}
                  technicians={technicians}
                  onAddTechnician={async (t) => { 
                    // Nota: Para añadir técnicos en Firebase Auth se suele requerir una función Admin o Firebase Functions
                    // Aquí solo guardamos los metadatos en Firestore
                    await apiService.saveTechnician({...t, id: Date.now().toString(), createdAt: Date.now()}); 
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <img src="https://munilaunion.cl/wp-content/uploads/2021/08/logo-muni-1.png" alt="La Union" className="h-12 w-auto mx-auto mb-4 grayscale opacity-50" />
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© {new Date().getFullYear()} Municipalidad de La Unión | Departamento de Eléctrica</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
