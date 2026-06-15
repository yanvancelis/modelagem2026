export type GalleryPhoto = {
  id: number;
  dataUrl: string;
  createdAt: number;
};

const GALLERY_DB = "modelagem2026-gallery";
const GALLERY_STORE = "photos";

function openGalleryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(GALLERY_DB, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(GALLERY_STORE)) {
        db.createObjectStore(GALLERY_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadGalleryPhotos(): Promise<GalleryPhoto[]> {
  const db = await openGalleryDB();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(GALLERY_STORE, "readonly")
      .objectStore(GALLERY_STORE)
      .getAll();

    request.onsuccess = () => {
      const photos = (request.result as GalleryPhoto[]).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoToGallery(dataUrl: string): Promise<GalleryPhoto> {
  const photo: GalleryPhoto = {
    id: Date.now(),
    dataUrl,
    createdAt: Date.now(),
  };

  const db = await openGalleryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GALLERY_STORE, "readwrite");
    transaction.objectStore(GALLERY_STORE).add(photo);
    transaction.oncomplete = () => resolve(photo);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deletePhotoFromGallery(photoId: number): Promise<void> {
  const db = await openGalleryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GALLERY_STORE, "readwrite");
    transaction.objectStore(GALLERY_STORE).delete(photoId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearGalleryPhotos(): Promise<void> {
  const db = await openGalleryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GALLERY_STORE, "readwrite");
    transaction.objectStore(GALLERY_STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function formatStoryDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
