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
const attachmentsRouter = require('./routes/attachments');

const app = express();

// Build allowed origins from env and sensible defaults
function buildAllowedOrigins() {
  const defaults = ['http://localhost:4200', 'https://relatorio-turno-frontend.vercel.app'];
  const envList = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const single = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : [];
  const vercel = process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [];
  const normalized = [...defaults, ...envList, ...single, ...vercel].map((o) => o.replace(/\/$/, ''));
  return Array.from(new Set(normalized));
}

const allowedOrigins = buildAllowedOrigins();

app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
// Handle preflight for all routes using same config
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
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
        url: process.env.PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`),
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
app.use('/api', attachmentsRouter);

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
