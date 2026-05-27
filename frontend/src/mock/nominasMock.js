// Mock data — generates 120 synthetic payroll records for frontend development.
// Each record has randomized base salary (14k-72k), deductions (8-18%), and bonuses.
const nombresEmpleados = [
  'Carlos Mendoza', 'María González', 'José Hernández', 'Ana Lucía Torres',
  'David Castillo', 'Sofía Ramírez', 'Miguel Ángel Ruiz', 'Valentina Paz',
  'Fernando Ortega', 'Regina Jiménez', 'Andrés Nava', 'Camila Ríos',
  'Roberto Delgado', 'Ximena Flores', 'Luis Enrique Solís', 'Paola Vega',
  'Jorge Cruz', 'Daniela Paredes', 'Alberto Rivas', 'Gabriela Medina',
  'Rafael Herrera', 'Isabella Campos', 'Sergio Aguilar', 'Renata Luna',
  'Humberto León', 'Mariana Acosta', 'Óscar Rosas', 'Fernanda Meza',
  'Emilio Cárdenas', 'Alejandra Quiroz',
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

function randomFechaPago() {
  const mes = randInt(1, 12);
  const dia = randInt(1, 28);
  return `2026-${pad(mes)}-${pad(dia)}`;
}

const nominasMock = [];

for (let i = 1; i <= 120; i++) {
  const sueldoBase = randInt(14, 72) * 1000 + randInt(0, 99) * 10;
  const deduccionPorcentaje = randInt(8, 18) / 100;
  const deducciones = Math.round(sueldoBase * deduccionPorcentaje * 100) / 100;
  const bonos = randInt(0, 2) === 0 ? 0 : randInt(80, 250);
  const sueldoNeto = Math.round((sueldoBase - deducciones + bonos) * 100) / 100;

  nominasMock.push({
    idNomina: i,
    nombre_empleado: pick(nombresEmpleados),
    fecha_pago: randomFechaPago(),
    sueldo_base: sueldoBase,
    deducciones: deducciones,
    bonos: bonos,
    sueldo_neto: sueldoNeto,
  });
}

export default nominasMock;
