const Tenant = require('../modules/tenant/tenant.model');

const injectTenantId = async (req, res, next) => {
  try {
    let tenantId = req.headers['x-tenant-id'];
    const tenantSlug = req.headers['x-tenant-slug'] || req.body.tenantSlug || req.query.tenantSlug;

    if (!tenantId && tenantSlug) {
      // Find active tenant by slug
      const tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true, isDeleted: false });
      if (tenant) {
        tenantId = tenant._id.toString();
      }
    }

    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = injectTenantId;
