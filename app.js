import { inicializarDB, guardarComentario, guardarComentarioOffline, obtenerComentariosPendientes, eliminarComentarioPendiente } from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBlhTmbEv6Bp2TTf-t5E2QqxssxXGxiNV0",
  authDomain: "caba-encuestas-pwa.firebaseapp.com",
  projectId: "caba-encuestas-pwa",
  storageBucket: "caba-encuestas-pwa.firebasestorage.app",
  messagingSenderId: "627050396363",
  appId: "1:627050396363:web:1e57c9bf57870b7c94794e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const messaging = getMessaging(app);
const VAPID_KEY = "BJI5B4HR2gJ6sGT2EnoZn67rOtiT-cW1u67iSqRyM1_QZtOVrto35KZ5ts-SIZ1Y6Z9p4Am3sbdIFY4C86Xx-yE";

// Elementos
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm-password");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submitBtn");
const toggleBtn = document.getElementById("toggleBtn");
const googleBtn = document.getElementById("googleBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcome");
const content = document.getElementById('content');
const buttons = document.querySelectorAll('.tabs button');
const isLoginPage = window.location.pathname.includes("login.html");

// Notificaciones
function solicitarPermisoNotificaciones() {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      navigator.serviceWorker.ready.then(registration => {
        getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        }).then(currentToken => {
          if (currentToken) console.log("Token FCM:", currentToken);
        }).catch(err => {
          console.error("Error al obtener token:", err);
        });
      });
    }
  });
}

onMessage(messaging, payload => {
  alert(payload.notification.title + ": " + payload.notification.body);
});

// Autenticación
if (isLoginPage) {
  let isLogin = true;

 
  const mensaje = localStorage.getItem("mensajeLogin");
  if (mensaje) {
    const aviso = document.createElement("div");
    aviso.textContent = mensaje;
    aviso.style.color = "red";
    aviso.style.marginBottom = "1rem";
    document.getElementById("auth-container").prepend(aviso);
    localStorage.removeItem("mensajeLogin");
  }

  toggleBtn.addEventListener("click", () => {
    isLogin = !isLogin;
    confirmEl.classList.toggle("hidden", isLogin);
    formTitle.textContent = isLogin ? "Iniciar Sesión" : "Registrarse";
    submitBtn.textContent = isLogin ? "Ingresar" : "Registrarse";
    toggleBtn.textContent = isLogin ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Ingresá";
  });

  submitBtn.addEventListener("click", () => {
    const email = emailEl.value;
    const password = passEl.value;
    const confirm = confirmEl.value;

    if (!email || !password || (!isLogin && password !== confirm)) {
      alert("Completá todos los campos correctamente");
      return;
    }

    const action = isLogin
      ? signInWithEmailAndPassword(auth, email, password)
      : createUserWithEmailAndPassword(auth, email, password);

    action
      .then(result => {
        localStorage.setItem("user", JSON.stringify({ email: result.user.email }));
        window.location.href = "encuestas.html";
      })
      .catch(err => {
        console.error("Error de autenticación:", err);
        alert("Las credenciales son incorrectas o ya están registradas.");
      });
  });

  googleBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(result => {
        localStorage.setItem("user", JSON.stringify({ email: result.user.email }));
        window.location.href = "encuestas.html";
      })
      .catch(err => {
        if (err.code === "auth/popup-closed-by-user") {
          alert("Cerraste la ventana de inicio de sesión antes de completarla.");
        } else if (err.code === "auth/cancelled-popup-request") {
          alert("Ya hay una ventana de autenticación abierta. Cerrala y volvé a intentarlo.");
        } else {
          console.error("Error en login con Google:", err);
          alert("Error al iniciar sesión con Google: " + err.message);
        }
      });
  });
} else {
  const saved = JSON.parse(localStorage.getItem("user"));
  // Ya no redirigimos si no está autenticado
  if (saved?.email && welcomeText) {
    welcomeText.textContent = saved.email;
    if (logoutBtn) {
      logoutBtn.classList.remove("hidden");
      loginBtn?.classList.add("hidden");
    }
    solicitarPermisoNotificaciones();
  }

  logoutBtn?.addEventListener("click", () => {
    signOut(auth).then(() => {
      localStorage.removeItem("user");
      window.location.reload();
    });
  });
}

