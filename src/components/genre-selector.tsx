
import { useState } from "react";
import { genres } from "@/data/mockData";
import { ChevronDown } from "lucide-react";

interface GenreSelectorProps {
  onSelect: (genreId: string) => void;
  selectedGenreId?: string;
}

export function GenreSelector({ onSelect, selectedGenreId }: GenreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedGenre = selectedGenreId 
    ? genres.find(g => g.id === selectedGenreId) 
    : undefined;
    
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelect = (genreId: string) => {
    onSelect(genreId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-700 text-sm"
      >
        <span>{selectedGenre ? selectedGenre.name : "Select Genre"}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleSelect(genre.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedGenreId === genre.id ? "bg-book-purple/10 text-book-purple-dark font-medium" : "text-gray-700"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
