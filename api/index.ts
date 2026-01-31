import express from 'express';
import cors from 'cors';
import sniperRoutes from '../routes/sniper';
import leadRoutes from '../routes/leads';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sniper', sniperRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => {
  res.send('Optima Engine is Running... 🚀');
});

export default app;
