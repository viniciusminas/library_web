import api from "./api";

export interface ReservaDTO {
  pessoaId: number;
  livroId: number;
}

export interface Reserva {
  id?: number;
  dataIni?: string;
  dataFim?: string | null;
  pessoa?: { id?: number; nome?: string };
  livro?: { id?: number; titulo?: string; reservado?: boolean };
}

export async function listar(): Promise<Reserva[]> {
  const { data } = await api.get<Reserva[]>("/reservas");
  return data;
}

export async function criarReserva(payload: ReservaDTO): Promise<Reserva> {
  // Spring espera JSON puro em /reservas
  const { data } = await api.post<Reserva>("/reservas", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function devolver(id: number): Promise<void> {
  await api.put(`/reservas/${id}/devolver`);
}

export async function cancelar(id: number): Promise<void> {
  await api.delete(`/reservas/${id}`);
}
