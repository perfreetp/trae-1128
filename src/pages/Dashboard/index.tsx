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
  X,
  Clock,
  Calendar,
  History,
  AlertCircle,
  DollarSign,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockStatistics, mockCategories, mockLabs } from '@/data/mockData';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { cn, formatDate, formatDateTime } from '@/utils';
import type { Device } from '@/types';

export default function Dashboard() {
  const { devices, calibrations, workOrders, trainings, reservations } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLab, setSelectedLab] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  
  const [advancedFilters, setAdvancedFilters] = useState({
    priceMin: '',
    priceMax: '',
    calibrationDue: false,
    needTraining: false,
  });

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || device.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    const matchesLab = selectedLab === 'all' || device.labId === selectedLab;
    
    let matchesAdvanced = true;
    if (advancedFilters.priceMin) {
      matchesAdvanced = matchesAdvanced && device.hourlyRate >= parseInt(advancedFilters.priceMin);
    }
    if (advancedFilters.priceMax) {
      matchesAdvanced = matchesAdvanced && device.hourlyRate <= parseInt(advancedFilters.priceMax);
    }
    if (advancedFilters.calibrationDue) {
      if (device.lastCalibration && device.calibrationCycleDays) {
        const lastCal = new Date(device.lastCalibration);
        const nextCal = new Date(lastCal.getTime() + device.calibrationCycleDays * 24 * 60 * 60 * 1000);
        const daysUntil = Math.ceil((nextCal.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        matchesAdvanced = matchesAdvanced && daysUntil <= 30;
      }
    }
    if (advancedFilters.needTraining) {
      matchesAdvanced = matchesAdvanced && device.categoryId === 'cat4';
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLab && matchesAdvanced;
  });

  const handleOpenDetail = (device: Device) => {
    setSelectedDevice(device);
    setShowDetailModal(true);
  };

  const deviceCalibrations = selectedDevice
    ? calibrations.filter((c) => c.deviceId === selectedDevice.id)
    : [];
  const deviceWorkOrders = selectedDevice
    ? workOrders.filter((w) => w.deviceId === selectedDevice.id)
    : [];
  const deviceReservations = selectedDevice
    ? reservations.filter((r) => r.deviceId === selectedDevice.id && r.status !== 'rejected')
    : [];
  const deviceTrainings = selectedDevice
    ? trainings.filter((t) => t.deviceId === selectedDevice.id)
    : [];

  const deviceCategory = selectedDevice ? mockCategories.find((c) => c.id === selectedDevice.categoryId) : null;
  const deviceLab = selectedDevice ? mockLabs.find((l) => l.id === selectedDevice.labId) : null;

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

            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
                showAdvancedFilter
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Filter className="w-4 h-4" />
              高级筛选
            </button>
          </div>
        </div>

        {showAdvancedFilter && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">最低价格 (元/时)</label>
                <input
                  type="number"
                  value={advancedFilters.priceMin}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceMin: e.target.value })}
                  placeholder="最低价格"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">最高价格 (元/时)</label>
                <input
                  type="number"
                  value={advancedFilters.priceMax}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceMax: e.target.value })}
                  placeholder="最高价格"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedFilters.calibrationDue}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, calibrationDue: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">30天内校准到期</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedFilters.needTraining}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, needTraining: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">需培训准入(大型仪器)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setAdvancedFilters({ priceMin: '', priceMax: '', calibrationDue: false, needTraining: false })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                重置筛选
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDevices.map((device) => {
          const category = mockCategories.find((c) => c.id === device.categoryId);
          const lab = mockLabs.find((l) => l.id === device.labId);
          
          return (
            <div
              key={device.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => handleOpenDetail(device)}
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

      {showDetailModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedDevice.name}</h3>
                <p className="text-sm text-gray-500 mt-1">设备详细信息</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <Cpu className="w-20 h-20 text-blue-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">{selectedDevice.name}</h4>
                    <StatusBadge status={selectedDevice.status} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">设备编号</span>
                      <span className="font-medium text-gray-900">{selectedDevice.serialNo}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">设备类型</span>
                      <span className="font-medium text-gray-900">{deviceCategory?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">型号</span>
                      <span className="font-medium text-gray-900">{selectedDevice.model}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">生产厂家</span>
                      <span className="font-medium text-gray-900">{selectedDevice.manufacturer}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">所属实验室</span>
                      <span className="font-medium text-gray-900">{deviceLab?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">存放位置</span>
                      <span className="font-medium text-gray-900">{selectedDevice.location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">购置日期</span>
                      <span className="font-medium text-gray-900">{selectedDevice.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">计费标准</span>
                      <span className="font-bold text-blue-600">¥{selectedDevice.hourlyRate}/时</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  开放时段
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
                    <div key={day} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-gray-900">{day}</p>
                      <p className="text-xs text-gray-500 mt-1">08:00 - 22:00</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  校准记录
                </h5>
                {deviceCalibrations.length > 0 ? (
                  <div className="space-y-2">
                    {deviceCalibrations.map((cal) => (
                      <div key={cal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">校准结果: {cal.result === 'passed' ? '合格' : '不合格'}</p>
                            <p className="text-xs text-gray-500">校准人: {cal.calibrator}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{formatDate(cal.calibrationDate)}</p>
                          <p className="text-xs text-gray-500">下次: {formatDate(cal.nextCalibrationDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">暂无校准记录</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                  维修记录
                </h5>
                {deviceWorkOrders.length > 0 ? (
                  <div className="space-y-2">
                    {deviceWorkOrders.map((wo) => (
                      <div key={wo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{wo.title}</p>
                            <p className="text-xs text-gray-500">{wo.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={wo.status} />
                          <p className="text-xs text-gray-500 mt-1">{formatDateTime(wo.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">暂无维修记录</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  培训准入要求
                </h5>
                {deviceCategory?.id === 'cat4' ? (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">此为大型精密仪器，需要通过专门培训后方可预约使用</p>
                    <p className="text-xs text-purple-600 mt-2">已有 {deviceTrainings.filter((t) => t.result === 'passed').length} 人通过培训</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">无需专门培训，所有授权用户均可预约使用</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
