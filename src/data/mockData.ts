
import { Book, Genre, User } from "@/types";

export const genres: Genre[] = [
  { id: "g1", name: "Fiction" },
  { id: "g2", name: "Science Fiction" },
  { id: "g3", name: "Fantasy" },
  { id: "g4", name: "Mystery" },
  { id: "g5", name: "Thriller" },
  { id: "g6", name: "Romance" },
  { id: "g7", name: "Non-Fiction" },
  { id: "g8", name: "Biography" },
  { id: "g9", name: "History" },
  { id: "g10", name: "Self-Help" },
  { id: "g11", name: "Young Adult" },
  { id: "g12", name: "Children's" }
];

export const books: Book[] = [
  {
    id: "b1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    genre: [genres[0], genres[2]],
    rating: 4.5,
    year: 2020,
    reviews: [
      {
        id: "r1",
        userId: "u1",
        userName: "BookLover42",
        text: "A beautiful story about the infinite possibilities of life and the importance of perspective.",
        rating: 5,
        date: "2023-01-15"
      }
    ],
    amazonLink: "https://www.amazon.com/Midnight-Library-Matt-Haig/dp/0525559477"
  },
  {
    id: "b2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://m.media-amazon.com/images/I/91vS2L5YfEL._AC_UF1000,1000_QL80_.jpg",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.",
    genre: [genres[1]],
    rating: 4.8,
    year: 2021,
    reviews: [
      {
        id: "r2",
        userId: "u2",
        userName: "SciFiEnthusiast",
        text: "Perfect blend of scientific accuracy and engaging storytelling.",
        rating: 5,
        date: "2023-02-20"
      }
    ],
    amazonLink: "https://www.amazon.com/Project-Hail-Mary-Andy-Weir/dp/0593135202"
  },
  {
    id: "b3",
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    cover: "https://m.media-amazon.com/images/I/91dB+v9gSWL._AC_UF1000,1000_QL80_.jpg",
    description: "A magical island. A dangerous task. A burning secret.",
    genre: [genres[2], genres[0]],
    rating: 4.7,
    year: 2020,
    reviews: [
      {
        id: "r3",
        userId: "u3",
        userName: "FantasyReader",
        text: "A heartwarming, enchanting story that's like a warm hug in book form.",
        rating: 5,
        date: "2023-03-10"
      }
    ],
    amazonLink: "https://www.amazon.com/House-Cerulean-Sea-TJ-Klune/dp/1250217288"
  },
  {
    id: "b4",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    cover: "https://m.media-amazon.com/images/I/91lslnZ-btL._AC_UF1000,1000_QL80_.jpg",
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    genre: [genres[3], genres[4]],
    rating: 4.6,
    year: 2019,
    reviews: [
      {
        id: "r4",
        userId: "u4",
        userName: "ThrillerFan",
        text: "The twist at the end blew my mind! Couldn't put it down.",
        rating: 5,
        date: "2023-04-05"
      }
    ],
    amazonLink: "https://www.amazon.com/Silent-Patient-Alex-Michaelides/dp/1250301696"
  },
  {
    id: "b5",
    title: "Red, White & Royal Blue",
    author: "Casey McQuiston",
    cover: "https://m.media-amazon.com/images/I/810UwLDTi+L._AC_UF1000,1000_QL80_.jpg",
    description: "What happens when America's First Son falls in love with the Prince of Wales?",
    genre: [genres[5], genres[0]],
    rating: 4.5,
    year: 2019,
    reviews: [
      {
        id: "r5",
        userId: "u5",
        userName: "RomanceReader",
        text: "This book made me laugh, cry, and swoon. Absolutely perfect!",
        rating: 5,
        date: "2023-05-12"
      }
    ],
    amazonLink: "https://www.amazon.com/Red-White-Royal-Blue-Novel/dp/1250316774"
  },
  {
    id: "b6",
    title: "Educated",
    author: "Tara Westover",
    cover: "https://m.media-amazon.com/images/I/91t3vHyKFNL._AC_UF1000,1000_QL80_.jpg",
    description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    genre: [genres[6], genres[7]],
    rating: 4.7,
    year: 2018,
    reviews: [
      {
        id: "r6",
        userId: "u6",
        userName: "MemoirLover",
        text: "A testament to the power of education and self-invention.",
        rating: 5,
        date: "2023-06-18"
      }
    ],
    amazonLink: "https://www.amazon.com/Educated-Memoir-Tara-Westover/dp/0399590501"
  },
  {
    id: "b7",
    title: "The Four Winds",
    author: "Kristin Hannah",
    cover: "https://m.media-amazon.com/images/I/91m+V0hUzVL._AC_UF1000,1000_QL80_.jpg",
    description: "Texas, 1934. Millions are out of work and a drought has broken the Great Plains. Farmers are fighting to keep their land and their livelihoods as the crops are failing, the water is drying up, and dust threatens to bury them all.",
    genre: [genres[0], genres[8]],
    rating: 4.5,
    year: 2021,
    reviews: [
      {
        id: "r7",
        userId: "u7",
        userName: "HistoryBuff",
        text: "A powerful, heartbreaking testament to both the resilience of the human spirit and the terrible cost of that resilience.",
        rating: 4,
        date: "2023-07-22"
      }
    ],
    amazonLink: "https://www.amazon.com/Four-Winds-Novel-Kristin-Hannah/dp/1250178606"
  },
  {
    id: "b8",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    genre: [genres[9], genres[6]],
    rating: 4.8,
    year: 2018,
    reviews: [
      {
        id: "r8",
        userId: "u8",
        userName: "SelfImprover",
        text: "Changed my approach to building habits and achieving goals. Practical and impactful.",
        rating: 5,
        date: "2023-08-30"
      }
    ],
    amazonLink: "https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299"
  },
  {
    id: "b9",
    title: "Six of Crows",
    author: "Leigh Bardugo",
    cover: "https://m.media-amazon.com/images/I/91tK6gJu7XL._AC_UF1000,1000_QL80_.jpg",
    description: "Six dangerous outcasts. One impossible heist.",
    genre: [genres[10], genres[2]],
    rating: 4.7,
    year: 2015,
    reviews: [
      {
        id: "r9",
        userId: "u9",
        userName: "YAFanatic",
        text: "Complex characters, intricate plot, and a richly developed world. A masterpiece!",
        rating: 5,
        date: "2023-09-15"
      }
    ],
    amazonLink: "https://www.amazon.com/Six-Crows-Leigh-Bardugo/dp/1250076961"
  },
  {
    id: "b10",
    title: "The Very Hungry Caterpillar",
    author: "Eric Carle",
    cover: "https://m.media-amazon.com/images/I/91AQs6qv9ML._AC_UF1000,1000_QL80_.jpg",
    description: "Follow the caterpillar's journey from a tiny egg to a beautiful butterfly.",
    genre: [genres[11]],
    rating: 4.9,
    year: 1969,
    reviews: [
      {
        id: "r10",
        userId: "u10",
        userName: "ParentReader",
        text: "A classic that my children ask for again and again.",
        rating: 5,
        date: "2023-10-05"
      }
    ],
    amazonLink: "https://www.amazon.com/Very-Hungry-Caterpillar-Eric-Carle/dp/0399226907"
  },
  {
    id: "b11",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    cover: "https://m.media-amazon.com/images/I/81O1oy0y9eL._AC_UF1000,1000_QL80_.jpg",
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast.",
    genre: [genres[0], genres[3]],
    rating: 4.7,
    year: 2018,
    reviews: [
      {
        id: "r11",
        userId: "u11",
        userName: "NatureLover",
        text: "Beautiful prose and a captivating story that stays with you long after you finish.",
        rating: 5,
        date: "2023-11-12"
      }
    ],
    amazonLink: "https://www.amazon.com/Where-Crawdads-Sing-Delia-Owens/dp/0735219095"
  },
  {
    id: "b12",
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    cover: "https://m.media-amazon.com/images/I/81RmxnQZFVL._AC_UF1000,1000_QL80_.jpg",
    description: "A life no one will remember. A story you will never forget.",
    genre: [genres[0], genres[2]],
    rating: 4.6,
    year: 2020,
    reviews: [
      {
        id: "r12",
        userId: "u12",
        userName: "FantasyLover",
        text: "A haunting, beautiful tale about the joy and tragedy of a life lived in the shadows.",
        rating: 5,
        date: "2023-12-20"
      }
    ],
    amazonLink: "https://www.amazon.com/Invisible-Life-Addie-LaRue/dp/0765387565"
  }
];

export const topReadsThisMonth = [
  books[0], // The Midnight Library
  books[1], // Project Hail Mary
  books[3], // The Silent Patient
  books[7], // Atomic Habits
  books[11] // The Invisible Life of Addie LaRue
];

export const recommendedForYou = [
  books[2], // The House in the Cerulean Sea
  books[8], // Six of Crows
  books[4], // Red, White & Royal Blue
  books[10] // Where the Crawdads Sing
];

export const users: User[] = [
  {
    id: "u1",
    name: "BookExplorer",
    avatar: "https://i.pravatar.cc/150?img=1",
    favoriteGenres: ["g1", "g2", "g3"],
    bookList: ["b1", "b2", "b9"]
  }
];

// Currently logged in user (mock)
export const currentUser = users[0];
