import { useMemo } from 'react';
import { collection, query, where, QueryConstraint, CollectionReference, Query } from 'firebase/firestore';
import { db } from '../firebase';
import { usePOS } from '../context/POSContext';

/**
 * Custom hook providing store-scoped query builders and Firebase helpers.
 * Ensures that all queries, reads, and writes are automatically scoped to the active store.
 */
export function useStoreScope() {
  const { storeId, firebaseUser, currentUser } = usePOS();

  const activeUserId = firebaseUser?.uid || currentUser?.id || null;
  const currentStoreId = storeId || (activeUserId ? `store_${activeUserId}` : 'store_default');

  /**
   * Returns a Firestore collection reference for the active user's subcollection
   */
  const getStoreCollection = (subcollectionName: string): CollectionReference | null => {
    if (!activeUserId) return null;
    return collection(db, 'users', activeUserId, subcollectionName);
  };

  /**
   * Returns a Firestore query scoped by storeId for the active user
   */
  const getStoreQuery = (
    subcollectionName: string,
    ...additionalConstraints: QueryConstraint[]
  ): Query | null => {
    const colRef = getStoreCollection(subcollectionName);
    if (!colRef) return null;
    return query(colRef, where('storeId', '==', currentStoreId), ...additionalConstraints);
  };

  /**
   * Wraps any data payload to guarantee storeId and userId fields are populated
   */
  const withStoreScope = <T extends Record<string, any>>(data: T): T & { storeId: string; userId: string; updatedAt: string } => {
    return {
      ...data,
      storeId: currentStoreId,
      userId: activeUserId || '',
      updatedAt: new Date().toISOString(),
    };
  };

  return {
    storeId: currentStoreId,
    activeUserId,
    getStoreCollection,
    getStoreQuery,
    withStoreScope,
  };
}
