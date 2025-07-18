export function crearRating(container) {
  container.innerHTML = "";
  container.dataset.rating = "0"; // Valor inicial

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.className = "calificacion";
    star.style.cursor = "pointer";
    star.style.color = "#ccc";
    star.style.fontSize = "2rem";
    star.style.transition = "color 0.3s ease";
    star.style.marginRight = "0.25rem";

    star.onclick = () => {
      container.dataset.rating = i.toString(); // Guardar rating en dataset
      // Actualizar visual: estrellas seleccionadas doradas, otras grises
      container.querySelectorAll(".calificacion").forEach((s, idx) => {
        s.style.color = idx < i ? "#f39c12" : "#ccc"; // dorado o gris
      });
    };

    star.onmouseover = () => {
      // Hover previews: iluminar hasta la estrella sobre la que está el mouse
      container.querySelectorAll(".calificacion").forEach((s, idx) => {
        s.style.color = idx <= i - 1 ? "#f39c12" : "#ccc";
      });
    };
    star.onmouseout = () => {
      // Restaurar estado normal según dataset.rating
      const rating = parseInt(container.dataset.rating) || 0;
      container.querySelectorAll(".calificacion").forEach((s, idx) => {
        s.style.color = idx < rating ? "#f39c12" : "#ccc";
      });
    };

    container.appendChild(star);
  }
}
