import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import db from './firebase.js'; // Certifique-se que o arquivo de configuração do Firebase está correto.

dotenv.config({ path: '.env.local' });

const app = express();

// Configurações de CORS
const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo cors'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

//app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

app.get('/teste', async (req, res) => {
  res.json('teste');
});

// Novo endpoint para inserir dados no Firebase
app.post('/add-pokemons', async (req, res) => {
  try {
    // Acessa o array de pokemons no corpo da requisição
    const { pokemons } = req.body;

    // Checa se os dados existem e são válidos
    if (!pokemons || !Array.isArray(pokemons)) {
      return res.status(400).json({ message: 'Formato inválido. Certifique-se de enviar um array de pokemons.' });
    }

    // Itera sobre cada Pokémon e insere no Firebase
    const batch = db.batch(); // Cria um batch para operações em massa
    pokemons.forEach(pokemon => {
      const pokemonRef = db.collection('unova').doc(pokemon.id); // Cria um documento com o ID do Pokémon
      batch.set(pokemonRef, pokemon); // Adiciona cada documento à operação em batch
    });

    // Confirma todas as operações de uma vez
    await batch.commit();

    res.status(201).json({ message: 'Pokémons adicionados com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar Pokémons ao Firebase.', error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

app.get('/alola', async (req, res) => {
  try {
    const alolaCollection = await db.collection('alola').get();
    const alolaData = [];
    
    alolaCollection.forEach(doc => {
      alolaData.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(alolaData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar documentos da coleção Alola.', error: error.message });
  }
});

app.get('/galar', async (req, res) => {
  try {
    const alolaCollection = await db.collection('galar').get();
    const alolaData = [];
    
    alolaCollection.forEach(doc => {
      alolaData.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(alolaData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar documentos da coleção galar.', error: error.message });
  }
});
