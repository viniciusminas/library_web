import type { Livro } from "./Livro";
import type { Pessoa } from "./Pessoa";

export interface ReservaDTO {
  pessoaId: number;
  livroId: number;
}

export interface Reserva {
  id?: number;
  dataIni?: string;           // ISO
  dataFim?: string | null;    // devolvida = ISO; em aberto = null
  livro?: Livro | null;
  pessoa?: Pessoa | null;
}
