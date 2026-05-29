import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Definisikan struktur data untuk setiap tabel
export interface OfflineManifest {
  id: string; // manifest_id
  manifest_number: string;
  vendor_id: string;
  vendor_name?: string;
  driver_name?: string;
  vehicle_plate?: string;
  items: OfflineManifestItem[]; // Data manifest_items dan relasi parts
  createdAt: number;
}

export interface OfflineManifestItem {
  id: string; // manifest_item_id
  part_id: string;
  part_number: string;
  part_name: string;
  expected_qty: number;
}

export interface OfflineScanLog {
  id: string; // UUID yang di-generate lokal saat scan
  manifest_id: string; // Relasi ke manifest_data
  session_id: string; // UUID dari sesi inbound lokal
  part_id: string;
  actual_qty: number;
  expected_qty: number;
  scan_status: string; // e.g. "match", "mismatch", "damaged"
  scanned_at: number; // timestamp
}

export interface OfflineEvidence {
  id: string; // UUID lokal
  scan_id: string; // Relasi ke OfflineScanLog
  photo_base64: string; // Base64 data URL
  remark: string;
  created_at: number; // timestamp
}

export interface OfflineSession {
  id: string; // session_id (lokal UUID)
  manifest_id: string;
  driver_signature_base64?: string;
  staff_signature_base64?: string;
  started_at: number; // Waktu "Mulai Sesi Pengecekan" ditekan
  completed_at?: number; // Waktu "Selesai Scan" atau "Confirm" ditekan
}

// Skema IndexedDB
export interface CheckerDB extends DBSchema {
  manifests: {
    key: string; // manifest_id
    value: OfflineManifest;
  };
  scan_logs: {
    key: string; // scan_log.id
    value: OfflineScanLog;
    indexes: { 'by-manifest': string };
  };
  evidences: {
    key: string; // evidence.id
    value: OfflineEvidence;
    indexes: { 'by-scan': string };
  };
  sessions: {
    key: string; // session_id
    value: OfflineSession;
  };
}

const DB_NAME = 'CapstoneCheckerDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CheckerDB>>;

export function getDB() {
  if (typeof window === 'undefined') {
    return null; // IndexedDB hanya tersedia di client/browser
  }

  if (!dbPromise) {
    dbPromise = openDB<CheckerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Buat object store (tabel)
        if (!db.objectStoreNames.contains('manifests')) {
          db.createObjectStore('manifests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('scan_logs')) {
          const scanLogsStore = db.createObjectStore('scan_logs', { keyPath: 'id' });
          scanLogsStore.createIndex('by-manifest', 'manifest_id');
        }
        if (!db.objectStoreNames.contains('evidences')) {
          const evidencesStore = db.createObjectStore('evidences', { keyPath: 'id' });
          evidencesStore.createIndex('by-scan', 'scan_id');
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ==========================================
// Fungsi Pembantu (Helper Functions)
// ==========================================

export async function clearAllLocalData(manifestId: string) {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction(['manifests', 'scan_logs', 'evidences', 'sessions'], 'readwrite');
  
  // Hapus manifest
  await tx.objectStore('manifests').delete(manifestId);

  // Hapus session terkait
  // Catatan: Karena kita belum pakai index di sessions untuk manifest_id, kita iterasi semua 
  const sessions = await tx.objectStore('sessions').getAll();
  const sessionToDelete = sessions.find(s => s.manifest_id === manifestId);
  if (sessionToDelete) {
    await tx.objectStore('sessions').delete(sessionToDelete.id);
  }

  // Hapus scan_logs
  const scanLogsIdx = tx.objectStore('scan_logs').index('by-manifest');
  const logsToDelete = await scanLogsIdx.getAllKeys(manifestId);
  
  // Hapus evidences yang terkait dengan log tersebut
  const evidenceStore = tx.objectStore('evidences');
  const evidenceIdx = evidenceStore.index('by-scan');
  
  for (const logId of logsToDelete) {
    const evKeys = await evidenceIdx.getAllKeys(logId);
    for (const evKey of evKeys) {
      await evidenceStore.delete(evKey);
    }
    await tx.objectStore('scan_logs').delete(logId);
  }

  await tx.done;
}
