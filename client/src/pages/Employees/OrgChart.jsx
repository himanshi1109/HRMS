import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import { Award, Briefcase, Building, ChevronRight, GitFork } from 'lucide-react';

export const OrgChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await employeeService.getOrgChart();
        if (response?.success && response?.data) {
          setChartData(response.data);
        }
      } catch (err) {
        console.error('Error fetching org chart data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  // Simple clean mock tree in case of empty API data
  const mockTree = [
    {
      _id: '1',
      name: 'Sarah Jenkins',
      role: 'HR Director / General Manager',
      department: 'Operations',
      status: 'ACTIVE',
      reports: [
        {
          _id: '2',
          name: 'Michael Huff',
          role: 'Lead Project Manager',
          department: 'Product Management',
          status: 'ACTIVE',
          reports: [
            { _id: '4', name: 'Janet Dev', role: 'Lead Frontend Developer', department: 'Engineering', status: 'ACTIVE' },
            { _id: '5', name: 'Chris Fox', role: 'UI/UX Designer', department: 'Product Design', status: 'LATE' },
          ],
        },
        {
          _id: '3',
          name: 'Alisha Thomas',
          role: 'Finance Supervisor',
          department: 'Accountancy',
          status: 'ACTIVE',
          reports: [],
        },
      ],
    },
  ];

  const renderNode = (node) => {
    return (
      <div key={node._id} className="flex flex-col items-center select-none">
        {/* Node Card */}
        <div className="bg-charcoal-sidebar border border-indigo-border p-4 rounded-xl shadow-lg text-center w-60 relative transition-transform hover:scale-105 duration-200">
          <Avatar name={node.name} size="md" className="mx-auto" />
          <h4 className="text-sm font-bold text-stardust-text mt-3">{node.name}</h4>
          <span className="text-[10px] text-grey-text uppercase font-semibold tracking-wider block mt-1">
            {node.role}
          </span>
          <div className="mt-3 pt-2 border-t border-indigo-border/30 flex justify-between items-center text-xs">
            <span className="text-grey-text">{node.department}</span>
            <Badge status={node.status || 'ACTIVE'} />
          </div>
        </div>

        {/* Children Line and block */}
        {node.reports && node.reports.length > 0 && (
          <div className="flex flex-col items-center w-full mt-4">
            {/* Vertical connector line */}
            <div className="w-0.5 h-6 bg-indigo-border/80" />
            
            {/* Horizontal line bridge */}
            <div className="flex justify-center w-full relative">
              {node.reports.length > 1 && (
                <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-indigo-border/80" />
              )}
            </div>

            {/* Render sub nodes */}
            <div className="flex flex-wrap gap-8 justify-center mt-4">
              {node.reports.map((child) => renderNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const displayData = chartData.length > 0 ? chartData : mockTree;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stardust-text">Workspace Hierarchy</h2>
        <p className="text-sm text-grey-text mt-1">Direct reports and reporting lines</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-charcoal-sidebar/30 border border-indigo-border rounded-xl p-8 overflow-x-auto min-h-[500px] flex justify-center items-start shadow-xl">
          <div className="pt-4 flex flex-col items-center">
            {displayData.map((rootNode) => renderNode(rootNode))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
