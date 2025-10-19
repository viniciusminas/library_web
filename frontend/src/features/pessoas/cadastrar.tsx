import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarPessoa } from "../../services/pessoas";
import { Pessoa } from "../../types/Pessoa";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  tel: z.string().optional(),
  endereco: z.string().min(3, "Endereço é obrigatório"),
});
type FormData = z.infer<typeof schema>;

export default function PessoasCadastrar(){
  const nav = useNavigate();
  const { register, handleSubmit, reset, formState:{errors, isSubmitting} } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData){
    const payload: Omit<Pessoa,"id"> = {
      nome: data.nome,
      email: data.email,
      endereco: data.endereco,
      tel: data.tel?.trim() ? data.tel : undefined,
    };
    await criarPessoa(payload);
    reset();
    // opcional: ir direto pra consulta
    nav("/pessoas/consultar");
  }

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Cadastro de Usuários</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{
        display:"grid", gap:14, gridTemplateColumns:"1fr 1fr", alignItems:"start"
      }}>
        <label>Nome completo
          <input className="input" {...register("nome")} placeholder="Ex.: Jill Valentine"/>
          {!!errors.nome?.message && <small className="help">{String(errors.nome.message)}</small>}
        </label>
        <label>E-mail
          <input className="input" type="email" {...register("email")} placeholder="jill@raccoon.edu"/>
          {!!errors.email?.message && <small className="help">{String(errors.email.message)}</small>}
        </label>
        <label>Telefone (opcional)
          <input className="input" {...register("tel")} placeholder="(11) 99999-9999"/>
          {!!errors.tel?.message && <small className="help">{String(errors.tel.message)}</small>}
        </label>
        <label>Endereço
          <input className="input" {...register("endereco")} placeholder="Rua dos Governadores, 525"/>
          {!!errors.endereco?.message && <small className="help">{String(errors.endereco.message)}</small>}
        </label>
        <div style={{gridColumn:"1 / -1"}}>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => reset()} style={{marginLeft:8}}>
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}
