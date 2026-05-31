// Dictionary of words for simulated players (bots)
// Keyed by language -> category -> letter (uppercase)

export const BOT_DICTIONARY_ES: Record<string, Record<string, string[]>> = {
  "Nombre": {
    "A": ["Alex", "Andres", "Ana", "Alberto", "Alicia"],
    "B": ["Bruno", "Beatriz", "Belen", "Benjamin", "Bernardo"],
    "C": ["Carlos", "Camila", "Carmen", "Cesar", "Clara"],
    "D": ["Daniel", "Diego", "Diana", "David", "Dolores"],
    "E": ["Eduardo", "Elena", "Esteban", "Emilio", "Eva"],
    "F": ["Fernando", "Felipe", "Fabiola", "Francisco", "Fatima"],
    "G": ["Gabriel", "Gabriela", "Gerardo", "Gloria", "Guillermo"],
    "H": ["Hector", "Hugo", "Helena", "Hernan", "Hilda"],
    "I": ["Isabel", "Ivan", "Ignacio", "Irene", "Ines"],
    "J": ["Juan", "Jorge", "Jose", "Jaime", "Julia"],
    "L": ["Luis", "Laura", "Lucas", "Lucia", "Leonor"],
    "M": ["Manuel", "Maria", "Miguel", "Monica", "Mateo"],
    "N": ["Nicolas", "Natalia", "Nestor", "Noemi", "Nuria"],
    "O": ["Oscar", "Olivia", "Orlando", "Olga", "Omar"],
    "P": ["Pedro", "Pablo", "Patricia", "Pilar", "Paula"],
    "Q": ["Quintin", "Quique", "Queta"],
    "R": ["Ricardo", "Roberto", "Rosa", "Raul", "Raquel"],
    "S": ["Santiago", "Sofia", "Sebastian", "Sara", "Silvia"],
    "T": ["Tomas", "Teresa", "Tito", "Tatiana", "Tobias"],
    "U": ["Ulises", "Ursula", "Uriel"],
    "V": ["Victor", "Valeria", "Vicente", "Veronica", "Vanessa"]
  },
  "Animal": {
    "A": ["Águila", "Abeja", "Araña", "Antílope", "Ardilla"],
    "B": ["Búho", "Ballena", "Búfalo", "Burro", "Babuino"],
    "C": ["Caballo", "Canguro", "Cebra", "Camello", "Cocodrilo"],
    "D": ["Delfín", "Dromedario", "Dingo", "Dinosaurio"],
    "E": ["Elefante", "Erizo", "Escarabajo", "Esponja"],
    "F": ["Flamenco", "Foca", "Faisán", "Frigilio"],
    "G": ["Gato", "Gorila", "Gaviota", "Ganso", "Guepardo"],
    "H": ["Hiena", "Hipopótamo", "Hormiga", "Hámster"],
    "I": ["Iguana", "Impala", "Indri"],
    "J": ["Jirafa", "Jabalí", "Jaguar"],
    "L": ["León", "Lobo", "Loro", "Liebre", "Leopardo"],
    "M": ["Mono", "Mosca", "Murciélago", "Mariposa", "Medusa"],
    "N": ["Nutria", "Navaja", "Nécora"],
    "O": ["Oso", "Oveja", "Orca", "Orangután", "Ostras"],
    "P": ["Perro", "Pingüino", "Panda", "Pantera", "Paloma"],
    "Q": ["Quetzal", "Quirquincho"],
    "R": ["Rana", "Ratón", "Rinoceronte", "Reno"],
    "S": ["Salamandra", "Sapo", "Serpiente", "Sardina"],
    "T": ["Tigre", "Tiburón", "Tortuga", "Tucán"],
    "U": ["Urraca", "Unicornio", "Uapití"],
    "V": ["Vaca", "Víbora", "Vicuña", "Buitre"]
  },
  "Fruta/Verdura": {
    "A": ["Aguacate", "Arándano", "Ajo", "Albaricoque", "Apio"],
    "B": ["Berenjena", "Batata", "Brócoli", "Banana"],
    "C": ["Cereza", "Cebolla", "Coco", "Calabaza", "Ciruela"],
    "D": ["Durazno", "Dátil", "Damasco"],
    "E": ["Espinaca", "Ejote", "Endivia", "Escarola"],
    "F": ["Fresa", "Frambuesa", "Frutilla", "Fruta del dragón"],
    "G": ["Guanábana", "Garbanzo", "Granada", "Grosella"],
    "H": ["Higo", "Haba", "Hongo", "Huaya"],
    "I": ["Icaque", "Ilama"],
    "J": ["Jícama", "Jitomate", "Jengibre"],
    "L": ["Limón", "Lechuga", "Lima", "Lichi"],
    "M": ["Manzana", "Melón", "Mango", "Mandarina", "Mora"],
    "N": ["Naranja", "Nabo", "Nectarina", "Nopal"],
    "O": ["Okra", "Orégano", "Oliva"],
    "P": ["Pera", "Plátano", "Papa", "Pepino", "Piña"],
    "Q": ["Quimbombó", "Quinoa"],
    "R": ["Rábano", "Remolacha", "Repollo", "Rúcula"],
    "S": ["Sandía", "Setas", "Soya"],
    "T": ["Tomate", "Toronja", "Tamarindo", "Trigo"],
    "U": ["Uva", "Uva espina", "Uvilla"],
    "V": ["Vainita", "Vainilla"]
  },
  "País o Ciudad": {
    "A": ["Alemania", "Argentina", "Australia", "Acapulco", "Amsterdam"],
    "B": ["Brasil", "Bolivia", "Bogotá", "Barcelona", "Bélgica"],
    "C": ["Colombia", "Canadá", "Chile", "Caracas", "Cali"],
    "D": ["Dinamarca", "Dublín", "Detroit", "Doha"],
    "E": ["Ecuador", "España", "Egipto", "El Salvador", "Edimburgo"],
    "F": ["Francia", "Finlandia", "Florencia", "Filipinas"],
    "G": ["Guatemala", "Grecia", "Ginebra", "Guayaquil"],
    "H": ["Honduras", "Haití", "La Habana", "Houston", "Hanoi"],
    "I": ["Italia", "Irlanda", "India", "Irak", "Ibiza"],
    "J": ["Japón", "Jamaica", "Jordania", "Jerusalén"],
    "L": ["Lima", "Londres", "Lisboa", "Líbano", "Los Ángeles"],
    "M": ["México", "Madrid", "Miami", "Marruecos", "Medellín"],
    "N": ["Nicaragua", "Noruega", "Nueva York", "Niza"],
    "O": ["Oman", "Oslo", "Ottawa", "Oaxaca"],
    "P": ["Perú", "París", "Panamá", "Portugal", "Pekín"],
    "Q": ["Quito", "Qatar", "Québec", "Querétaro"],
    "R": ["Rusia", "Roma", "Río de Janeiro", "Rumanía"],
    "S": ["Suecia", "Suiza", "Santiago", "Sevilla", "Salvador"],
    "T": ["Turquía", "Tailandia", "Tegucigalpa", "Toronto", "Tokio"],
    "U": ["Uruguay", "Ucrania", "Ushuaia", "Utrecht"],
    "V": ["Venezuela", "Valencia", "Viena", "Vietnam", "Vaticano"]
  },
  "Cosa": {
    "A": ["Anillo", "Auto", "Abanico", "Almohada", "Aguja"],
    "B": ["Botella", "Bolígrafo", "Bolsa", "Balón", "Bote"],
    "C": ["Cuchara", "Cama", "Cuaderno", "Cable", "Celular"],
    "D": ["Dado", "Disco", "Dije", "Dentífrico", "Delantal"],
    "E": ["Espejo", "Escoba", "Escritorio", "Enchufe", "Espada"],
    "F": ["Florero", "Foco", "Filtro", "Flecha", "Folleto"],
    "G": ["Guitarra", "Goma", "Globo", "Gancho", "Gorra"],
    "H": ["Hilo", "Hoja", "Horno", "Hacha", "Hielo"],
    "I": ["Imán", "Impresora", "Inodoro", "Inflador"],
    "J": ["Jabón", "Jarrón", "Joya", "Juguete"],
    "L": ["Lápiz", "Libro", "Llave", "Lámpara", "Lentes"],
    "M": ["Mesa", "Mochila", "Martillo", "Maleta", "Microscopio"],
    "N": ["Naipes", "Navaja", "Nido", "Neumático"],
    "O": ["Olla", "Ordenador", "Oro", "Organo"],
    "P": ["Papel", "Peine", "Puerta", "Plato", "Paraguas"],
    "Q": ["Quitasol", "Químico", "Quena"],
    "R": ["Radio", "Reloj", "Regla", "Revista", "Rueda"],
    "S": ["Silla", "Sombrero", "Sobre", "Sábana", "Serrucho"],
    "T": ["Tijeras", "Teléfono", "Teclado", "Taza", "Toalla"],
    "U": ["Urna", "Ukelele", "Uña"],
    "V": ["Vaso", "Vela", "Ventana", "Ventilador", "Violín"]
  },
  "Color": {
    "A": ["Azul", "Amarillo", "Anaranjado", "Aqua", "Azabache"],
    "B": ["Blanco", "Beige", "Bainilla", "Burgundy", "Bronce"],
    "C": ["Café", "Celeste", "Carmesí", "Crema", "Cobre"],
    "D": ["Dorado", "Durazno", "Damasco"],
    "E": ["Esmeralda", "Escarlata", "Ebano"],
    "F": ["Fucsia", "Frambuesa", "Fuego"],
    "G": ["Gris", "Granate", "Ginda"],
    "H": ["Hueso", "Humo", "Herrumbre"],
    "I": ["Indigo", "Ivory"],
    "J": ["Jaspe", "Jade"],
    "L": ["Lila", "Limón", "Ladrillo"],
    "M": ["Marrón", "Morado", "Mostaza", "Magenta", "Menta"],
    "N": ["Negro", "Naranja", "Nácar", "Negruzco"],
    "O": ["Oro", "Ocre", "Oliva", "Opalo"],
    "P": ["Plata", "Púrpura", "Pardo", "Plomo", "Rosa Pastel"],
    "R": ["Rojo", "Rosa", "Rosado", "Rubí"],
    "S": ["Salmón", "Sepia", "Siena"],
    "T": ["Turquesa", "Terracota", "Turquí"],
    "U": ["Uva"],
    "V": ["Verde", "Violeta", "Verde oliva", "Vino"]
  }
};

