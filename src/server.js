import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoures.js';
import todoRoutes from './routes/todoRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/todos', authMiddleware, todoRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

console.log('hello world');
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server is running on ${port}`));