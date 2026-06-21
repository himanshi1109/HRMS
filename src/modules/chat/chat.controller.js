const { GoogleGenerativeAI } = require('@google/generative-ai');
const Employee = require('../employee/employee.model');
const Organization = require('../organization/models/organization.model');
const Department = require('../organization/models/department.model');
const LeaveType = require('../leave/leaveType.model');
const LeaveRequest = require('../leave/leaveRequest.model');
const { errorResponse } = require('../../utils/response');

const sendMessage = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(503).json({
        success: false,
        message: 'Workly Assistant is not configured yet. Please add your GEMINI_API_KEY to the .env file.',
        data: null
      });
    }

    const { message, conversationHistory = [] } = req.body;
    if (!message || !message.trim()) {
      return errorResponse(res, 'Message is required', 400);
    }

    const tenantId = req.tenantId;
    const userRole = req.user.role;
    const userEmail = req.user.email;
    const employeeId = req.user.employeeId;

    const mongoose = require('mongoose');
    const dbTenantId = mongoose.Types.ObjectId.isValid(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId;

    // Fetch company context in parallel
    const [org, departments, leaveTypes, totalEmployees, pendingLeaves] = await Promise.all([
      Organization.findOne({ tenantId: dbTenantId, isDeleted: false }).lean(),
      Department.find({ tenantId: dbTenantId, isDeleted: false }).select('name').lean(),
      LeaveType.find({ tenantId: dbTenantId, isDeleted: false }).select('name').lean(),
      Employee.countDocuments({ tenantId: dbTenantId, isDeleted: false, status: 'ACTIVE' }),
      LeaveRequest.countDocuments({ tenantId: dbTenantId, status: 'PENDING', isDeleted: false })
    ]);

    // Fetch logged-in user's employee profile
    let userEmployee = null;
    if (employeeId) {
      const queryId = mongoose.Types.ObjectId.isValid(employeeId) ? new mongoose.Types.ObjectId(employeeId) : employeeId;
      const queryTenant = mongoose.Types.ObjectId.isValid(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId;
      
      userEmployee = await Employee.findOne({ _id: queryId, tenantId: queryTenant, isDeleted: false })
        .populate('employment.departmentId', 'name')
        .populate('employment.designationId', 'name')
        .lean();
    }

    const userName = userEmployee
      ? `${userEmployee.personal?.firstName || ''} ${userEmployee.personal?.lastName || ''}`.trim()
      : userEmail;
    const userDept = userEmployee?.employment?.departmentId?.name || 'N/A';
    const userDesig = userEmployee?.employment?.designationId?.name || 'N/A';
    const userDoj = userEmployee?.employment?.dateOfJoining
      ? new Date(userEmployee.employment.dateOfJoining).toLocaleDateString('en-IN')
      : 'N/A';

    const companyName = org?.name || 'Your Company';
    const companyIndustry = org?.industry || 'N/A';
    const companyAddress = org?.address
      ? [org.address.city, org.address.state, org.address.country].filter(Boolean).join(', ')
      : 'N/A';
    const deptNames = departments.map(d => d.name).join(', ') || 'N/A';
    const leaveTypeNames = leaveTypes.map(l => l.name).join(', ') || 'N/A';

    // Build full conversation as a single prompt for Gemini
    // This avoids the startChat history restriction
    const systemContext = `You are Workly Assistant, an intelligent AI HR assistant built into Workly HRMS.
You are helpful, professional, friendly, and concise. Answer in 2-5 sentences unless detail is needed.
Format lists with bullet points. Use the user's first name when possible.

=== APP KNOWLEDGE ===
Workly HRMS features:
- Dashboard: Role-based dashboards (Employee, Manager, HR Admin, Leadership) with live KPIs
- Employee Management: Add/edit employees, manage profiles, departments, designations, grades, locations
- Attendance Tracking: Punch in/out via web, muster registers, team attendance views
- Leave Management: Apply for leave, check balances, multi-level approval workflow
- Approvals & Workflow: Multi-level workflows with SLA tracking for leave, profile changes
- Reports & Analytics: Headcount, attendance summaries, leave usage, attrition reports
- Notifications: Real-time HR event notifications
- Employee Self-Service (ESS): View own attendance, leave balance, profile
- Manager Self-Service (MSS): View team attendance, approve requests
- Compensation: Salary and payslip management
- Company Profile: HR Admins can manage company name, address, industry, logo

=== COMPANY CONTEXT ===
Company: ${companyName}
Industry: ${companyIndustry}
Location: ${companyAddress}
Active Employees: ${totalEmployees}
Departments: ${deptNames}
Leave Types: ${leaveTypeNames}
Pending Leave Requests: ${pendingLeaves}

=== LOGGED-IN USER ===
Name: ${userName}
Email: ${userEmail}
Role: ${userRole}
Department: ${userDept}
Designation: ${userDesig}
Date of Joining: ${userDoj}
${userRole === 'HR_ADMIN' ? 'Capabilities: Full HR admin access — manage employees, policies, reports, company details, approve requests.' : ''}
${userRole === 'MANAGER' ? 'Capabilities: View team attendance, approve leave requests, team reports.' : ''}
${userRole === 'EMPLOYEE' ? 'Capabilities: View own attendance, leave balance, apply for leave, update own profile.' : ''}
${userRole === 'LEADERSHIP' ? 'Capabilities: Company-wide analytics, reports, HR operations overview.' : ''}

Do not make up data not provided above. If unsure, say so politely.
===================`;

    // Build the conversation turns as a simple text prompt
    // Include prior turns for context
    let conversationText = '';
    const priorMessages = conversationHistory
      .filter(m => m.role && m.content && m.role !== 'assistant' || (m.role === 'assistant' && m.content))
      .slice(-8); // last 8 messages for context

    for (const msg of priorMessages) {
      if (msg.role === 'user') {
        conversationText += `\nUser: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        conversationText += `\nAssistant: ${msg.content}`;
      }
    }

    // Build final prompt
    const fullPrompt = `${systemContext}\n\nConversation so far:${conversationText || ' (This is the first message)'}\n\nUser: ${message.trim()}\nAssistant:`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text().trim();

    return res.json({
      success: true,
      message: 'Message processed',
      data: { reply }
    });

  } catch (error) {
    console.error('Chat error:', error.message);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return res.status(503).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in the .env file.',
        data: null
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Workly Assistant encountered an error. Please try again.',
      data: null
    });
  }
};

module.exports = { sendMessage };
