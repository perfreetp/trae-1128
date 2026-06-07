import { useState } from 'react';
import {
  Cpu,
  CheckCircle,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockStatistics, mockCategories, mockLabs } from '@/data/mockData';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/utils';

export default function Dashboard() {
  const { devices } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLab, setSelectedLab] = useState('all');

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || device.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    const matchesLab = selectedLab === 'all' || device.labId === selectedLab;
    return matchesSearch && matchesCategory && matchesStatus && matchesLab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪器总览</h1>
        <p className="text-gray-500 mt-1">管理和监控所有实验室设备</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="设备总数"
          value={mockStatistics.totalDevices}
          icon={Cpu}
          color="blue"
          trend="12% 较上月"
          trendUp
        />
        <StatCard
          title="可用设备"
          value={mockStatistics.availableDevices}
          icon={CheckCircle}
          color="green"
          trend={`${((mockStatistics.availableDevices / mockStatistics.totalDevices) * 100).toFixed(0)}% 可用率`}
          trendUp
        />
        <StatCard
          title="故障设备"
          value={mockStatistics.faultyDevices + mockStatistics.maintenanceDevices}
          icon={AlertTriangle}
          color="yellow"
          trend="3 台待处理"
          trendUp={false}
        />
        <StatCard
          title="设备利用率"
          value={`${mockStatistics.utilizationRate}%`}
          icon={TrendingUp}
          color="purple"
          trend="5.2% 较上月"
          trendUp
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备名称、编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              {mockCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="available">空闲</option>
              <option value="in_use">使用中</option>
              <option value="maintenance">维护中</option>
              <option value="faulty">故障</option>
              <option value="calibrating">校准中</option>
            </select>

            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部实验室</option>
              {mockLabs.map((lab) => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" />
              高级筛选
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDevices.map((device) => {
          const category = mockCategories.find((c) => c.id === device.categoryId);
          const lab = mockLabs.find((l) => l.id === device.labId);
          
          return (
            <div
              key={device.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Cpu className={cn(
                  'w-12 h-12 transition-transform group-hover:scale-110',
                  device.status === 'available' ? 'text-green-500' :
                  device.status === 'in_use' ? 'text-blue-500' :
                  device.status === 'faulty' ? 'text-red-500' : 'text-yellow-500'
                )} />
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-xs text-gray-500">{device.serialNo}</p>
                </div>
                <StatusBadge status={device.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{category?.name}</span>
                  <span className="text-gray-300">·</span>
                  <span>{device.model}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{lab?.name}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">¥{device.hourlyRate}/时</span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  查看详情 →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">没有找到匹配的设备</p>
        </div>
      )}
    </div>
  );
}
