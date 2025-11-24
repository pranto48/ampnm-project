import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import path from 'path';
import { initializeDatabase } from './database';
import { performMonitoringChecks } from './monitoring';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initializeDatabase();

app.use('/api', routes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

cron.schedule('*/30 * * * * *', () => {
  performMonitoringChecks();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Monitoring checks will run every 30 seconds`);

  performMonitoringChecks();
});
