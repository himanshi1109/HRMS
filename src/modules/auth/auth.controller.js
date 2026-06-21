const authService = require('./auth.service');
const speakeasy = require('speakeasy');
const User = require('./auth.model');
const Employee = require('../employee/employee.model');
const { successResponse, errorResponse } = require('../../utils/response');

const registerTenant = async (req, res, next) => {
  try {
    const secretKeyHeader = req.headers['x-super-admin-key'];
    if (secretKeyHeader !== process.env.SUPER_ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid super admin registration key',
        data: null
      });
    }

    const { name, slug, domain, email, password } = req.body;
    if (!name || !slug || !email || !password) {
      return errorResponse(res, 'Missing required parameters', 400);
    }

    const result = await authService.registerTenant({ name, slug, domain, email, password }, req);
    return successResponse(res, {
      tenant: { id: result.tenant._id, name: result.tenant.name, slug: result.tenant.slug },
      user: { id: result.user._id, email: result.user.email, role: result.user.role }
    }, 'Tenant registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, tenantSlug } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email/username and password are required', 400);
    }

    const result = await authService.login({ email, password, tenantSlug }, req);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!refreshToken || !authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Refresh token and bearer token authorization header are required', 400);
    }

    const oldAccessToken = authHeader.split(' ')[1];
    const result = await authService.refresh({ refreshToken, oldAccessToken });
    return successResponse(res, result, 'Token refreshed successfully');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { userId, tenantId, role } = req.user;
    await authService.logout(userId, tenantId, role, req);
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, tenantSlug } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const result = await authService.forgotPassword({ email, tenantSlug }, req);
    return successResponse(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return errorResponse(res, 'Token and newPassword are required', 400);
    }

    await authService.resetPassword({ token, newPassword });
    return successResponse(res, null, 'Password reset successful');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { userId, tenantId, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    await authService.changePassword(userId, tenantId, role, { currentPassword, newPassword });
    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { userId, tenantId } = req.user;
    const user = await User.findOne({ _id: userId, tenantId, isDeleted: false }).select('-passwordHash -passwordHistory -refreshToken');
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    let employeeInfo = null;
    if (user.employeeId) {
      employeeInfo = await Employee.findOne({ _id: user.employeeId, tenantId, isDeleted: false });
    }

    return successResponse(res, { user, employee: employeeInfo }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// MFA Setup
const setupMfa = async (req, res, next) => {
  try {
    const { userId, tenantId } = req.user;
    const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `HRMS (${user.email})`
    });

    user.mfaSecret = secret.base32;
    await user.save();

    return successResponse(res, {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url
    }, 'MFA secret generated successfully. Please verify with token to enable.');
  } catch (error) {
    next(error);
  }
};

// MFA Verify
const verifyMfa = async (req, res, next) => {
  try {
    const { userId, tenantId } = req.user;
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 'MFA code token is required', 400);
    }

    const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
    if (!user || !user.mfaSecret) {
      return errorResponse(res, 'MFA has not been set up yet', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return errorResponse(res, 'Invalid MFA code', 400);
    }

    user.isMfaEnabled = true;
    await user.save();

    return successResponse(res, null, 'MFA verified and enabled successfully');
  } catch (error) {
    next(error);
  }
};

// SSO Google
const ssoGoogle = async (req, res, next) => {
  try {
    const { email, googleId, tenantSlug } = req.body; // In practice, verifying idToken
    if (!email || !googleId || !tenantSlug) {
      return errorResponse(res, 'email, googleId, and tenantSlug are required', 400);
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), isActive: true, isDeleted: false });
    if (!tenant) {
      return errorResponse(res, 'Invalid or inactive tenant slug', 400);
    }

    let user = await User.findOne({ email: email.toLowerCase(), tenantId: tenant._id, isDeleted: false });
    if (!user) {
      // Create user
      user = new User({
        tenantId: tenant._id,
        email: email.toLowerCase(),
        role: 'EMPLOYEE',
        ssoProvider: 'GOOGLE',
        ssoId: googleId,
        isActive: true
      });
      await user.save();
    } else {
      user.ssoProvider = 'GOOGLE';
      user.ssoId = googleId;
      await user.save();
    }

    // Generate JWT access & refresh tokens
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const bcrypt = require('bcryptjs');

    const accessToken = jwt.sign(
      {
        userId: user._id,
        tenantId: tenant._id,
        role: user.role,
        email: user.email,
        employeeId: user.employeeId
      },
      process.env.JWT_SECRET || 'supersecretkeychangeinproduction',
      { expiresIn: '15m' }
    );

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    user.refreshToken = await bcrypt.hash(rawRefreshToken, 10);
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    return successResponse(res, {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user._id, email: user.email, role: user.role }
    }, 'Google SSO login successful');
  } catch (error) {
    next(error);
  }
};

// SSO Microsoft
const ssoMicrosoft = async (req, res, next) => {
  try {
    const { email, microsoftId, tenantSlug } = req.body;
    if (!email || !microsoftId || !tenantSlug) {
      return errorResponse(res, 'email, microsoftId, and tenantSlug are required', 400);
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), isActive: true, isDeleted: false });
    if (!tenant) {
      return errorResponse(res, 'Invalid or inactive tenant slug', 400);
    }

    let user = await User.findOne({ email: email.toLowerCase(), tenantId: tenant._id, isDeleted: false });
    if (!user) {
      user = new User({
        tenantId: tenant._id,
        email: email.toLowerCase(),
        role: 'EMPLOYEE',
        ssoProvider: 'MICROSOFT',
        ssoId: microsoftId,
        isActive: true
      });
      await user.save();
    } else {
      user.ssoProvider = 'MICROSOFT';
      user.ssoId = microsoftId;
      await user.save();
    }

    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const bcrypt = require('bcryptjs');

    const accessToken = jwt.sign(
      {
        userId: user._id,
        tenantId: tenant._id,
        role: user.role,
        email: user.email,
        employeeId: user.employeeId
      },
      process.env.JWT_SECRET || 'supersecretkeychangeinproduction',
      { expiresIn: '15m' }
    );

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    user.refreshToken = await bcrypt.hash(rawRefreshToken, 10);
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    return successResponse(res, {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user._id, email: user.email, role: user.role }
    }, 'Microsoft SSO login successful');
  } catch (error) {
    next(error);
  }
};

const setupCompany = async (req, res, next) => {
  try {
    const result = await authService.setupCompany(req.body, req);
    return successResponse(res, {
      tenant: { id: result.tenant._id, name: result.tenant.name, slug: result.tenant.slug },
      user: { id: result.user._id, email: result.user.email, role: result.user.role }
    }, 'Company setup and HR registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTenant,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  setupMfa,
  verifyMfa,
  ssoGoogle,
  ssoMicrosoft,
  setupCompany
};
