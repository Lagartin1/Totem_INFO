import { useEffect, useState } from "react";
import Headers from "../Components/Header";
import CardBecados from "../Components/CardBecados";
import Search_Bar from "../Components/Search_Bar";

interface Becado {
  id: number;
  nombre: string;
  titulo: string;
  descripcion: string;
}

function Becados() {
  const [becados, setBecados] = useState<Becado[]>([]);
  const [filtered, setFiltered] = useState<Becado[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/becados")
      .then(res => res.json())
      .then((data: Becado[]) => {
        setBecados(data);
        setFiltered(data);
      });
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFiltered(becados);
    } else {
      setFiltered(
        becados.filter(b =>
          b.nombre.toLowerCase().includes(query.toLowerCase()) ||
          b.titulo.toLowerCase().includes(query.toLowerCase()) ||
          b.descripcion.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col bg-white-500">
      <Headers />
      <div className="flex flex-col p-10 gap-10 items-center">
        <Search_Bar onSearch={handleSearch} />
        {filtered.map(b => (
          <CardBecados
            key={b.id}
            Name={b.nombre}
            Title={b.titulo}
            Tease={b.descripcion}
          />
        ))}
      </div>
    </main>
  );
}

export default Becados;
