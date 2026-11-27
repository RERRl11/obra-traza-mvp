export function partidaTieneMetradoInconsistente(item) {
  const contratado = Number(item?.metradoContratado ?? 0);
  const programado = Number(item?.metradoProgramado ?? 0);
  const ejecutado = Number(item?.metradoEjecutado ?? 0);
  return !Number.isFinite(contratado) ||
    !Number.isFinite(programado) ||
    !Number.isFinite(ejecutado) ||
    contratado < 0 ||
    programado < 0 ||
    ejecutado < 0 ||
    programado > contratado ||
    ejecutado > contratado;
}

export function calcularAvanceFisico(partidas) {
  const items = Array.isArray(partidas) ? partidas : [];
  const metradoInconsistente = items.some(partidaTieneMetradoInconsistente);
  const metradoContratado = items.reduce((total, item) => total + Number(item.metradoContratado || 0), 0);
  const metradoEjecutado = items.reduce((total, item) => total + Number(item.metradoEjecutado || 0), 0);
  const avance = metradoContratado > 0 && !metradoInconsistente
    ? (metradoEjecutado / metradoContratado) * 100
    : null;

  return { avance, metradoContratado, metradoEjecutado, metradoInconsistente };
}
