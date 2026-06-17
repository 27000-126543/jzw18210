import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import EmployeeLayout from "@/components/EmployeeLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import CreateNotice from "@/pages/admin/CreateNotice";
import EditNotice from "@/pages/admin/EditNotice";
import TrackingDetail from "@/pages/admin/TrackingDetail";
import Archive from "@/pages/admin/Archive";
import NoticeCenter from "@/pages/employee/NoticeCenter";
import NoticeDetail from "@/pages/employee/NoticeDetail";
import { useAuthStore } from "@/store";
import { useNoticeStore } from "@/store";

function PrivateRoute({ children, role }: { children: React.ReactNode; role: 'admin' | 'employee' }) {
  const { currentUser, isAdmin } = useAuthStore()
  if (!currentUser) return <Navigate to="/login" replace />
  if (role === 'admin' && !isAdmin) return <Navigate to="/employee" replace />
  if (role === 'employee' && isAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

function App() {
  const archiveExpired = useNoticeStore((s) => s.archiveExpired)
  const publishScheduled = useNoticeStore((s) => s.publishScheduled)

  useEffect(() => {
    archiveExpired()
    publishScheduled()
    const interval = setInterval(() => {
      archiveExpired()
      publishScheduled()
    }, 60000)
    return () => clearInterval(interval)
  }, [archiveExpired, publishScheduled])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateNotice />} />
          <Route path="edit/:id" element={<EditNotice />} />
          <Route path="tracking/:id" element={<TrackingDetail />} />
          <Route path="archive" element={<Archive />} />
        </Route>
        <Route
          path="/employee"
          element={
            <PrivateRoute role="employee">
              <EmployeeLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<NoticeCenter />} />
          <Route path="notice/:id" element={<NoticeDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
