let db;
let dbReadyResolver;
const dbReadyPromise = new Promise((resolve) => { dbReadyResolver = resolve; });

export function inicializarDB() {
  const request = indexedDB.open("EncuestasCABA", 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("comentarios")) {
      db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("comentariosPendientes")) {
      db.createObjectStore("comentariosPendientes", { keyPath: "id", autoIncrement: true });
    }
  };
  request.onsuccess = e => {
    db = e.target.result;
    dbReadyResolver();
  };
  request.onerror = e => {
    console.error("Error al abrir IndexedDB:", e.target.error);
  };
  return dbReadyPromise;
}

async function getDB() {
  if(db) return db;
  await dbReadyPromise;
  return db;
}

export async function guardarComentario(categoria, comentario) {
  const dbInstance = await getDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction("comentarios", "readwrite");
    const store = tx.objectStore("comentarios");
    const request = store.add({ ...comentario, categoria });
    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}
//agregado
export async function guardarComentarioOffline(categoria, comentario) {
  const dbInstance = await getDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction("comentariosPendientes", "readwrite");
    const store = tx.objectStore("comentariosPendientes");
    const request = store.add({ ...comentario, categoria });
    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}
//agregado
export async function obtenerComentariosPendientes() {
  const dbInstance = await getDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction("comentariosPendientes", "readonly");
    const store = tx.objectStore("comentariosPendientes");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = e => reject(e.target.error);
  });
}
//agregado
export async function eliminarComentarioPendiente(id) {
  const dbInstance = await getDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction("comentariosPendientes", "readwrite");
    const store = tx.objectStore("comentariosPendientes");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

export async function traerComentarios(categoria) {
  const dbInstance = await getDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction("comentarios", "readonly");
    const store = tx.objectStore("comentarios");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.filter(c => c.categoria === categoria));
    };
    request.onerror = e => reject(e.target.error);
  });
}


