export default function Home(){
  const bg = `${process.env.PUBLIC_URL}/hero.png`; 

  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10,12,18,.7), rgba(10,12,18,.8)), url(${bg})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="hero-card">
          <h1>Raccoon Books</h1>
          <p>O conhecimento é a arma mais poderosa. Sua biblioteca, segura e eficiente.</p>
        </div>
      </section>

      <div className="container">
        <div className="card">
          <h2 style={{marginTop:0}}>Comece por aqui</h2>
          <p>Use o menu acima para acessar os módulos: Pessoas, Livros, Reservas e Multas.</p>
        </div>
      </div>
    </>
  );
}
