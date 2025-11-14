import { Navigate, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { EmployeesList } from '@/components/employees/EmployeesList';
import { ReportsView } from '@/components/reports/ReportsView';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeesList />} />
          <Route path="/reports" element={<ReportsView />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