// Comentarios
const categoriasImg = {
  limpieza: "assets/limpieza.jpg",
  transporte: "assets/transporte.jpg",
  verdes: "assets/espacios_verdes.jpg",
  eventos: "assets/eventos.jpg",
  subte: "assets/subte.jpg",
  seguridad: "assets/seguridad.jpg",
  accesibilidad: "assets/accesibilidad.jpg"
};

async function enviarComentariosPendientes() {
  const pendientes = await obtenerComentariosPendientes();
  for (const pendiente of pendientes) {
    try {
      await guardarComentario(pendiente.categoria, {
        texto: pendiente.texto,
        calificacion: pendiente.calificacion,
        fecha: pendiente.fecha,
      });
      await eliminarComentarioPendiente(pendiente.id);
    } catch (err) {
      console.error("Error al enviar comentario pendiente:", err);
    }
  }
  if (pendientes.length > 0 && ultimaCategoriaSeleccionada) {
    mostrarComentarios(ultimaCategoriaSeleccionada, document.getElementById('comentarios'));
  }
}

let ultimaCategoriaSeleccionada = null;

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const categoria = btn.dataset.tab;
    ultimaCategoriaSeleccionada = categoria;
    localStorage.setItem('ultimaCategoria', categoria);

    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    content.innerHTML = `
      <h2>${btn.textContent}</h2>
      <img src="${categoriasImg[categoria]}" alt="${btn.textContent}" style="width:300px; height:200px; object-fit:cover; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-bottom:1rem; display:block; margin-left:auto; margin-right:auto;" />
      <label>Tu comentario:</label><br/>
      <textarea id="comentario"></textarea><br/>
      <label>Tu puntuación:</label>
      <div id="calificacion" style="margin-bottom:1rem; user-select:none;"></div>
      <button id="submit">Enviar</button>
      <h3>Comentarios anteriores:</h3>
      <div id="comentarios"></div>
    `;

    const ratingContainer = document.getElementById("calificacion");
    crearRating(ratingContainer);

    mostrarComentarios(categoria, document.getElementById("comentarios"));

    document.getElementById("submit").addEventListener("click", async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) {
        localStorage.setItem("mensajeLogin", "Debes iniciar sesión para enviar comentarios.");
        window.location.href = "login.html";
        return;
      }

      const texto = document.getElementById("comentario").value.trim();
      const calificacion = parseInt(ratingContainer.dataset.rating) || 0;

      if (texto === "") {
        alert("Por favor, ingresa un comentario antes de enviar.");
        return;
      }
      if (calificacion === 0) {
        alert("Por favor, selecciona una calificación.");
        return;
      }

      const nuevoComentario = {
        texto,
        calificacion,
        fecha: new Date().toISOString(),
      };

      if (navigator.onLine) {
        try {
          await guardarComentario(categoria, nuevoComentario);
        } catch (error) {
          await guardarComentarioOffline(categoria, nuevoComentario);
          alert("Error al enviar comentario. Se guardó localmente.");
        }
      } else {
        await guardarComentarioOffline(categoria, nuevoComentario);
        alert("Estás offline. Comentario guardado localmente.");
      }

      document.getElementById("comentario").value = "";
      crearRating(ratingContainer);
      mostrarComentarios(categoria, document.getElementById("comentarios"));
    });
  });
});

window.addEventListener("online", () => {
  enviarComentariosPendientes();
});

inicializarDB().then(() => {
  const ultima = localStorage.getItem('ultimaCategoria');
  if (ultima) {
    const btn = document.querySelector(`button[data-tab="${ultima}"]`);
    if (btn) btn.click();
  }
});
