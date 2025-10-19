import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarReserva } from "../../services/reservas";
import { listarLivros } from "../../services/livros";
import * as PessoasAPI from "../../services/pessoas";

const schema = z.object({
  pessoaId: z.string().min(1, "Selecione a pessoa"),
  livroId: z.string().min(1, "Selecione o livro"),
});
type FormData = z.infer<typeof schema>;

export default function ReservasCadastrar() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const [pessoas, setPessoas] = useState<any[]>([]);
  const [livros, setLivros]   = useState<any[]>([]);
  const livrosDisponiveis = useMemo(() => livros.filter((l:any) => !l.reservado), [livros]);

  useEffect(() => {
    (async () => {
      const [p, l] = await Promise.all([
        PessoasAPI.listar(), 
        listarLivros(),
      ]);
      setPessoas(p);
      setLivros(l);
    })();
  }, []);

  const onSubmit = async (data: FormData) => {
    await criarReserva({
      pessoaId: Number(data.pessoaId),
      livroId: Number(data.livroId),
    });
    reset();
    alert("Reserva criada!");
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ marginTop: 0 }}>Nova reserva</h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
          <label>Pessoa
            <select className="input" {...register("pessoaId")}>
              <option value="">Selecione</option>
              {pessoas.map((p:any) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {!!errors.pessoaId?.message && <small className="help">{String(errors.pessoaId.message)}</small>}
          </label>

          <label>Livro (apenas disponíveis)
            <select className="input" {...register("livroId")}>
              <option value="">Selecione</option>
              {livrosDisponiveis.map((l:any) => (
                <option key={l.id} value={l.id}>{l.titulo}</option>
              ))}
            </select>
            {!!errors.livroId?.message && <small className="help">{String(errors.livroId.message)}</small>}
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => reset()}>Limpar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
