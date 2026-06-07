import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockCategories } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, cn } from '@/utils';

export default function CalendarPage() {
  const { reservations, devices, users, addReservation, currentUser, trainings } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [formData, setFormData] = useState({
    deviceId: '',
    purpose: '',
    startTime: '',
    endTime: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return reservations.filter((r) => {
      const matchesDate = formatDate(r.startTime) === dateStr;
      const matchesDevice = selectedDevice === 'all' || r.deviceId === selectedDevice;
      return matchesDate && matchesDevice;
    });
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date, hour });
    setFormData({
      deviceId: selectedDevice === 'all' ? devices[0]?.id || '' : selectedDevice,
      purpose: '',
      startTime: `${formatDate(date)} ${String(hour).padStart(2, '0')}:00`,
      endTime: `${formatDate(date)} ${String(hour + 2).padStart(2, '0')}:00`,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceId || !formData.purpose) return;

    const device = devices.find((d) => d.id === formData.deviceId);
    if (device?.categoryId === 'c4') {
      const hasValidTraining = trainings.some((t) =>
        t.deviceId === device.id &&
        t.userId === currentUser.id &&
        t.result === 'passed' &&
        (!t.expiryDate || new Date(t.expiryDate) > new Date())
      );
      if (!hasValidTraining) {
        alert('该设备为大型精密仪器，您尚未通过有效的操作培训，无法预约！请先参加培训并通过考核。');
        return;
      }
    }

    const newReservation = {
      id: `r${Date.now()}`,
      userId: currentUser.id,
      deviceId: formData.deviceId,
      startTime: new Date(formData.startTime.replace(' ', 'T')).toISOString(),
      endTime: new Date(formData.endTime.replace(' ', 'T')).toISOString(),
      purpose: formData.purpose,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    addReservation(newReservation);
    setShowModal(false);
    setFormData({ deviceId: '', purpose: '', startTime: '', endTime: '' });
  };

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预约日历</h1>
          <p className="text-gray-500 mt-1">查看和预约设备使用时间</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部设备</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSelectedSlot(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            新建预约
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">{year}年 {monthNames[month]}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium">月视图</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">周视图</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">日视图</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-100">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayReservations = date ? getReservationsForDate(date) : [];
              const isToday = date && formatDate(date) === formatDate(new Date());

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-28 border-r border-b border-gray-100 p-2',
                    !date && 'bg-gray-50',
                    index % 7 === 6 && 'border-r-0'
                  )}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                            isToday && 'bg-blue-600 text-white'
                          )}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayReservations.slice(0, 3).map((r) => {
                          const device = devices.find((d) => d.id === r.deviceId);
                          return (
                            <div
                              key={r.id}
                              className={cn(
                                'text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-80',
                                r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                r.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {device?.name}
                            </div>
                          );
                        })}
                        {dayReservations.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">+{dayReservations.length - 3} 更多</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">设备类型分布</h3>
            <div className="space-y-3">
              {mockCategories.map((cat) => {
                const count = devices.filter((d) => d.categoryId === cat.id).length;
                const percentage = (count / devices.length) * 100;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{cat.name}</span>
                      <span className="font-medium">{count}台</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">待处理预约</h3>
            <div className="space-y-3">
              {reservations.filter((r) => r.status === 'pending').slice(0, 5).map((r) => {
                const device = devices.find((d) => d.id === r.deviceId);
                const user = users.find((u) => u.id === r.userId);
                return (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{device?.name}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(r.startTime, 'MM-DD HH:mm')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">新建预约</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择设备</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择设备</option>
                  {devices.filter((d) => d.status === 'available').map((d) => (
                    <option key={d.id} value={d.id}>{d.name} - ¥{d.hourlyRate}/时</option>
                  ))}
                </select>
                {formData.deviceId && devices.find((d) => d.id === formData.deviceId)?.categoryId === 'c4' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-700">
                      {trainings.some((t) =>
                        t.deviceId === formData.deviceId &&
                        t.userId === currentUser.id &&
                        t.result === 'passed' &&
                        (!t.expiryDate || new Date(t.expiryDate) > new Date())
                      ) ? (
                        <span className="text-green-600 font-medium">✓ 您已持有该设备的有效培训资质</span>
                      ) : (
                        <span>该设备为大型精密仪器，需要通过专门培训后方可预约使用</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime.replace(' ', 'T').slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime.replace(' ', 'T').slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用用途</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="请描述实验用途..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交预约
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
