const Tenant = require('./tenant.model');

const createTenant = async (tenantData) => {
  const tenant = new Tenant(tenantData);
  return await tenant.save();
};

const getTenantById = async (id) => {
  return await Tenant.findOne({ _id: id, isDeleted: false });
};

const getTenantBySlug = async (slug) => {
  return await Tenant.findOne({ slug: slug.toLowerCase(), isDeleted: false });
};

const updateTenant = async (id, updateData, userId) => {
  return await Tenant.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { ...updateData, updatedBy: userId },
    { new: true }
  );
};

const deleteTenant = async (id, userId) => {
  return await Tenant.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true }
  );
};

module.exports = {
  createTenant,
  getTenantById,
  getTenantBySlug,
  updateTenant,
  deleteTenant
};
