const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

// Public endpoints
router.post('/register-tenant', authController.registerTenant);
router.post('/setup-company', authController.setupCompany);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/sso/google', authController.ssoGoogle);
router.post('/sso/microsoft', authController.ssoMicrosoft);

// Authenticated endpoints
router.post('/logout', verifyToken, authController.logout);
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/me', verifyToken, authController.getMe);
router.post('/mfa/setup', verifyToken, authController.setupMfa);
router.post('/mfa/verify', verifyToken, authController.verifyMfa);

module.exports = router;
