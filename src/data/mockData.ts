import { Book } from "@/types";

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
    description: "Between life and death there is a library, and within that library, the shelves go on forever.",
    genre: ["Fiction", "Philosophy"],
    rating: 4.5,
    year: 2020,
    amazonLink: "https://www.amazon.com/Midnight-Library-Matt-Haig/dp/0525559477"
  },
  {
    id: "2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://m.media-amazon.com/images/I/91vS2L5YfEL._AC_UF1000,1000_QL80_.jpg",
    description: "A lone astronaut must save humanity in this gripping science fiction thriller.",
    genre: ["Science Fiction"],
    rating: 4.8,
    year: 2021,
    amazonLink: "https://www.amazon.com/Project-Hail-Mary-Andy-Weir/dp/0593135202"
  },
  {
    id: "3",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "https://m.media-amazon.com/images/I/81UUfhLr6BL._AC_UF1000,1000_QL80_.jpg",
    description: "A reclusive Hollywood icon finally tells her story to an unknown journalist.",
    genre: ["Fiction", "Romance"],
    rating: 4.7,
    year: 2017,
    amazonLink: "https://www.amazon.com/Seven-Husbands-Evelyn-Hugo-Novel/dp/1501161938"
  }
];

export const genres = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Biography",
  "History",
  "Self-Help"
];