require('dotenv').config();
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
const errorLogger = require('./middlewares/errorLogger');
const express = require('express');
const requestLogger = require('./middlewares/requestLogger');
const unmatchedRouteHandler = require('./middlewares/unmatchedRouteHandler');
const { startConsumers } = require('./rabbitmq/consumer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/measurements`, require('./routes/measurementRoutes'));

app.use(unmatchedRouteHandler);
app.use(errorLogger);
app.use(errorHandler);

startConsumers()
  .then(() => {
    app.listen(port, () => {
      console.log(`[server] Server is running at port ${port}.`);
    });
  })
  .catch((err) => {
    console.error('[server] Failed to start application:', err);
    process.exit(1);
  });
