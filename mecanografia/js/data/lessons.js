/**
 * MecaSamType Web — Currículo de lecciones
 * Textos pensados para teclado español (ES), progresión por filas.
 * Los ids son estables: se usan como clave en Supabase.
 *
 * Cada texto tiene entre 590 y 670 caracteres (aprox. 10-12 líneas en pantalla
 * y 3-10 minutos al ritmo de la meta). La dificultad sube por las teclas que se
 * presentan y por la meta de velocidad, no por la longitud del ejercicio.
 */

export const UNITS = [
  {
    id: "u1",
    num: "01",
    title: "Fundamentos",
    subtitle: "Fila guía y primeras palabras",
    accent: "#32e6c4",
    lessons: [
      {
        id: "u1-l1",
        title: "La fila guía",
        focus: ["a", "s", "d", "f", "ñ", "l", "k", "j"],
        goalWpm: 12,
        goalAccuracy: 94,
        tip: "Apoya los dedos en a s d f y ñ l k j. Los pulgares descansan sobre la barra espaciadora.",
        text: "asdf ñlkj asdf ñlkj asdf ñlkj asdf ñlkj la sala la sala las alas las alas la falda la falda sal sal sala sala falsa falsa dada dada la falsa falda la falsa ala sal a la sala sal a la sala las faldas las alas la sal la sala asdf ñlkj asdf ñlkj la falda falsa la sala dada las alas la salada la sala salada la falsa sala la sala las faldas la sal la sala la falda la sala las alas la sala falsa falsa sala sala ala ala falda falda sal sal la sala falsa la sala salada la falda falsa la sal la sala las alas la sala la sala las faldas asdf ñlkj asdf ñlkj la sala falsa las alas saladas la sal la sala la falda salada las faldas falsas",
      },
      {
        id: "u1-l2",
        title: "Índices y medios",
        focus: ["g", "h", "e", "i"],
        goalWpm: 14,
        goalAccuracy: 94,
        tip: "Los índices se estiran hacia g y h; los dedos medios suben a e e i. Vuelve siempre a la fila guía.",
        text: "asdfg ñlkjh asdfg ñlkjh la isla la isla el hada el hada las gafas las gafas seis seis sede sede idea idea ideas ideas el hada lee las ideas la isla fiel la sede fiel la sal la leña la isla la leña se deshiela la sal se deshiela el hada lee la idea las gafas de la isla la leña de la sede seis ideas fieles la sal de la isla la sede de la isla la idea fiel las ideas fieles asdfg ñlkjh asdfg ñlkjh seis seis sede sede idea idea la isla el hada las gafas la leña la sal la sede las ideas el hada lee la isla fiel la sede fiel el hada lee las ideas la sal se deshiela la leña de la isla seis gafas fieles",
      },
      {
        id: "u1-l3",
        title: "Arriba con los índices",
        focus: ["r", "t", "u", "y"],
        goalWpm: 16,
        goalAccuracy: 95,
        tip: "r y t son del índice izquierdo; y y u, del derecho. Sube sin separar el resto de los dedos de su sitio.",
        text: "tres tres seis seis tu tu su su tus tus tus tus ideas ideas tarea tarea estudia estudia la tarea de la isla la isla del sur la ruta de la isla el aula de la sede las tijeras de la sala tu letra y tu tarea la tierra y el aire la altura de la isla tres tareas y seis ideas lee la letra de la tarea estudia la letra y la tarea la silla de la sala la sal de la tierra el taller de la sede tus ideas y tus tareas la ruta del sur tres tres seis seis asdfg ñlkjh asdfg ñlkjh la ruta del sur la tarea del aula las ideas del taller la ruta del taller la silla del aula las tijeras de la sala tus ideas y tus tareas la tierra del sur",
      },
      {
        id: "u1-l4",
        title: "Anulares y meñiques",
        focus: ["q", "w", "o", "p"],
        goalWpm: 18,
        goalAccuracy: 95,
        tip: "q y w con el anular y meñique izquierdos; o y p con los derechos. Son las teclas que más cuesta dominar.",
        text: "quiero tres ideas para poder estudiar pero solo dos hay todo el peso de la tarea el equipo estudia y la duda queda la idea es para ti la ruta de la isla el aire puro de la isla el sol de la tarde la sopa y el postre la puerta del patio la tierra y el paisaje la fiesta de la sede la siesta de la tarde las flores del patio el equipo estudia la tarea la tarea es para ti quiero tres ideas y solo dos hay la ruta del sur el aula de la sede la letra de la tarea el peso del estudio la duda del equipo la idea es para ti todo el peso de la tarea la sopa del patio la puerta del taller el sol del sur la fiesta del aula la siesta del equipo",
      },
    ],
  },
  {
    id: "u2",
    num: "02",
    title: "Fila inferior",
    subtitle: "Completa el teclado",
    accent: "#7c5cff",
    lessons: [
      {
        id: "u2-l1",
        title: "La fila de abajo",
        focus: ["v", "b", "n", "m"],
        goalWpm: 18,
        goalAccuracy: 95,
        tip: "Baja los índices hacia v b y n m. La muñeca no se mueve: solo el dedo.",
        text: "van van bien bien vivo vivo nuevo nuevo mano mano mismo mismo nadie nadie vino vino mi mano mi ventana la vida de la isla un viaje nuevo un buen vino la montaña el hombre la sombra el nombre nadie vive mi equipo la verdad el mundo un minuto un momento la memoria el amor mi familia la amistad el invierno la nieve el viento la lluvia la nube el mar la arena la isla el sendero la mañana la tierra el fuego el agua la sed la vida es bella la familia vive en la montaña el viento mueve la arena el invierno trae nieve y lluvia mi memoria guarda tu nombre la verdad del viaje la sombra del hombre la ventana del aula un minuto de pausa el vino y el pan la mano y la ventana",
      },
      {
        id: "u2-l2",
        title: "Esquina izquierda",
        focus: ["c", "x", "z"],
        goalWpm: 20,
        goalAccuracy: 96,
        tip: "c con el dedo medio, x con el anular y z con el meñique. Mantén la mano relajada.",
        text: "casa casa caza caza zona zona cocina cocina exacto exacto examen examen caja caja cena cena zorro zorro zapato zapato texto texto cocinero cocinero la casa tiene una cocina amplia la caza del zorro el examen exacto la cena de la familia el zapato nuevo la caja de texto la zona de estudio el cocinero prepara la cena el zorro vive en la zona el examen de la casa la caja y el zapato la cocina y la cena el texto exacto la caza del zorro la casa de la zona la cena del cocinero el zapato y la caja el examen y la cena la cocina limpia el examen exacto la zona exacta el examen del grupo la caja del zapato el texto del cocinero la cena de la casa",
      },
      {
        id: "u2-l3",
        title: "Palabras completas",
        focus: ["a-z"],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "Ya tienes las tres filas. Escribe palabras completas sin mirar y mantén un ritmo constante.",
        text: "la casa tiene una mesa grande y una silla nueva en la sala. el sol entra por la ventana y la luz ilumina todo el cuarto. los libros descansan sobre el escritorio. mi hermano prepara la cena mientras la familia comparte historias. luego lee un libro junto a la puerta. el perro duerme sobre la alfombra y el gato observa desde el patio. la ciudad despierta poco a poco y el ruido llega desde la calle. en la oficina, el reloj marca las ocho y el equipo revisa la agenda. cada mañana es una oportunidad. el trabajo avanza cuando hay orden y calma. por la tarde el equipo comparte una merienda y revisa la lista de tareas.",
      },
    ],
  },
  {
    id: "u3",
    num: "03",
    title: "Números y símbolos",
    subtitle: "La oficina real",
    accent: "#ffb84d",
    lessons: [
      {
        id: "u3-l1",
        title: "Los números",
        focus: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        goalWpm: 18,
        goalAccuracy: 95,
        tip: "La fila numérica se escribe con los dedos en extensión, sin levantar la mano. Mira la pantalla, no el teclado.",
        text: "1 2 3 4 5 6 7 8 9 0 10 20 30 40 50 60 70 80 90 100 2026 24 365 12 18 205 150 25 1234 5678 50 40 90 75. hay 24 alumnos y 3 computadoras en el aula 12. el grupo 9B tiene 18 tareas para el 24 de octubre de 2026. la oficina 205 abre a las 8 y cierra a las 17. el precio es 150 y el descuento 25. la clave 1234 y el codigo 5678. el aula 3 y el equipo 7. el curso 2026 tiene 30 clases y 2 pruebas. el mes tiene 30 jornadas. la biblioteca abre a las 9 y cierra a las 19. el alumno 24 entrega 3 tareas el 10 de octubre. hay 12 mesas y 48 sillas en el aula 205. el aula 12 tiene 24 mesas y 48 sillas. la tarea 3 vence el 10 de octubre de 2026 a las 17.",
      },
      {
        id: "u3-l2",
        title: "Correos y claves",
        focus: ["@", "_", "-", "."],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "La arroba se escribe con AltGr + 2. El guion bajo, con Shift + guion. Practica sin prisa: son las teclas que más se fallan.",
        text: "ana.lopez@correo.es clave_2026 usuario24 tarea-final_01 samuel@instituto.edu grupo_9b practica_03 maria.gomez@correo.es informe-final_01 clave_segura_2026 correo_2026 profesor@instituto.edu tarea_05 equipo_7 aula_205 alumno_24 practica-final_02 examen_2026 fecha_24-10-2026 nombre_apellido usuario_nuevo_01 clave-temporal tarea_equipo_09 informe_2026 grupo_9b_equipo_7 correo.institucional@edu.bo clave_del_grupo_9b tarea-final_2026 clave_2026_grupo_9b tarea_05_equipo_7 clave_2026_tarea_05 alumno_205@edu.bo practica_09_final grupo_9b_2026 tarea_10_equipo_7 clave_2026_final alumno_24@edu.bo",
      },
      {
        id: "u3-l3",
        title: "Símbolos de oficina",
        focus: ["%", "/", "(", ")", "&"],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "Los símbolos viven en la tecla Shift. Si fallas, vuelve a la fila guía antes de seguir.",
        text: "100% 50/50 25% 75% nombre_apellido (tarea 1) (grupo 9B) x-y & precio #2 #3 fecha 24/10/2026 ruta C:/documentos D:/respaldo archivo_01.pdf informe_(final).docx 50/100 3/4 1/2 (a & b) #equipo #aula costo & beneficio 100% & 0% (nombre) apellido_2 tarea_3/4 nota 90/100 ruta C:/tareas/2026 informe & anexo #1 #2 precio 50% & 25% usuario_01 correo@edu.bo (grupo & equipo) 24/10/2026 100% & 50/50 correo (personal) & (institucional) #grupo_9B #tarea_05 30% 70% 10/10 20/20 100/100 (a & b & c) nota (final) & (parcial) #2026 100% (grupo & equipo) tarea (1) & tarea (2) 100/100 #grupo_9B 50% & 50% 24/10/2026 (a & b)",
      },
    ],
  },
  {
    id: "u4",
    num: "04",
    title: "Español real",
    subtitle: "Ñ, acentos y signos",
    accent: "#ff7a90",
    lessons: [
      {
        id: "u4-l1",
        title: "La Ñ y las mayúsculas",
        focus: ["ñ", "Ñ", "Shift"],
        goalWpm: 24,
        goalAccuracy: 96,
        tip: "La Ñ está a la derecha de la L. Para las mayúsculas, mantén Shift con el meñique contrario a la letra.",
        text: "El niño pequeño añade una ñ al año. España, mañana y sueño. La Ñ es una letra nuestra. El señor enseña la ñ a la niña. La montaña y la cañada. El año nuevo y el cumpleaños. La piña y la muñeca. La leña y el pañuelo. El ñu camina por la cañada. La niña añade una piña a la cesta. El Señor compra un pañuelo y una muñeca. Mañana el niño pequeño cumple un año. La montaña tiene nieve y la cañada tiene leña. España es una tierra. El sueño del niño. La señora y el niño. El ñu y la niña. La piña y la leña. El pañuelo y la muñeca. La niña pequeña añade leña a la cañada. El señor enseña la ñ y la niña aprende.",
      },
      {
        id: "u4-l2",
        title: "Acentos y diéresis",
        focus: ["á", "é", "í", "ó", "ú", "ü"],
        goalWpm: 24,
        goalAccuracy: 96,
        tip: "El acento está a la derecha de la Ñ: pulsa la tecla muerta y después la vocal. La diéresis es Shift + esa misma tecla.",
        text: "El lápiz está en la mesa. María escribió una canción para el corazón. El pingüino también practicó: á é í ó ú ü. La niña cantó y el niño bailó. El árbol y la música. La última lección fue difícil. El teléfono sonó a las tres. Mi abuelo tiene un reloj antiguo. El huésped pidió agua fría. La cigüeña voló sobre el río. El día fue bonito. La canción más bonita. El jardín tenía flores. La máquina escribió el informe. El profesor explicó la lección. Los alumnos practicaron con ánimo. La música del corazón. El próximo lunes revisaré la evaluación. La evaluación fue difícil pero el ánimo del grupo ayudó.",
      },
      {
        id: "u4-l3",
        title: "Signos y comillas",
        focus: ["¿", "¡", "?", "!", "\""],
        goalWpm: 25,
        goalAccuracy: 96,
        tip: "En español los signos de apertura también se escriben: ¿ y ¡. No los dejes para el final.",
        text: "¿Cómo estás? ¡Muy bien! Escribe con calma y verás: ¡lo lograste! El informe se llama \"Tecnología y oficina\". ¿Tienes el documento? ¡Claro que sí! ¿Dónde está la carpeta? ¡Aquí está! ¿Preparaste la tarea? ¡Por supuesto! \"Informe final\" es el nombre del archivo. ¿Cuántos años tienes? ¡Diecisiete! ¿Y tú? ¡También! ¿Viste el mensaje? ¡No lo vi! ¿Puedes enviarlo hoy? ¡Sí, ahora mismo! ¡Qué buen trabajo! ¿Nos vemos mañana? ¡Hasta luego! ¿Te gustó el ejercicio? ¡Muchísimo! ¿Practicamos otra vez? ¡Claro que sí! ¿Estás listo? ¡Sí! ¿Empezamos? ¡Vamos! ¿Quién trajo el informe? ¡Yo! ¿Dónde lo dejaste? ¡En la carpeta!",
      },
    ],
  },
  {
    id: "u5",
    num: "05",
    title: "Fluidez",
    subtitle: "Precisión y velocidad",
    accent: "#5aa9ff",
    lessons: [
      {
        id: "u5-l1",
        title: "Palabras frecuentes",
        focus: ["a-z"],
        goalWpm: 28,
        goalAccuracy: 97,
        tip: "No pienses letra a letra: reconoce la palabra completa. La velocidad nace de la precisión repetida.",
        text: "de la que el en y a los se del las un por con no una su para es al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas vosotros os mío mía míos mías tuyo tuya suyo suya nuestro nuestra vuestro vuestra aquellos aquellas siempre nunca tampoco además incluso mientras después todavía aquí allí ahora luego casi sólo según",
      },
      {
        id: "u5-l2",
        title: "Refranes",
        focus: ["a-z", ".", ","],
        goalWpm: 30,
        goalAccuracy: 97,
        tip: "Mantén un ritmo regular y respira en los puntos. La constancia gana a las rachas de velocidad.",
        text: "Más vale tarde que nunca. No por mucho madrugar amanece más temprano. Quien mucho abarca poco aprieta. A quien madruga, Dios le ayuda. El que algo quiere, algo le cuesta. No dejes para mañana lo que puedas hacer hoy. En boca cerrada no entran moscas. Más vale pájaro en mano que ciento volando. Agua que no has de beber, déjala correr. Camarón que se duerme, se lo lleva la corriente. A caballo regalado no se le miran los dientes. Donde hay confianza da asco. No hay mal que por bien no venga. El que persevera alcanza. No hay atajo sin trabajo. Quien siembra vientos recoge tempestades. Más sabe el diablo por viejo que por diablo.",
      },
      {
        id: "u5-l3",
        title: "Párrafo de oficina",
        focus: ["a-z"],
        goalWpm: 32,
        goalAccuracy: 97,
        tip: "Escribe como si redactaras un correo real: sin mirar las manos y sin corregir cada palabra.",
        text: "La secretaria organizó los documentos en carpetas claras y envió el informe antes del mediodía. Después revisó la agenda, confirmó dos reuniones y guardó una copia en la nube. Al final del día apagó el equipo con la tranquilidad del deber cumplido. El lunes siguiente preparó la presentación para la gerencia, corrigió las cifras del presupuesto y añadió los gráficos solicitados. Antes de imprimir, verificó los márgenes, el tamaño de la letra y la numeración de las páginas. Cuando el gerente aprobó el documento, lo compartió con todo el equipo y archivó la versión final en la carpeta del proyecto.",
      },
      {
        id: "u5-l4",
        title: "Test de velocidad",
        focus: ["a-z"],
        goalWpm: 38,
        goalAccuracy: 97,
        tip: "Última prueba: respira, relaja los hombros y escribe sin prisa. La velocidad llegará sola.",
        text: "La mecanografía es una habilidad que se construye con paciencia. Cada día, quince minutos de práctica consciente valen más que una hora de escritura distraída. Si mantienes la espalda recta, las muñecas relajadas y la mirada en la pantalla, tus dedos aprenderán a encontrar las teclas sin pensarlo. La velocidad llegará como consecuencia de la precisión. No te preocupes por los errores: corrige con calma y vuelve a la fila guía. Respira, mantén un ritmo constante y recuerda que cada palabra bien escrita es un paso más hacia la fluidez. Al terminar, revisa tus marcas y propone una meta nueva para la próxima práctica.",
      },
    ],
  },
];

export const LESSONS = UNITS.flatMap((unit) =>
  unit.lessons.map((lesson, index) => ({
    ...lesson,
    unitId: unit.id,
    unitNum: unit.num,
    unitTitle: unit.title,
    unitAccent: unit.accent,
    unitIndex: index,
    globalIndex: 0,
  }))
).map((lesson, index, all) => ({ ...lesson, globalIndex: index, isLast: index === all.length - 1 }));

export const getLesson = (id) => LESSONS.find((lesson) => lesson.id === id) || null;

export const getNextLesson = (id) => {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  return index >= 0 && index < LESSONS.length - 1 ? LESSONS[index + 1] : null;
};

export const getUnit = (unitId) => UNITS.find((unit) => unit.id === unitId) || null;

export const countUnitLessons = (unitId) => {
  const unit = getUnit(unitId);
  return unit ? unit.lessons.length : 0;
};
