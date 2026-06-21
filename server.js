require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const errorHandler = require('./src/middleware/errorHandler');
const { checkSLABreaches } = require('./src/modules/workflow/workflow.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Cors setup
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*'
}));

// Rate limiting
const globalLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS API',
      version: '1.0.0',
      description: 'Human Resource Management System API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [
    './src/modules/**/*.routes.js',
    './server.js'
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve static files from the React client build
app.use(express.static(path.join(__dirname, 'client/dist')));

// Mount Routes
app.use('/api/auth', require('./src/modules/auth/auth.routes'));
app.use('/api/tenants', require('./src/modules/tenant/tenant.routes'));

// Organization sub-routers
const {
  organizationRouter,
  departmentRouter,
  designationRouter,
  gradeRouter,
  locationRouter
} = require('./src/modules/organization/organization.routes');

app.use('/api/organizations', organizationRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/designations', designationRouter);
app.use('/api/grades', gradeRouter);
app.use('/api/locations', locationRouter);

// Other module routes
app.use('/api/employees', require('./src/modules/employee/employee.routes'));
app.use('/api/attendance', require('./src/modules/attendance/attendance.routes'));
app.use('/api/leave-requests', require('./src/modules/leave/leave.routes'));
app.use('/api/workflow-requests', require('./src/modules/workflow/workflow.routes'));
app.use('/api/notifications', require('./src/modules/notification/notification.routes'));
app.use('/api/reports', require('./src/modules/reports/reports.routes'));
app.use('/api/ess', require('./src/modules/self-service/ess.routes'));
app.use('/api/mss', require('./src/modules/self-service/mss.routes'));
app.use('/api/chat', require('./src/modules/chat/chat.routes'));

// Catch-all route to serve the React index.html for client-side pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Global Error Handler Middleware
app.use(errorHandler);

// SLA Checker — runs every 30 minutes
const SLA_INTERVAL = 30 * 60 * 1000;
setInterval(async () => {
  console.log('Running background SLA breach checks...');
  await checkSLABreaches();
}, SLA_INTERVAL);

// Connect MongoDB & Start Server
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