export const BOT_DICTIONARY_EN: Record<string, Record<string, string[]>> = {
  "Name": {
    "A": ["Alice", "Andrew", "Amy", "Albert", "Alex"],
    "B": ["Benjamin", "Brian", "Bella", "Bob", "Bruce"],
    "C": ["Charlie", "Charlotte", "Cody", "Chris", "Claire"],
    "D": ["Daniel", "David", "Diana", "Dylan", "Daisy"],
    "E": ["Edward", "Emily", "Ethan", "Emma", "Eric"],
    "F": ["Frank", "Fiona", "Freddie", "Fay", "Felix"],
    "G": ["George", "Grace", "Gabriel", "Gavin", "Gemma"],
    "H": ["Harry", "Hannah", "Henry", "Hope", "Helen"],
    "I": ["Isaac", "Isabella", "Ian", "Irene", "Ivy"],
    "J": ["John", "Jack", "James", "Jessica", "Julia"],
    "L": ["Liam", "Lucy", "Luke", "Lily", "Leo"],
    "M": ["Michael", "Mary", "Matthew", "Mia", "Megan"],
    "N": ["Nathan", "Natalie", "Noah", "Nicole", "Nate"],
    "O": ["Oliver", "Olivia", "Oscar", "Owen", "Owen"],
    "P": ["Peter", "Penelope", "Philip", "Paige", "Paul"],
    "Q": ["Quentin", "Queenie", "Quinn"],
    "R": ["Robert", "Rose", "Ryan", "Rachel", "Richard"],
    "S": ["Samuel", "Sophia", "Stephen", "Sarah", "Sean"],
    "T": ["Thomas", "Teresa", "Tyler", "Taylor", "Toby"],
    "U": ["Uriah", "Ursula", "Ulysses"],
    "V": ["Victor", "Victoria", "Vincent", "Valerie", "Vince"]
  },
  "Animal": {
    "A": ["Alligator", "Ant", "Ape", "Albatross", "Antelope"],
    "B": ["Bear", "Bee", "Buffalo", "Butterfly", "Bat"],
    "C": ["Cat", "Camel", "Cheetah", "Chimpanzee", "Crocodile"],
    "D": ["Dog", "Dolphin", "Deer", "Donkey", "Duck"],
    "E": ["Elephant", "Eagle", "Eel", "Emu", "Elk"],
    "F": ["Fox", "Frog", "Flamingo", "Falcon", "Ferret"],
    "G": ["Giraffe", "Gorilla", "Goat", "Goldfish", "Goose"],
    "H": ["Horse", "Hippo", "Hyena", "Hamster", "Hawk"],
    "I": ["Iguana", "Impala", "Ibis"],
    "J": ["Jaguar", "Jellyfish", "Jackal"],
    "L": ["Lion", "Leopard", "Llama", "Lizard", "Lobster"],
    "M": ["Monkey", "Mouse", "Moose", "Mole", "Meerkat"],
    "N": ["Newt", "Nightingale", "Narwhal"],
    "O": ["Owl", "Octopus", "Ostrich", "Otter", "Oyster"],
    "P": ["Pig", "Panda", "Penguin", "Parrot", "Panther"],
    "Q": ["Quail", "Quokka"],
    "R": ["Rabbit", "Rat", "Rhino", "Raven", "Reindeer"],
    "S": ["Snake", "Shark", "Sheep", "Spider", "Squirrel"],
    "T": ["Tiger", "Turtle", "Turkey", "Toad", "Toucan"],
    "U": ["Unicorn", "Urial"],
    "V": ["Vulture", "Viper", "Vervet"]
  },
  "Fruit/Vegetable": {
    "A": ["Apple", "Avocado", "Asparagus", "Apricot", "Artichoke"],
    "B": ["Banana", "Blueberry", "Broccoli", "Beetroot", "Bean"],
    "C": ["Cherry", "Carrot", "Coconut", "Cucumber", "Cabbage"],
    "D": ["Date", "Durian", "Dill"],
    "E": ["Eggplant", "Elderberry", "Endive"],
    "F": ["Fig", "Fennel", "Feijoa"],
    "G": ["Grape", "Garlic", "Grapefruit", "Ginger", "Guava"],
    "H": ["Honeydew", "Hazelnut", "Huckleberry"],
    "I": ["Ivy Gourd", "Inca berry"],
    "J": ["Jackfruit", "Jalapeno", "Jicama"],
    "L": ["Lemon", "Lettuce", "Lime", "Leek", "Lychee"],
    "M": ["Mango", "Melon", "Mushroom", "Mulberry", "Mandarin"],
    "N": ["Nectarine", "Nutmeg", "Napa cabbage"],
    "O": ["Orange", "Onion", "Okra", "Olive"],
    "P": ["Pear", "Peach", "Plum", "Potato", "Pineapple"],
    "Q": ["Quince", "Quandong"],
    "R": ["Raspberry", "Radish", "Rhubarb", "Rosemary"],
    "S": ["Strawberry", "Spinach", "Sweet potato", "Squash"],
    "T": ["Tomato", "Turnip", "Tangerine", "Thyme"],
    "U": ["Ugli fruit"],
    "V": ["Vanilla bean", "Velvet bean"]
  },
  "Country/City": {
    "A": ["Argentina", "Austria", "Amsterdam", "Athens", "Australia"],
    "B": ["Brazil", "Belgium", "Berlin", "Boston", "Brussels"],
    "C": ["Canada", "China", "Colombia", "Chicago", "Cairo"],
    "D": ["Denmark", "Dublin", "Detroit", "Dallas", "Denver"],
    "E": ["Egypt", "Ecuador", "Edinburgh", "El Paso"],
    "F": ["France", "Finland", "Florence", "Frankfurt"],
    "G": ["Germany", "Greece", "Geneva", "Glasgow"],
    "H": ["Honduras", "Haiti", "Houston", "Hanoi", "Havana"],
    "I": ["Italy", "Ireland", "Iceland", "Indianapolis", "Istanbul"],
    "J": ["Japan", "Jamaica", "Jordan", "Jerusalem", "Jakarta"],
    "L": ["London", "Lima", "Lisbon", "Los Angeles", "Lebanon"],
    "M": ["Mexico", "Madrid", "Miami", "Manchester", "Melbourne"],
    "N": ["Norway", "Netherlands", "New York", "Nice", "Nairobi"],
    "O": ["Oman", "Oslo", "Ottawa", "Osaka"],
    "P": ["Peru", "Portugal", "Paris", "Prague", "Beijing"],
    "Q": ["Qatar", "Quebec", "Quito"],
    "R": ["Russia", "Rome", "Rio de Janeiro", "Romania", "Rotterdam"],
    "S": ["Sweden", "Switzerland", "Spain", "Sydney", "Singapore"],
    "T": ["Turkey", "Thailand", "Toronto", "Tokyo", "Taipei"],
    "U": ["Uruguay", "Ukraine", "Utrecht", "Utah"],
    "V": ["Venezuela", "Vienna", "Vancouver", "Vatican City", "Vietnam"]
  },
  "Object": {
    "A": ["Apple", "Anchor", "Axel", "Album", "Apron"],
    "B": ["Book", "Bottle", "Bag", "Ball", "Box"],
    "C": ["Chair", "Cup", "Cable", "Computer", "Camera"],
    "D": ["Desk", "Door", "Disk", "Doll", "Dice"],
    "E": ["Eraser", "Envelope", "Engine", "Earring"],
    "F": ["Fan", "Fork", "Frame", "Folder", "File"],
    "G": ["Glass", "Guitar", "Glove", "Glue", "Gear"],
    "H": ["Hammer", "Hat", "Hose", "Hook", "Helmet"],
    "I": ["Ink", "Iron", "Instrument", "Image"],
    "J": ["Jar", "Jewel", "Jacket", "Journal"],
    "L": ["Lamp", "Laptop", "Lock", "Leaf", "Ladder"],
    "M": ["Map", "Mirror", "Marker", "Mouse", "Magnet"],
    "N": ["Notebook", "Needle", "Nail", "Net"],
    "O": ["Oven", "Organizer", "Object", "Opener"],
    "P": ["Pen", "Pencil", "Paper", "Plate", "Phone"],
    "Q": ["Quill", "Quarter", "Quilt"],
    "R": ["Ruler", "Radio", "Ring", "Rope", "Rug"],
    "S": ["Spoon", "Scissors", "Shirt", "Sofa", "Stamp"],
    "T": ["Table", "Telephone", "Toothbrush", "Teacup", "Towel"],
    "U": ["Umbrella", "Urn", "Ukelele"],
    "V": ["Vase", "Violin", "Video", "Vacuum"]
  },
  "Color": {
    "A": ["Amber", "Aqua", "Azure", "Amethyst", "Alabaster"],
    "B": ["Blue", "Brown", "Black", "Beige", "Bronze"],
    "C": ["Crimson", "Cyan", "Coral", "Cream", "Copper"],
    "D": ["Dark Blue", "Drab", "Daffodil"],
    "E": ["Emerald", "Ebony", "Eggshell"],
    "F": ["Fuchsia", "Forest Green", "Firebrick"],
    "G": ["Green", "Gold", "Gray", "Grey", "Goldenrod"],
    "H": ["Hazel", "Hot Pink", "Heliotrope"],
    "I": ["Indigo", "Ivory", "Iris"],
    "J": ["Jade", "Jet Black", "Jasmin"],
    "L": ["Lavender", "Lime", "Lilac", "Lemon"],
    "M": ["Magenta", "Maroon", "Mauve", "Mint", "Mustard"],
    "N": ["Navy", "Neon", "Nutmeg"],
    "O": ["Orange", "Ochre", "Olive", "Orchid"],
    "P": ["Pink", "Purple", "Peach", "Plum", "Platinum"],
    "R": ["Red", "Rose", "Ruby", "Rust"],
    "S": ["Silver", "Salmon", "Scarlet", "Sepia", "Slate"],
    "T": ["Turquoise", "Teal", "Tan", "Tomato"],
    "U": ["Ultramarine"],
    "V": ["Violet", "Vermillion", "Vanilla"]
  }
};

