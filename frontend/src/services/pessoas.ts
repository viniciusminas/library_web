import api from "./api";
import type { Pessoa } from "../types/Pessoa";

export async function listar(): Promise<Pessoa[]> {
  const { data } = await api.get<Pessoa[]>("/pessoas");
  return data;
}

// extras (caso alguma outra tela use)
export async function buscarPessoa(id: number): Promise<Pessoa> {
  const { data } = await api.get<Pessoa>(`/pessoas/${id}`);
  return data;
}
export async function criarPessoa(payload: Partial<Pessoa>): Promise<Pessoa> {
  const { data } = await api.post<Pessoa>("/pessoas", payload);
  return data;
}
export async function atualizarPessoa(id: number, payload: Partial<Pessoa>): Promise<Pessoa> {
  const { data } = await api.put<Pessoa>(`/pessoas/${id}`, payload);
  return data;
}
export async function excluirPessoa(id: number): Promise<void> {
  await api.delete(`/pessoas/${id}`);
}

/* aliases para não quebrar imports antigos */
export const listarPessoas = listar;
export const list = listar;
