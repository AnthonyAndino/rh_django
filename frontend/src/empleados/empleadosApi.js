// API service layer — centralized axios functions for all backend endpoints.
// Computes the API root from config.js urlBase.
// Supports FormData for file uploads (multipart) on create/update.

import axios from 'axios'
import { urlBase } from '../config'

const apiRoot = urlBase.substring(0, urlBase.lastIndexOf('/api/'))


// ─── EMPLEADOS ────────────────────────────────────────────────────────────────

export function obtenerEmpleados() {
    return axios.get(`${apiRoot}/api/empleados`)
}

export function obtenerEmpleado(idEmpleado) {
    return axios.get(`${apiRoot}/api/empleados/${idEmpleado}`)
}

export function crearEmpleado(empleadoData) {
    const isForm = empleadoData instanceof FormData
    return axios.post(`${apiRoot}/api/empleados`, empleadoData, {
        headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {}
    })
}

export function actualizarEmpleado(idEmpleado, empleadoData) {
    const isForm = empleadoData instanceof FormData
    return axios.patch(`${apiRoot}/api/empleados/${idEmpleado}`, empleadoData, {
        headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {}
    })
}

export function eliminarEmpleado(idEmpleado) {
    return axios.delete(`${apiRoot}/api/empleados/${idEmpleado}`)
}


// ─── ASISTENCIAS ──────────────────────────────────────────────────────────────

export function obtenerAsistencias({ empleado_id, fecha_inicio, fecha_fin } = {}) {
    const params = new URLSearchParams()
    if (empleado_id) params.append('empleado_id', empleado_id)
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio)
    if (fecha_fin)    params.append('fecha_fin', fecha_fin)
    const query = params.toString() ? `?${params.toString()}` : ''
    return axios.get(`${apiRoot}/api/asistencias${query}`)
}

export function registrarEntrada(datos) {
    return axios.post(`${apiRoot}/api/asistencias`, datos)
}

export function registrarSalida(idAsistencia, horaSalida) {
    return axios.patch(`${apiRoot}/api/asistencias/${idAsistencia}`, {
        hora_salida: horaSalida
    })
}


// ─── NÓMINAS ──────────────────────────────────────────────────────────────────

export function obtenerNominas() {
    return axios.get(`${apiRoot}/api/nominas`)
}

export function generarNominaMensual(fecha_pago) {
    return axios.post(`${apiRoot}/api/nominas`, { fecha_pago })
}


// ─── CONFIGURACIÓN DE NÓMINA ──────────────────────────────────────────────────

export function obtenerConfiguracionNomina() {
    return axios.get(`${apiRoot}/api/configuracion-nomina`)
}

export function guardarConfiguracionNomina(config) {
    return axios.post(`${apiRoot}/api/configuracion-nomina`, config)
}


// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export function obtenerDashboard() {
    return axios.get(`${apiRoot}/api/dashboard`)
}