import api from "../../services/api";
import { Livro } from "./types";

export const LivrosAPI = {
  list: async (): Promise<Livro[]> => {
    const { data } = await api.get("/livros");
    return data;
  },
  get: async (id: number): Promise<Livro> => {
    const { data } = await api.get(`/livros/${id}`);
    return data;
  },
  create: async (payload: Omit<Livro, "id">): Promise<Livro> => {
    const { data } = await api.post("/livros", payload);
    return data;
  },
  update: async (id: number, payload: Partial<Livro>): Promise<Livro> => {
    const { data } = await api.put(`/livros/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/livros/${id}`);
  },
};
