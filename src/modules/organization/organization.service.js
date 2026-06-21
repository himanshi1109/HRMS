const Organization = require('./models/organization.model');
const Department = require('./models/department.model');
const Designation = require('./models/designation.model');
const Grade = require('./models/grade.model');
const Location = require('./models/location.model');

// ==========================================
// Organization Service
// ==========================================
const createOrganization = async (tenantId, data, userId) => {
  const org = new Organization({
    ...data,
    tenantId,
    createdBy: userId
  });
  return await org.save();
};

const getOrganization = async (tenantId) => {
  let org = await Organization.findOne({ tenantId, isDeleted: false });
  if (!org) {
    const Tenant = require('../tenant/tenant.model');
    const tenant = await Tenant.findOne({ _id: tenantId });
    if (tenant) {
      org = new Organization({
        tenantId,
        name: tenant.name,
        logo: tenant.logo || '',
        industry: 'Technology',
        address: {
          street: 'Not Specified',
          city: 'Not Specified',
          state: 'Not Specified',
          country: 'Not Specified'
        }
      });
      await org.save();
    }
  }
  return org;
};

const updateOrganization = async (tenantId, data, userId) => {
  return await Organization.findOneAndUpdate(
    { tenantId, isDeleted: false },
    { ...data, updatedBy: userId },
    { new: true, upsert: true } // If not exists, create
  );
};

// ==========================================
// Department Service
// ==========================================
const createDepartment = async (tenantId, data, userId) => {
  const dept = new Department({
    ...data,
    tenantId,
    createdBy: userId
  });
  return await dept.save();
};

const getDepartments = async (tenantId, { skip, limit, search }) => {
  const query = { tenantId, isDeleted: false };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  const items = await Department.find(query)
    .populate('headId', 'personal.firstName personal.lastName employeeId')
    .populate('parentDepartmentId', 'name code')
    .skip(skip)
    .limit(limit);
  const total = await Department.countDocuments(query);
  return { items, total };
};

const getDepartmentById = async (tenantId, id) => {
  return await Department.findOne({ _id: id, tenantId, isDeleted: false })
    .populate('headId', 'personal.firstName personal.lastName employeeId')
    .populate('parentDepartmentId', 'name code');
};

const updateDepartment = async (tenantId, id, data, userId) => {
  return await Department.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy: userId },
    { new: true }
  );
};

const deleteDepartment = async (tenantId, id, userId) => {
  return await Department.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true }
  );
};

// ==========================================
// Designation Service
// ==========================================
const createDesignation = async (tenantId, data, userId) => {
  const desig = new Designation({
    ...data,
    tenantId,
    createdBy: userId
  });
  return await desig.save();
};

const getDesignations = async (tenantId, { skip, limit, search }) => {
  const query = { tenantId, isDeleted: false };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  const items = await Designation.find(query)
    .populate('gradeId', 'name code')
    .skip(skip)
    .limit(limit);
  const total = await Designation.countDocuments(query);
  return { items, total };
};

const getDesignationById = async (tenantId, id) => {
  return await Designation.findOne({ _id: id, tenantId, isDeleted: false }).populate('gradeId', 'name code');
};

const updateDesignation = async (tenantId, id, data, userId) => {
  return await Designation.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy: userId },
    { new: true }
  );
};

const deleteDesignation = async (tenantId, id, userId) => {
  return await Designation.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true }
  );
};

// ==========================================
// Grade Service
// ==========================================
const createGrade = async (tenantId, data, userId) => {
  const grade = new Grade({
    ...data,
    tenantId,
    createdBy: userId
  });
  return await grade.save();
};

const getGrades = async (tenantId, { skip, limit, search }) => {
  const query = { tenantId, isDeleted: false };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  const items = await Grade.find(query).skip(skip).limit(limit);
  const total = await Grade.countDocuments(query);
  return { items, total };
};

const getGradeById = async (tenantId, id) => {
  return await Grade.findOne({ _id: id, tenantId, isDeleted: false });
};

const updateGrade = async (tenantId, id, data, userId) => {
  return await Grade.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy: userId },
    { new: true }
  );
};

const deleteGrade = async (tenantId, id, userId) => {
  return await Grade.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true }
  );
};

// ==========================================
// Location Service
// ==========================================
const createLocation = async (tenantId, data, userId) => {
  const loc = new Location({
    ...data,
    tenantId,
    createdBy: userId
  });
  return await loc.save();
};

const getLocations = async (tenantId, { skip, limit, search }) => {
  const query = { tenantId, isDeleted: false };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  const items = await Location.find(query).skip(skip).limit(limit);
  const total = await Location.countDocuments(query);
  return { items, total };
};

const getLocationById = async (tenantId, id) => {
  return await Location.findOne({ _id: id, tenantId, isDeleted: false });
};

const updateLocation = async (tenantId, id, data, userId) => {
  return await Location.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy: userId },
    { new: true }
  );
};

const deleteLocation = async (tenantId, id, userId) => {
  return await Location.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true }
  );
};

module.exports = {
  createOrganization,
  getOrganization,
  updateOrganization,
  
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
  
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation
};
