const organizationService = require('./organization.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const auditService = require('../../audit/audit.service');

// ==========================================
// Organization Controllers
// ==========================================
const createOrganization = async (req, res, next) => {
  try {
    const org = await organizationService.createOrganization(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Organization',
      resourceId: org._id,
      after: org.toObject(),
      req
    });
    return successResponse(res, org, 'Organization profile created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getOrganization = async (req, res, next) => {
  try {
    const org = await organizationService.getOrganization(req.tenantId);
    if (!org) {
      return errorResponse(res, 'Organization profile not found', 404);
    }
    return successResponse(res, org, 'Organization profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const beforeOrg = await organizationService.getOrganization(req.tenantId);
    const org = await organizationService.updateOrganization(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Organization',
      resourceId: org._id,
      before: beforeOrg ? beforeOrg.toObject() : null,
      after: org.toObject(),
      req
    });
    return successResponse(res, org, 'Organization profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Department Controllers
// ==========================================
const createDepartment = async (req, res, next) => {
  try {
    const dept = await organizationService.createDepartment(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Department',
      resourceId: dept._id,
      after: dept.toObject(),
      req
    });
    return successResponse(res, dept, 'Department created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search;
    const { items, total } = await organizationService.getDepartments(req.tenantId, { skip, limit, search });
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await organizationService.getDepartmentById(req.tenantId, req.params.id);
    if (!dept) return errorResponse(res, 'Department not found', 404);
    return successResponse(res, dept, 'Department retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const beforeDept = await organizationService.getDepartmentById(req.tenantId, req.params.id);
    const dept = await organizationService.updateDepartment(req.tenantId, req.params.id, req.body, req.user.userId);
    if (!dept) return errorResponse(res, 'Department not found', 404);
    
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Department',
      resourceId: dept._id,
      before: beforeDept ? beforeDept.toObject() : null,
      after: dept.toObject(),
      req
    });
    return successResponse(res, dept, 'Department updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const beforeDept = await organizationService.getDepartmentById(req.tenantId, req.params.id);
    const dept = await organizationService.deleteDepartment(req.tenantId, req.params.id, req.user.userId);
    if (!dept) return errorResponse(res, 'Department not found or already deleted', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'DELETE',
      resourceType: 'Department',
      resourceId: dept._id,
      before: beforeDept ? beforeDept.toObject() : null,
      req
    });
    return successResponse(res, null, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Designation Controllers
// ==========================================
const createDesignation = async (req, res, next) => {
  try {
    const desig = await organizationService.createDesignation(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Designation',
      resourceId: desig._id,
      after: desig.toObject(),
      req
    });
    return successResponse(res, desig, 'Designation created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getDesignations = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search;
    const { items, total } = await organizationService.getDesignations(req.tenantId, { skip, limit, search });
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getDesignationById = async (req, res, next) => {
  try {
    const desig = await organizationService.getDesignationById(req.tenantId, req.params.id);
    if (!desig) return errorResponse(res, 'Designation not found', 404);
    return successResponse(res, desig, 'Designation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateDesignation = async (req, res, next) => {
  try {
    const before = await organizationService.getDesignationById(req.tenantId, req.params.id);
    const desig = await organizationService.updateDesignation(req.tenantId, req.params.id, req.body, req.user.userId);
    if (!desig) return errorResponse(res, 'Designation not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Designation',
      resourceId: desig._id,
      before: before ? before.toObject() : null,
      after: desig.toObject(),
      req
    });
    return successResponse(res, desig, 'Designation updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteDesignation = async (req, res, next) => {
  try {
    const before = await organizationService.getDesignationById(req.tenantId, req.params.id);
    const desig = await organizationService.deleteDesignation(req.tenantId, req.params.id, req.user.userId);
    if (!desig) return errorResponse(res, 'Designation not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'DELETE',
      resourceType: 'Designation',
      resourceId: desig._id,
      before: before ? before.toObject() : null,
      req
    });
    return successResponse(res, null, 'Designation deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Grade Controllers
// ==========================================
const createGrade = async (req, res, next) => {
  try {
    const grade = await organizationService.createGrade(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Grade',
      resourceId: grade._id,
      after: grade.toObject(),
      req
    });
    return successResponse(res, grade, 'Grade created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getGrades = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search;
    const { items, total } = await organizationService.getGrades(req.tenantId, { skip, limit, search });
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getGradeById = async (req, res, next) => {
  try {
    const grade = await organizationService.getGradeById(req.tenantId, req.params.id);
    if (!grade) return errorResponse(res, 'Grade not found', 404);
    return successResponse(res, grade, 'Grade retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateGrade = async (req, res, next) => {
  try {
    const before = await organizationService.getGradeById(req.tenantId, req.params.id);
    const grade = await organizationService.updateGrade(req.tenantId, req.params.id, req.body, req.user.userId);
    if (!grade) return errorResponse(res, 'Grade not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Grade',
      resourceId: grade._id,
      before: before ? before.toObject() : null,
      after: grade.toObject(),
      req
    });
    return successResponse(res, grade, 'Grade updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteGrade = async (req, res, next) => {
  try {
    const before = await organizationService.getGradeById(req.tenantId, req.params.id);
    const grade = await organizationService.deleteGrade(req.tenantId, req.params.id, req.user.userId);
    if (!grade) return errorResponse(res, 'Grade not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'DELETE',
      resourceType: 'Grade',
      resourceId: grade._id,
      before: before ? before.toObject() : null,
      req
    });
    return successResponse(res, null, 'Grade deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Location Controllers
// ==========================================
const createLocation = async (req, res, next) => {
  try {
    const loc = await organizationService.createLocation(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Location',
      resourceId: loc._id,
      after: loc.toObject(),
      req
    });
    return successResponse(res, loc, 'Location created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search;
    const { items, total } = await organizationService.getLocations(req.tenantId, { skip, limit, search });
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const loc = await organizationService.getLocationById(req.tenantId, req.params.id);
    if (!loc) return errorResponse(res, 'Location not found', 404);
    return successResponse(res, loc, 'Location retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const before = await organizationService.getLocationById(req.tenantId, req.params.id);
    const loc = await organizationService.updateLocation(req.tenantId, req.params.id, req.body, req.user.userId);
    if (!loc) return errorResponse(res, 'Location not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Location',
      resourceId: loc._id,
      before: before ? before.toObject() : null,
      after: loc.toObject(),
      req
    });
    return successResponse(res, loc, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const before = await organizationService.getLocationById(req.tenantId, req.params.id);
    const loc = await organizationService.deleteLocation(req.tenantId, req.params.id, req.user.userId);
    if (!loc) return errorResponse(res, 'Location not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'DELETE',
      resourceType: 'Location',
      resourceId: loc._id,
      before: before ? before.toObject() : null,
      req
    });
    return successResponse(res, null, 'Location deleted successfully');
  } catch (error) {
    next(error);
  }
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
