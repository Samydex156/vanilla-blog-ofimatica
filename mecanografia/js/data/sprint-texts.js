/**
 * Textos de respaldo para el sprint.
 * En producción se cargan aleatoriamente desde Supabase (tabla sprint_texts).
 * El modo demo y la caída de red usan esta copia local.
 */

export const SPRINT_TEXTS = [
  {
    id: 1,
    title: "La oficina que fluye",
    body: "Una oficina que fluye no se mide por la cantidad de correos enviados, sino por el tiempo que las personas dedican a pensar. Organizar los archivos, nombrar las carpetas con criterio y cerrar las pestañas que no se usan son gestos pequeños que devuelven calma. La productividad nace del orden y se sostiene con pausas breves.",
  },
  {
    id: 2,
    title: "Atajos que ahorran horas",
    body: "Copiar, cortar y pegar son solo el principio. Cuando dominas los atajos de tu editor, tus manos dejan de interrumpir tus ideas. Guardar con Ctrl y S, buscar con Ctrl y F, deshacer con Ctrl y Z: tres combinaciones que repetidas durante un curso entero ahorran horas. Aprender el teclado es invertir en tu propio tiempo.",
  },
  {
    id: 3,
    title: "El correo perfecto",
    body: "Un buen correo se entiende en la primera lectura. Saluda con claridad, explica el motivo en la primera línea y cierra con una petición concreta. Evita los párrafos interminables y revisa la ortografía antes de enviar. Si el asunto no resume el mensaje, el destinatario tardará más en responder. Escribir bien también es respetar el tiempo ajeno.",
  },
  {
    id: 4,
    title: "La nube como cuaderno",
    body: "Guardar en la nube es mucho más que tener una copia de seguridad. Es poder continuar un documento desde otra computadora, compartir una carpeta con el equipo y recuperar una versión anterior cuando algo sale mal. La clave está en nombrar los archivos con fechas y en no compartir enlaces con permisos de edición sin necesidad.",
  },
  {
    id: 5,
    title: "Seguridad sin miedo",
    body: "Una contraseña larga y distinta para cada servicio vale más que cualquier programa milagroso. Activa la verificación en dos pasos, desconfía de los enlaces que piden datos urgentes y cierra la sesión cuando uses un equipo compartido. La seguridad digital no es un trámite: es una costumbre que se practica todos los días.",
  },
  {
    id: 6,
    title: "Aprender haciendo",
    body: "Leer sobre una herramienta sirve para orientarse, pero la destreza aparece al practicar. Dedica quince minutos diarios a repetir un ejercicio, equivócate y vuelve a intentarlo. La memoria de los dedos se construye con repetición y descanso. Ninguna clase sustituye las horas de práctica, pero una buena guía evita perder el rumbo.",
  },
  {
    id: 7,
    title: "Una pausa activa",
    body: "Después de cuarenta minutos frente a la pantalla, levanta la vista. Estira los hombros, mueve las muñecas y camina unos pasos. La pausa activa no interrumpe el trabajo: lo sostiene. Los ojos agradecen mirar algo lejano y la espalda agradece cambiar de postura. Vuelve al teclado con las manos relajadas y la mente despejada.",
  },
  {
    id: 8,
    title: "Presentaciones que se entienden",
    body: "Una diapositiva no es un documento. Si el público tiene que leer todo lo que dices, deja de escucharte. Usa una idea por pantalla, jerarquiza el tamaño del texto y acompaña con imágenes que expliquen. El contraste y el espacio en blanco son aliados. La presentación perfecta es la que se recuerda sin haberla leído.",
  },
  {
    id: 9,
    title: "El arte de nombrar archivos",
    body: "Un nombre de archivo claro ahorra búsquedas y discusiones. Usa fechas en formato año mes día, evita los espacios innecesarios y sé específico: no es lo mismo informe final que informe ventas marzo. Si el proyecto tiene varias versiones, numéralas. Una carpeta ordenada es un mapa que cualquiera puede leer sin preguntar.",
  },
  {
    id: 10,
    title: "El café y la concentración",
    body: "El café de la mañana no hace magia, pero ayuda a empezar. Lo que de verdad sostiene la concentración es una tarea concreta y un límite de tiempo. Prueba trabajar veinticinco minutos sin notificaciones y descansar cinco. Al terminar, anota qué avanzaste. La constancia de pequeños bloques vence a las jornadas heroicas que nunca llegan.",
  },
  {
    id: 11,
    title: "Del papel a la pantalla",
    body: "Digitalizar no significa escanear todo y olvidarlo. Significa decidir qué merece conservarse, cómo encontrarlo después y quién puede acceder. Una carpeta compartida con nombres claros vale más que mil archivos sueltos en el escritorio. El papel tiene su lugar, pero la información importante debe poder buscarse en segundos.",
  },
  {
    id: 12,
    title: "El futuro del trabajo",
    body: "Las herramientas cambian, pero saber escribir, ordenar ideas y comunicar con claridad sigue siendo el centro. La tecnología acelera lo que ya sabes hacer; no reemplaza el criterio. Aprende el teclado, domina tu procesador de textos y cuida tus archivos. Lo demás llega con práctica y curiosidad.",
  },
];

export const getRandomLocalText = () =>
  SPRINT_TEXTS[Math.floor(Math.random() * SPRINT_TEXTS.length)];
