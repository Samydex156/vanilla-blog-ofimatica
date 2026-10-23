/**
 * MecaSamType Web — Currículo de lecciones
 * Textos pensados para teclado español (ES), progresión por filas.
 * Los ids son estables: se usan como clave en Supabase.
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
        text: "asdf ñlkj asdf ñlkj asdf ñlkj asdf ñlkj sala sala falda falda ala ala dada dada las las sal sal falsa falsa",
      },
      {
        id: "u1-l2",
        title: "Índices y medios",
        focus: ["g", "h", "e", "i"],
        goalWpm: 14,
        goalAccuracy: 94,
        tip: "Los índices se estiran hacia g y h; los dedos medios suben a e e i. Vuelve siempre a la fila guía.",
        text: "asdfg ñlkjh asdfg ñlkjh gafas gafas hada hada idea idea sede sede seis seis",
      },
      {
        id: "u1-l3",
        title: "Arriba con los índices",
        focus: ["r", "t", "u", "y"],
        goalWpm: 16,
        goalAccuracy: 95,
        tip: "r y t son del índice izquierdo; y y u, del derecho. Sube sin separar el resto de los dedos de su sitio.",
        text: "tres tres seis seis tu tu su su mis mis ideas ideas tarea tarea estudia estudia",
      },
      {
        id: "u1-l4",
        title: "Anulares y meñiques",
        focus: ["q", "w", "o", "p"],
        goalWpm: 18,
        goalAccuracy: 95,
        tip: "q y w con el anular y meñique izquierdos; o y p con los derechos. Son las teclas que más cuesta dominar.",
        text: "quiero tres ideas para poder estudiar pero solo dos sirven todo el peso de la tarea",
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
        text: "van van bien bien vivo vivo nuevo nuevo mano mano mismo mismo nunca nunca vino vino",
      },
      {
        id: "u2-l2",
        title: "Esquina izquierda",
        focus: ["c", "x", "z"],
        goalWpm: 20,
        goalAccuracy: 96,
        tip: "c con el dedo medio, x con el anular y z con el meñique. Mantén la mano relajada.",
        text: "casa casa caza caza zona zona cocina cocina exacto exacto examen examen",
      },
      {
        id: "u2-l3",
        title: "Palabras completas",
        focus: ["a-z"],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "Ya tienes las tres filas. Escribe palabras completas sin mirar y mantén un ritmo constante.",
        text: "la casa tiene una mesa grande y una silla nueva en la sala. el sol entra por la ventana y la luz ilumina todo el cuarto. los libros descansan sobre el escritorio.",
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
        text: "1 2 3 4 5 6 7 8 9 0 10 20 30 40 50 60 70 80 90 100 2026 24 365 hay 24 alumnos y 3 computadoras en el aula 12",
      },
      {
        id: "u3-l2",
        title: "Correos y claves",
        focus: ["@", "_", "-", "."],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "La arroba se escribe con AltGr + 2. El guion bajo, con Shift + guion. Practica sin prisa: son las teclas que más se fallan.",
        text: "ana.lopez@correo.es clave_2026 usuario24 tarea-final_01 samuel@instituto.edu grupo_9b prac-tica",
      },
      {
        id: "u3-l3",
        title: "Símbolos de oficina",
        focus: ["%", "/", "(", ")", "&"],
        goalWpm: 22,
        goalAccuracy: 96,
        tip: "Los símbolos viven en la tecla Shift. Si fallas, vuelve a la fila guía antes de seguir.",
        text: "100% 50/50 nombre_apellido (tarea 1) x-y & precio #2 fecha 24/10/2026 ruta C:/documentos",
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
        text: "El niño pequeño añade una ñ al año. España, mañana y sueño. La Ñ es una letra nuestra.",
      },
      {
        id: "u4-l2",
        title: "Acentos y diéresis",
        focus: ["á", "é", "í", "ó", "ú", "ü"],
        goalWpm: 24,
        goalAccuracy: 96,
        tip: "El acento está a la derecha de la Ñ: pulsa la tecla muerta y después la vocal. La diéresis es Shift + esa misma tecla.",
        text: "El lápiz está en la mesa. María escribió una canción para el corazón. El pingüino también practicó: á é í ó ú ü.",
      },
      {
        id: "u4-l3",
        title: "Signos y comillas",
        focus: ["¿", "¡", "?", "!", "\""],
        goalWpm: 25,
        goalAccuracy: 96,
        tip: "En español los signos de apertura también se escriben: ¿ y ¡. No los dejes para el final.",
        text: "¿Cómo estás? ¡Muy bien! Escribe con calma y verás: ¡lo lograste! El informe se llama \"Tecnología y oficina\".",
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
        text: "de la que el en y a los se del las un por con no una su para es al lo como más pero sus le ya o este sí porque esta entre",
      },
      {
        id: "u5-l2",
        title: "Refranes",
        focus: ["a-z", ".", ","],
        goalWpm: 30,
        goalAccuracy: 97,
        tip: "Mantén un ritmo regular y respira en los puntos. La constancia gana a las rachas de velocidad.",
        text: "Más vale tarde que nunca. No por mucho madrugar amanece más temprano. Quien mucho abarca poco aprieta. A quien madruga, Dios le ayuda.",
      },
      {
        id: "u5-l3",
        title: "Párrafo de oficina",
        focus: ["a-z"],
        goalWpm: 32,
        goalAccuracy: 97,
        tip: "Escribe como si redactaras un correo real: sin mirar las manos y sin corregir cada palabra.",
        text: "La secretaria organizó los documentos en carpetas claras y envió el informe antes del mediodía. Después revisó la agenda, confirmó dos reuniones y guardó una copia en la nube. Al final del día apagó el equipo con la tranquilidad del deber cumplido.",
      },
      {
        id: "u5-l4",
        title: "Test de velocidad",
        focus: ["a-z"],
        goalWpm: 38,
        goalAccuracy: 97,
        tip: "Última prueba: respira, relaja los hombros y escribe sin prisa. La velocidad llegará sola.",
        text: "La mecanografía es una habilidad que se construye con paciencia. Cada día, quince minutos de práctica consciente valen más que una hora de escritura distraída. Si mantienes la espalda recta, las muñecas relajadas y la mirada en la pantalla, tus dedos aprenderán a encontrar las teclas sin pensarlo. La velocidad llegará como consecuencia de la precisión.",
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
