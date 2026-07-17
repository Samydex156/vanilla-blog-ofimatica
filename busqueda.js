document.addEventListener("DOMContentLoaded", function () {
    var buscador = document.getElementById("buscador-clases") || document.getElementById("buscador-guias") || document.getElementById("buscador-practicas");
    if (!buscador) return;

    var lista = document.querySelector(".item-list");
    if (!lista) return;

    var listaItems = lista.querySelectorAll("li");

    buscador.addEventListener("input", function () {
        var filtro = buscador.value.toLowerCase();
        for (var i = 0; i < listaItems.length; i++) {
            var item = listaItems[i];
            item.style.display = item.textContent.toLowerCase().indexOf(filtro) !== -1 ? "" : "none";
        }
    });
});
