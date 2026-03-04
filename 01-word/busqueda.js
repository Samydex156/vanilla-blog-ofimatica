document.addEventListener("DOMContentLoaded", function() {
    const buscador = document.getElementById("buscador-guias");
    const listaItems = document.querySelectorAll(".item-list-doc li");

    buscador.addEventListener("input", function() {
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
