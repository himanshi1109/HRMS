const express = require('express');
const organizationController = require('./organization.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

// Organization Router
const organizationRouter = express.Router();
organizationRouter.post('/', verifyToken, checkRole(['HR_ADMIN']), organizationController.createOrganization);
organizationRouter.get('/', verifyToken, organizationController.getOrganization);
organizationRouter.put('/', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), organizationController.updateOrganization);

// Department Router
const departmentRouter = express.Router();
departmentRouter.post('/', verifyToken, checkRole(['HR_ADMIN']), organizationController.createDepartment);
departmentRouter.get('/', verifyToken, organizationController.getDepartments);
departmentRouter.get('/:id', verifyToken, organizationController.getDepartmentById);
departmentRouter.put('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.updateDepartment);
departmentRouter.delete('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.deleteDepartment);

// Designation Router
const designationRouter = express.Router();
designationRouter.post('/', verifyToken, checkRole(['HR_ADMIN']), organizationController.createDesignation);
designationRouter.get('/', verifyToken, organizationController.getDesignations);
designationRouter.get('/:id', verifyToken, organizationController.getDesignationById);
designationRouter.put('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.updateDesignation);
designationRouter.delete('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.deleteDesignation);

// Grade Router
const gradeRouter = express.Router();
gradeRouter.post('/', verifyToken, checkRole(['HR_ADMIN']), organizationController.createGrade);
gradeRouter.get('/', verifyToken, organizationController.getGrades);
gradeRouter.get('/:id', verifyToken, organizationController.getGradeById);
gradeRouter.put('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.updateGrade);
gradeRouter.delete('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.deleteGrade);

// Location Router
const locationRouter = express.Router();
locationRouter.post('/', verifyToken, checkRole(['HR_ADMIN']), organizationController.createLocation);
locationRouter.get('/', verifyToken, organizationController.getLocations);
locationRouter.get('/:id', verifyToken, organizationController.getLocationById);
locationRouter.put('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.updateLocation);
locationRouter.delete('/:id', verifyToken, checkRole(['HR_ADMIN']), organizationController.deleteLocation);

module.exports = {
  organizationRouter,
  departmentRouter,
  designationRouter,
  gradeRouter,
  locationRouter
};
