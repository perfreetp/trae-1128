import { useState } from 'react';
import {
  Check,
  X,
  Clock,
  User,
  Cpu,
  FileText,
  MessageSquare,
  Filter,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, cn, generateId } from '@/utils';
import type { UsageRecord } from '@/types';

type TabType = 'pending' | 'approved' | 'rejected' | 'completed';

export default function Approval() {
  const { reservations, devices, users, updateReservation, addUsageRecord, updateDevice } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  
  const [usageForm, setUsageForm] = useState({
    actualStartTime: '',
    actualEndTime: '',
    deviceStatus: 'available' as UsageRecord['deviceStatus'],
    remarks: '',
  });

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待审批', count: reservations.filter((r) => r.status === 'pending').length },
    { key: 'approved', label: '已通过', count: reservations.filter((r) => r.status === 'approved').length },
    { key: 'rejected', label: '已驳回', count: reservations.filter((r) => r.status === 'rejected').length },
    { key: 'completed', label: '已完成', count: reservations.filter((r) => r.status === 'completed').length },
  ];

  const filteredReservations = reservations.filter((r) => r.status === activeTab);

  const handleApprove = (id: string) => {
    updateReservation(id, { status: 'approved', approvalComment: '审批通过' });
  };

  const handleReject = (id: string) => {
    setSelectedReservation(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedReservation) {
      updateReservation(selectedReservation, {
        status: 'rejected',
        approvalComment: rejectReason || '审批未通过',
      });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedReservation(null);
    }
  };

  const handleOpenUsage = (reservation: typeof reservations[0]) => {
    setSelectedReservation(reservation.id);
    setUsageForm({
      actualStartTime: reservation.startTime.slice(0, 16),
      actualEndTime: reservation.endTime.slice(0, 16),
      deviceStatus: 'available',
      remarks: '',
    });
    setShowUsageModal(true);
  };

  const confirmUsage = () => {
    if (!selectedReservation) return;
    
    const reservation = reservations.find((r) => r.id === selectedReservation);
    if (!reservation) return;

    const startTime = new Date(usageForm.actualStartTime);
    const endTime = new Date(usageForm.actualEndTime);
    const durationHours = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)));
    
    const device = devices.find((d) => d.id === reservation.deviceId);
    const totalCost = device ? device.hourlyRate * durationHours : 0;

    const usageRecord: UsageRecord = {
      id: generateId(),
      reservationId: reservation.id,
      deviceId: reservation.deviceId,
      userId: reservation.userId,
      startTime: usageForm.actualStartTime,
      endTime: usageForm.actualEndTime,
      durationHours,
      deviceStatus: usageForm.deviceStatus,
      remarks: usageForm.remarks,
      recordedAt: new Date().toISOString(),
      recordedBy: 'admin',
    };

    addUsageRecord(usageRecord);
    updateReservation(selectedReservation, {
      status: 'completed',
      actualStartTime: usageForm.actualStartTime,
      actualEndTime: usageForm.actualEndTime,
      usageDuration: durationHours,
      totalCost,
    });

    if (usageForm.deviceStatus === 'faulty') {
      updateDevice(reservation.deviceId, { status: 'faulty' });
    } else if (usageForm.deviceStatus === 'maintenance') {
      updateDevice(reservation.deviceId, { status: 'maintenance' });
    } else {
      updateDevice(reservation.deviceId, { status: 'available' });
    }

    setShowUsageModal(false);
    setSelectedReservation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审批台</h1>
          <p className="text-gray-500 mt-1">审核预约申请，管理使用登记</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <Filter className="w-4 h-4" />
          筛选条件
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-4 text-sm font-medium relative transition-colors',
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用时段</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用途</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.map((reservation) => {
                const device = devices.find((d) => d.id === reservation.deviceId);
                const user = users.find((u) => u.id === reservation.userId);

                return (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{device?.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{device?.model}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p>{formatDateTime(reservation.startTime)}</p>
                          <p className="text-gray-400">至 {formatDateTime(reservation.endTime)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="max-w-xs truncate">{reservation.purpose}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td className="px-6 py-4">
                      {reservation.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(reservation.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            <Check className="w-4 h-4" />
                            通过
                          </button>
                          <button
                            onClick={() => handleReject(reservation.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            驳回
                          </button>
                        </div>
                      )}
                      {reservation.status === 'approved' && (
                        <button
                          onClick={() => handleOpenUsage(reservation)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          登记使用
                        </button>
                      )}
                      {reservation.status === 'completed' && (
                        <div className="text-sm text-gray-500">
                          <p>时长: {reservation.usageDuration}小时</p>
                          <p>费用: ¥{reservation.totalCost}</p>
                        </div>
                      )}
                      {reservation.approvalComment && reservation.status !== 'completed' && (
                        <p className="text-xs text-gray-500 mt-1">{reservation.approvalComment}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无{tabs.find((t) => t.key === activeTab)?.label}的预约</p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">驳回预约</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">驳回原因</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认驳回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">登记使用</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">实际开始时间</label>
                  <input
                    type="datetime-local"
                    value={usageForm.actualStartTime}
                    onChange={(e) => setUsageForm({ ...usageForm, actualStartTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">实际结束时间</label>
                  <input
                    type="datetime-local"
                    value={usageForm.actualEndTime}
                    onChange={(e) => setUsageForm({ ...usageForm, actualEndTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用后设备状态</label>
                <select
                  value={usageForm.deviceStatus}
                  onChange={(e) => setUsageForm({ ...usageForm, deviceStatus: e.target.value as UsageRecord['deviceStatus'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">正常可用</option>
                  <option value="in_use">使用中</option>
                  <option value="maintenance">需维护</option>
                  <option value="faulty">故障</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用备注</label>
                <textarea
                  value={usageForm.remarks}
                  onChange={(e) => setUsageForm({ ...usageForm, remarks: e.target.value })}
                  placeholder="请填写使用情况、设备运行状况等..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmUsage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存登记
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
