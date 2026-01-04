
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDoc
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth } from "./firebase";
import { Incident, Technician, IncidentStatus } from '../types';

const INCIDENTS_COL = "incidents";
const TECHS_COL = "technicians";

export const apiService = {
  // Suscripción en tiempo real a incidencias
  subscribeToIncidents(callback: (incidents: Incident[]) => void) {
    const q = query(collection(db, INCIDENTS_COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Incident[];
      callback(incidents);
    });
  },

  async saveIncident(incident: Incident): Promise<string> {
    const docRef = await addDoc(collection(db, INCIDENTS_COL), incident);
    return docRef.id;
  },

  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<void> {
    const docRef = doc(db, INCIDENTS_COL, id);
    await updateDoc(docRef, { 
      status, 
      updatedAt: Date.now() 
    });
  },

  // Gestión de Técnicos
  async getTechnicians(): Promise<Technician[]> {
    const snapshot = await getDocs(collection(db, TECHS_COL));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Technician[];
  },

  async saveTechnician(tech: Technician): Promise<void> {
    // Usamos el email como ID para facilitar la búsqueda o el ID generado por Auth
    await setDoc(doc(db, TECHS_COL, tech.id || tech.email), tech);
  },

  // Autenticación
  async login(email: string, pass: string): Promise<Technician | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      // Buscamos los metadatos del técnico en Firestore
      const techDoc = await getDoc(doc(db, TECHS_COL, user.uid));
      if (techDoc.exists()) {
        return { ...techDoc.data(), id: user.uid } as Technician;
      }
      
      return {
        id: user.uid,
        name: user.displayName || 'Técnico',
        email: user.email || email,
        createdAt: Date.now()
      };
    } catch (error) {
      console.error("Firebase Login Error:", error);
      return null;
    }
  },

  async logout() {
    await signOut(auth);
  },

  onAuthChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
