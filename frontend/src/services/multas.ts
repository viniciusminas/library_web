import api from "./api";
import type { Multa } from "../types/Multa";

/** payload para criar/atualizar multa */
export interface NovaMulta {
  pessoaId: number;
  reservaId?: number;
  valor: number;
  descricao: string;
  dataMulta: string;  
  pago: boolean;
}

/** lista todas as multas */
export async function listarMultas(): Promise<Multa[]> {
  const { data } = await api.get<Multa[]>("/multas");
  return data;
}

/** cria multa */
export async function criarMulta(payload: NovaMulta): Promise<Multa> {
  const { data } = await api.post<Multa>("/multas", payload);
  return data;
}

/** atualiza multa se necessario*/
export async function atualizarMulta(
  id: number,
  patch: Partial<NovaMulta>
): Promise<Multa> {
  const { data } = await api.put<Multa>(`/multas/${id}`, patch);
  return data;
}

/** remove multa */
export async function removerMulta(id: number): Promise<void> {
  await api.delete(`/multas/${id}`);
}

/* Aliases opcionais */
export const list   = listarMultas;
export const create = criarMulta;
export const update = atualizarMulta;
export const remove = removerMulta;
