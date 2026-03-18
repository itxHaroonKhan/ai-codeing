import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { Patient } from '../mock-data';

const COLLECTION_NAME = 'patients';

export const PatientService = {
  async getAllPatients(): Promise<Patient[]> {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Patient) : null;
  },

  async createPatient(patient: Omit<Patient, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...patient,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }
};
