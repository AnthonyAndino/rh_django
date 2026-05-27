// Mock data — generates 50 synthetic employees for frontend development.
// Used as fallback until the backend API is available.
const nombres = [
  'Carlos Mendoza', 'María González', 'José Hernández', 'Ana Lucía Torres',
  'David Castillo', 'Sofía Ramírez', 'Miguel Ángel Ruiz', 'Valentina Paz',
  'Fernando Ortega', 'Regina Jiménez', 'Andrés Nava', 'Camila Ríos',
  'Roberto Delgado', 'Ximena Flores', 'Luis Enrique Solís', 'Paola Vega',
  'Jorge Cruz', 'Daniela Paredes', 'Alberto Rivas', 'Gabriela Medina',
  'Rafael Herrera', 'Isabella Campos', 'Sergio Aguilar', 'Renata Luna',
  'Humberto León', 'Mariana Acosta', 'Óscar Rosas', 'Fernanda Meza',
  'Emilio Cárdenas', 'Alejandra Quiroz', 'Patricio Salazar', 'Julieta Rangel',
  'Héctor Muñoz', 'Liliana Zavala', 'Arturo Espinoza', 'Diana Villalobos',
  'Gerardo Navarro', 'Monserrat Téllez', 'Eduardo Márquez', 'Carolina Correa',
  'Raúl Miranda', 'Vanessa Guerrero', 'Joaquín Ponce', 'Rebeca Toledo',
  'Ignacio Fuentes', 'Paulina Aguirre', 'Felipe Arellano', 'Adriana Benítez',
  'Manuel Barajas', 'Lorena Cervantes',
];

const puestos = [
  'Desarrollador Senior', 'Desarrollador Full Stack', 'Desarrollador Frontend',
  'Desarrollador Backend', 'Ingeniero de Datos', 'Data Analyst',
  'DevOps Engineer', 'Arquitecto de Software', 'QA Engineer',
  'CTO', 'Líder Técnico', 'Scrum Master',
  'Contador General', 'Contador de Costos', 'Analista Financiero',
  'Director Financiero', 'Auditor Interno', 'Tesorero',
  'Ejecutivo de Ventas', 'Gerente Comercial', 'Ejecutivo de Cuenta',
  'Director Comercial', 'Analista de Mercadotecnia', 'Community Manager',
  'Recepcionista', 'Asistente Administrativo', 'Coordinador de RH',
  'Director de RH', 'Analista de RH', 'Reclutador Senior',
  'Abogado Corporativo', 'Consultor Legal', 'Relaciones Públicas',
  'Diseñador UX/UI', 'Diseñador Gráfico', 'Project Manager',
  'Business Analyst', 'Customer Success', 'Soporte Técnico N2',
  'Coordinador de Operaciones', 'Analista de Logística', 'Comprador',
  'Ingeniero Industrial', 'Supervisor de Planta', 'Jefe de Turno',
  'Marketing Manager', 'Content Creator', 'Especialista SEO',
  'Analista de Riesgos', 'Coordinador de Calidad',
];

const departamentos = [
  'Tecnología', 'Contabilidad', 'Ventas', 'Recursos Humanos',
  'Mercadotecnia', 'Legal', 'Operaciones', 'Dirección General',
  'Diseño', 'Logística', 'Calidad', 'Finanzas',
];

const estatus = ['Activo', 'Activo', 'Activo', 'Activo', 'Inactivo', 'Suspendido'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function generarCorreo(nombre) {
  const partes = nombre.toLowerCase().split(' ');
  const nombreParte = partes[0];
  const apellidoParte = partes[partes.length - 1];
  return `${nombreParte}.${apellidoParte}@rhmanager.com`;
}

const empleadosMock = Array.from({ length: 50 }, (_, i) => ({
  idEmpleado: i + 21,
  nombre: nombres[i],
  puesto: puestos[i % puestos.length],
  departamento: departamentos[i % departamentos.length],
  sueldo: randInt(12, 75) * 1000 + 500,
  estatus: pick(estatus),
  correo_corporativo: generarCorreo(nombres[i]),
  foto_perfil: null,
}));

export default empleadosMock;
