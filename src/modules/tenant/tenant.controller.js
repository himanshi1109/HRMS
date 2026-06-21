const tenantService = require('./tenant.service');
const { successResponse, errorResponse } = require('../../utils/response');

const getTenant = async (req, res, next) => {
  try {
    const tenantId = req.params.id || req.tenantId;
    const tenant = await tenantService.getTenantById(tenantId);
    if (!tenant) {
      return errorResponse(res, 'Tenant not found', 404);
    }
    return successResponse(res, tenant, 'Tenant retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const tenantId = req.params.id;
    const tenant = await tenantService.updateTenant(tenantId, req.body, req.user?.userId);
    if (!tenant) {
      return errorResponse(res, 'Tenant not found', 404);
    }
    return successResponse(res, tenant, 'Tenant updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTenant,
  updateTenant
};
