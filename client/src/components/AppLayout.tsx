import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import InfoIcon from './InfoIcon';
import './AppLayout.css';

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <InfoIcon />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
