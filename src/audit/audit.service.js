const AuditLog = require('./audit.model');

/**
 * Creates an append-only audit log entry.
 * Extracts client IP and User-Agent from Request object if provided.
 */
const log = async ({
  tenantId,
  actorId,
  actorRole,
  action,
  resourceType,
  resourceId,
  before,
  after,
  req
}) => {
  try {
    let ip = undefined;
    let userAgent = undefined;

    if (req) {
      ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      userAgent = req.headers['user-agent'];
    }

    const auditEntry = new AuditLog({
      tenantId,
      actorId,
      actorRole,
      action,
      resourceType,
      resourceId,
      before,
      after,
      ip,
      userAgent
    });

    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Silent fail so it does not interrupt parent transaction/actions in production
    if (process.env.NODE_ENV === 'production') {
      // Log error but don't rethrow unless critical
    }
  }
};

module.exports = { log };
