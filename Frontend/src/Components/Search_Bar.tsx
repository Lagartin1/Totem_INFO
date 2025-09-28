import React,{ useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

function Search_Bar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm); // <-- asegúrate de pasar searchTerm aquí
  };

  return (
    <div className="flex justify-center mb-8">
      <form onSubmit={onSubmit} className="relative w-full max-w-md bg-white rounded-md">
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-2.5 w-5 h-5 text-gray-500 hover:text-blue-500"
        >
          🔍
        </button>
      </form>
    </div>
  );
}

export default Search_Bar;
