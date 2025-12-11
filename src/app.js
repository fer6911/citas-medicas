import express from 'express';
import config from './config/env.js';
import webhookRoutes from './routes/webhookRoutes.js';
import sendEmail from './services/sendEmail/sendEmail.js';

const app = express();
app.use(express.json());

app.use('/', webhookRoutes);

app.get('/', (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

// ✅ DESCOMENTA ESTO - Es necesario iniciar el servidor
app.listen(config.PORT, () => {
  console.log(`Server is listening on port: ${config.PORT}`);
  
  // ✅ Iniciar polling - el contador empieza automáticamente cada 15 segundos
  // sendEmail.startPolling();
});

process.on('SIGTERM', () => {
  sendEmail.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  sendEmail.stopPolling();
  process.exit(0);
});