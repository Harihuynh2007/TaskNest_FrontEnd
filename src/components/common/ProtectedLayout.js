import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Header from '../Layout/Header';
import SideBar from '../Layout/SiderBar';

export default function ProtectedLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Header />
      <div className="d-flex">
        <SideBar />
        <main className="flex-grow-1 p-3">
          <Outlet />
        </main>
      </div>
    </>
  );
}
