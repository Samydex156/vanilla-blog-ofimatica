document.addEventListener("DOMContentLoaded", function () {
    const buscador = document.getElementById("buscador-guias") || document.getElementById("buscador-clases") || document.getElementById("buscador-practicas");
    const listaItems = document.querySelectorAll(".item-list-doc li");

    if (!buscador) return;

    buscador.addEventListener("input", function () {
        const filtro = buscador.value.toLowerCase();

        listaItems.forEach(item => {
            const texto = item.textContent.toLowerCase();
            if (texto.includes(filtro)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    });
});
