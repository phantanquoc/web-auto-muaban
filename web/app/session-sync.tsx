"use client";
import { useEffect } from 'react';
import { syncSessionFromStorage } from '../lib/api';

/** Re-syncs the middleware cookie from localStorage on app load. */
export default function SessionSync() {
  useEffect(() => {
    syncSessionFromStorage();
  }, []);
  return null;
}
