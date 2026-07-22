document.addEventListener("DOMContentLoaded", function () {
    // 1. Buscador en vivo (soporta múltiples listas .item-list)
    var buscador = document.getElementById("buscador-clases") || document.getElementById("buscador-guias") || document.getElementById("buscador-practicas") || document.getElementById("buscador-index");
    if (buscador) {
        var listaItems = document.querySelectorAll(".item-list li");
        if (listaItems.length > 0) {
            buscador.addEventListener("input", function () {
                var filtro = buscador.value.toLowerCase().trim();
                for (var i = 0; i < listaItems.length; i++) {
                    var item = listaItems[i];
                    item.style.display = item.textContent.toLowerCase().indexOf(filtro) !== -1 ? "" : "none";
                }
            });
        }
    }

    // 2. Toggle modo oscuro y sincronización del botón
    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            var currentTheme = document.documentElement.getAttribute("data-theme");
            var nextTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", nextTheme);
            localStorage.setItem("theme", nextTheme);
            this.textContent = nextTheme === "dark" ? "\u2600" : "\u263E";
        });

        // Sincronizar ícono según data-theme en <html>
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        toggleBtn.textContent = isDark ? "\u2600" : "\u263E";
    }

    // 3. Encabezado de impresión: Copiar el h1 al centro del encabezado de impresión
    var h1 = document.querySelector(".lesson-header h1, .guide-header h1, header h1");
    var center = document.querySelector(".print-header-center");
    if (h1 && center) {
        center.textContent = h1.textContent.trim();
    }

    // 4. Modal de imágenes (soporte de cierre con tecla Escape)
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.keyCode === 27) {
            var modal = document.getElementById("img-modal");
            if (modal && modal.style.display !== "none") {
                modal.style.display = "none";
            }
        }
    });
});

