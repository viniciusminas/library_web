export interface Multa {
  id?: number;
  pessoa?: { id?: number; nome?: string };
  reserva?: { id?: number; livro?: { titulo?: string } } | null;
  valor: number;
  descricao?: string;
  dataMulta: string;
  pago: boolean;
}
