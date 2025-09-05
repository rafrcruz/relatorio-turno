const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorhandler = require('errorhandler');
const { uploadDir } = require('./middleware/upload');

const areasRouter = require('./routes/areas');
const postsRouter = require('./routes/posts');
const profileRouter = require('./routes/profile');
const reportsRouter = require('./routes/reports');

const app = express();

app.use(compression());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Relatório de Turno API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  // Include all route files so swagger-jsdoc can parse the annotations and
  // generate the OpenAPI specification automatically.
  apis: [
    path.join(__dirname, '*.js'),
    path.join(__dirname, 'routes', '*.js'),
  ],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js + Express funcionando!' });
});

app.use('/api/areas', areasRouter);
app.use('/api/posts', postsRouter);
app.use('/api', profileRouter);
app.use('/api', reportsRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use(errorhandler());
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    error: {
      message: err.message,
    },
  };
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }
  res.status(status).json(response);
});

module.exports = app;
