import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Wrench,
  Shield,
  BarChart3,
  Users,
  Microscope,
} from 'lucide-react';
import { cn } from '@/utils';

const menuItems = [
  { path: '/dashboard', label: '仪器总览', icon: LayoutDashboard },
  { path: '/calendar', label: '预约日历', icon: Calendar },
  { path: '/approval', label: '审批台', icon: ClipboardCheck },
  { path: '/maintenance', label: '维修工单', icon: Wrench },
  { path: '/safety', label: '安全巡检', icon: Shield },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
  { path: '/users', label: '人员权限', icon: Users },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">实验室设备运维</h1>
            <p className="text-xs text-slate-400">Lab Equipment System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">系统版本</p>
          <p className="text-sm font-medium">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
