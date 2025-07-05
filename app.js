import { inicializarDB, guardarComentario, guardarComentarioOffline, obtenerComentariosPendientes, eliminarComentarioPendiente } from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';

const content = document.getElementById('content');
const buttons = document.querySelectorAll('.tabs button');

// Mapa de categorías a imágenes
const categoriasImg = {
  limpieza: "assets/limpieza.jpg",
  transporte: "assets/transporte.jpg",
  verdes: "assets/espacios_verdes.jpg",
  eventos: "assets/eventos.jpg",
  subte: "assets/subte.jpg",
  seguridad: "assets/seguridad.jpg",
  accesibilidad: "assets/accesibilidad.jpg"
};

// Función para enviar comentarios pendientes cuando vuelva la conexión
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
  if (pendientes.length > 0) {
    console.log("Comentarios pendientes enviados.");
    // Actualizar comentarios mostrando la categoría si alguna está seleccionada
    if (ultimaCategoriaSeleccionada) {
      mostrarComentarios(ultimaCategoriaSeleccionada, document.getElementById('comentarios'));
    }
  }
}

let ultimaCategoriaSeleccionada = null;

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const categoria = btn.dataset.tab;
    ultimaCategoriaSeleccionada = categoria;

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
//agregado gestión de envios online-offline
      if (navigator.onLine) {
        try {
          await guardarComentario(categoria, nuevoComentario);
        } catch (error) {
          // Si falla guardar online, guardar offline
          await guardarComentarioOffline(categoria, nuevoComentario);
          alert("Error al enviar comentario. Se guardó localmente para enviar más tarde.");
        }
      } else {
        await guardarComentarioOffline(categoria, nuevoComentario);
        alert("Estás offline. Tu comentario se guardará localmente y será enviado cuando tengas conexión.");
      }

      document.getElementById("comentario").value = "";
      crearRating(ratingContainer); // reinicia el rating
      mostrarComentarios(categoria, document.getElementById("comentarios"));
    });
  });
});

// Espera a que la conexión vuelva y envía lo comentarios pendientes
window.addEventListener("online", () => {
  console.log("Conexión restablecida. Enviando comentarios pendientes...");
  enviarComentariosPendientes();
});

inicializarDB();


