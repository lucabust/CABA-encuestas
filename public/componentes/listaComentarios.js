import { traerComentariosDesdeFirestore } from '../db.js';

export async function mostrarComentarios(categoria, container) {
  const comentarios = await traerComentariosDesdeFirestore(categoria);
  container.innerHTML = comentarios.map(c => `
    <div class="comentario">
      <strong class="puntuacion">${"★".repeat(c.calificacion)}</strong><br/>
      ${c.texto}<br/>
      <small>${new Date(c.fecha).toLocaleString()}</small>
    </div>
  `).join("");
}