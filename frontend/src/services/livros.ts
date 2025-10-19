import api from "./api";
import type { Livro } from "../types/Livro";

export async function listarLivros(): Promise<Livro[]> {
  const { data } = await api.get<Livro[]>("/livros");
  return data;
}

export async function buscarLivro(id: number): Promise<Livro> {
  const { data } = await api.get<Livro>(`/livros/${id}`);
  return data;
}

export async function criarLivro(payload: Omit<Livro, "id">): Promise<Livro> {
  const { data } = await api.post<Livro>("/livros", payload);
  return data;
}

export async function atualizarLivro(id: number, patch: Partial<Livro>): Promise<Livro> {
  const { data } = await api.put<Livro>(`/livros/${id}`, patch);
  return data;
}

export async function excluirLivro(id: number): Promise<void> {
  await api.delete(`/livros/${id}`);
}
