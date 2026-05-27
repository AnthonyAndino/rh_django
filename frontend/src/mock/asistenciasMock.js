// Mock data — generates 150 synthetic attendance records.
// 8% have no exit time (still open), status is based on entry time.
const nombresEmpleados = [
  'Carlos Mendoza', 'María González', 'José Hernández', 'Ana Lucía Torres',
  'David Castillo', 'Sofía Ramírez', 'Miguel Ángel Ruiz', 'Valentina Paz',
  'Fernando Ortega', 'Regina Jiménez', 'Andrés Nava', 'Camila Ríos',
  'Roberto Delgado', 'Ximena Flores', 'Luis Enrique Solís', 'Paola Vega',
  'Jorge Cruz', 'Daniela Paredes', 'Alberto Rivas', 'Gabriela Medina',
];

const estados = ['A Tiempo', 'A Tiempo', 'A Tiempo', 'A Tiempo', 'Retardo 5 min', 'Retardo 10 min', 'Retardo 15 min'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

function randomHoraEntrada() {
  const h = randInt(7, 9);
  const m = randInt(0, 59);
  const s = randInt(0, 59);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function randomHoraSalida(entrada) {
  const [h, m, s] = entrada.split(':').map(Number);
  const inicioMs = (h * 3600 + m * 60 + s) * 1000;
  const jornada = randInt(7, 10) * 3600 * 1000;
  const salidaMs = inicioMs + jornada;
  const fecha = new Date(salidaMs);
  return `${pad(fecha.getUTCHours())}:${pad(fecha.getUTCMinutes())}:${pad(fecha.getUTCSeconds())}`;
}

function randomFecha(base) {
  const d = new Date(base);
  d.setDate(d.getDate() + randInt(0, 60));
  return d.toISOString().split('T')[0];
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const baseDate = new Date('2026-03-01');
const asistenciasMock = [];

for (let i = 1; i <= 150; i++) {
  const nombre = pick(nombresEmpleados);
  const empleadoId = randInt(21, 70);
  const entrada = randomHoraEntrada();
  const salida = Math.random() > 0.08 ? randomHoraSalida(entrada) : null;
  const estado = entrada.startsWith('0') || entrada.startsWith('0')
    ? pick(estados)
    : entrada >= '09' && entrada <= '09'
      ? pick(estados)
      : entrada > '09:00:00'
        ? pick(estados.slice(1))
        : pick(estados);

  const estadoFinal = entrada <= '09:00:00'
    ? pick(['A Tiempo', 'A Tiempo', 'A Tiempo'])
    : pick(['Retardo 5 min', 'Retardo 10 min', 'Retardo 15 min']);

  asistenciasMock.push({
    idAsistencia: i,
    nombre_empleado: nombre,
    empleado: empleadoId,
    fecha: randomFecha(baseDate),
    hora_entrada: entrada,
    hora_salida: salida,
    estado: estadoFinal,
  });
}

export default asistenciasMock;
