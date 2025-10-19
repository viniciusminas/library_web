import type { Livro } from "./Livro";
import type { Pessoa } from "./Pessoa";

export interface ReservaDTO {
  pessoaId: number;
  livroId: number;
}

export interface Reserva {
  id?: number;
  dataIni?: string;          
  dataFim?: string | null; 
  livro?: Livro | null;
  pessoa?: Pessoa | null;
}
