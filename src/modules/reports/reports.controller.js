const reportsService = require('./reports.service');
const { Parser } = require('json2csv');
const { errorResponse } = require('../../utils/response');

const handleReportResponse = (res, data, filenamePrefix) => {
  if (res.req.query.export === 'csv') {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filenamePrefix}-${Date.now()}.csv`);
      return res.send(csv);
    } catch (err) {
      return errorResponse(res, `CSV export failed: ${err.message}`, 500);
    }
  }
  return res.status(200).json({
    success: true,
    message: 'Report fetched successfully',
    data
  });
};

const getHeadcount = async (req, res, next) => {
  try {
    const { groupBy } = req.query;
    if (!groupBy) return errorResponse(res, 'groupBy parameter (department/location/designation/grade/status) is required', 400);
    
    const data = await reportsService.getHeadcountReport(req.tenantId, groupBy, req.query);
    return handleReportResponse(res, data, `headcount-report-by-${groupBy}`);
  } catch (error) {
    next(error);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, departmentId } = req.query;
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const data = await reportsService.getAttendanceSummaryReport(req.tenantId, month, departmentId);
    return handleReportResponse(res, data, 'attendance-summary-report');
  } catch (error) {
    next(error);
  }
};

const getLateReport = async (req, res, next) => {
  try {
    const { month, departmentId } = req.query;
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const data = await reportsService.getLateReport(req.tenantId, month, departmentId);
    return handleReportResponse(res, data, 'late-report');
  } catch (error) {
    next(error);
  }
};

const getAbsentReport = async (req, res, next) => {
  try {
    const { month, departmentId } = req.query;
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const data = await reportsService.getAbsentReport(req.tenantId, month, departmentId);
    return handleReportResponse(res, data, 'absent-report');
  } catch (error) {
    next(error);
  }
};

const getOvertimeReport = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const data = await reportsService.getOvertimeReport(req.tenantId, month);
    return handleReportResponse(res, data, 'overtime-report');
  } catch (error) {
    next(error);
  }
};

const getLeaveBalances = async (req, res, next) => {
  try {
    const { year, departmentId, leaveTypeId } = req.query;
    if (!year) return errorResponse(res, 'year query parameter is required (format: YYYY)', 400);

    const data = await reportsService.getLeaveBalancesReport(req.tenantId, year, departmentId, leaveTypeId);
    return handleReportResponse(res, data, 'leave-balances-report');
  } catch (error) {
    next(error);
  }
};

const getLeaveUsage = async (req, res, next) => {
  try {
    const { year, departmentId } = req.query;
    if (!year) return errorResponse(res, 'year query parameter is required (format: YYYY)', 400);

    const data = await reportsService.getLeaveUsageReport(req.tenantId, year, departmentId);
    return handleReportResponse(res, data, 'leave-usage-report');
  } catch (error) {
    next(error);
  }
};

const getLeaveLop = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const data = await reportsService.getLeaveLopReport(req.tenantId, month);
    return handleReportResponse(res, data, 'leave-lop-report');
  } catch (error) {
    next(error);
  }
};

const getAttrition = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) return errorResponse(res, 'year query parameter is required (format: YYYY)', 400);

    const data = await reportsService.getAttritionReport(req.tenantId, year);
    return handleReportResponse(res, data, 'attrition-report');
  } catch (error) {
    next(error);
  }
};

const getHrDashboard = async (req, res, next) => {
  try {
    const data = await reportsService.getHrDashboardMetrics(req.tenantId);
    return handleReportResponse(res, data, 'hr-dashboard-metrics');
  } catch (error) {
    next(error);
  }
};

const getLeadershipDashboard = async (req, res, next) => {
  try {
    const data = await reportsService.getLeadershipDashboardMetrics(req.tenantId);
    return handleReportResponse(res, data, 'leadership-dashboard-metrics');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHeadcount,
  getAttendanceSummary,
  getLateReport,
  getAbsentReport,
  getOvertimeReport,
  getLeaveBalances,
  getLeaveUsage,
  getLeaveLop,
  getAttrition,
  getHrDashboard,
  getLeadershipDashboard
};