// Fallback generator for custom categories or generic letter filler
export function getBotAnswer(lang: string, categoryName: string, letter: string): string {
  const dictionary = lang === "en" ? BOT_DICTIONARY_EN : BOT_DICTIONARY_ES;
  const upperL = letter.toUpperCase();

  // Try to find category match in dictionary
  // Since categories can span custom things like "Fruta/Verdura" vs "Fruit/Vegetable" or lower case, let's normalize strings
  let matchingCategoryKey = "";
  const catKeys = Object.keys(dictionary);
  const normalizedSearch = categoryName.toLowerCase().replace(/[^a-z]/g, "");

  for (const key of catKeys) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedSearch.includes(normalizedKey) || normalizedKey.includes(normalizedSearch)) {
      matchingCategoryKey = key;
      break;
    }
  }

  if (matchingCategoryKey && dictionary[matchingCategoryKey]?.[upperL]) {
    const list = dictionary[matchingCategoryKey][upperL];
    if (list && list.length > 0) {
      return list[Math.floor(Math.random() * list.length)];
    }
  }

  // Fallback: build a mock realistic word that starts with the letter
  const mocks: Record<string, string[]> = {
    "es": ["Estupendo", "Increíble", "Fabuloso", "Genial", "Universal", "Maravilla", "Supremo"],
    "en": ["Awesome", "Fabulous", "Terrific", "Great", "Universal", "Marvelous", "Supreme"]
  };
  const list = mocks[lang] || mocks["es"];
  const randomMock = list[Math.floor(Math.random() * list.length)];

  return upperL + randomMock.substring(1).toLowerCase();
}
