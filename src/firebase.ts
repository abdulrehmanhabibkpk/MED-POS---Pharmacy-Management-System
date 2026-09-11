// Standalone Firebase Stub for LimoPOS (Hostinger Node.js & MySQL Edition)
// All Auth and Database queries are handled natively by Node.js and Hostinger MySQL.

export const auth: any = null;
export const db: any = null;
export const googleProvider: any = null;
export const analytics: any = null;

export const signInWithEmailAndPassword = async () => ({ user: { uid: 'user_1', email: 'demo@limopos.com' } });
export const createUserWithEmailAndPassword = async () => ({ user: { uid: 'user_1', email: 'demo@limopos.com' } });
export const signOut = async () => {};
export const onAuthStateChanged = (_auth: any, callback: any) => {
  return () => {};
};
export const sendPasswordResetEmail = async () => {};
export const updateProfile = async () => {};
export const signInWithPopup = async () => {};
export const GoogleAuthProvider = class {};

export const doc = () => ({});
export const getDoc = async () => ({ exists: () => false, data: () => ({}) });
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const collection = () => ({});
export const onSnapshot = (_ref: any, callback: any) => {
  return () => {};
};
export const getDocs = async () => ({ docs: [], forEach: () => {} });
export const writeBatch = () => ({ set: () => {}, commit: async () => {} });
export const serverTimestamp = () => new Date().toISOString();
export const query = () => ({});
export const orderBy = () => ({});
export const where = () => ({});
export const enableIndexedDbPersistence = async () => {};
