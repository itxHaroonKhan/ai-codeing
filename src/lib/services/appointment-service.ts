import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { Appointment } from '../mock-data';

const COLLECTION_NAME = 'appointments';

export const AppointmentService = {
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('date', '==', date),
      orderBy('time', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...appointment,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateStatus(id: string, status: Appointment['status']): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    // Note: doc and updateDoc would need to be imported if used outside this object
  }
};
