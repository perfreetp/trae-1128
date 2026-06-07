import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  GraduationCap,
  AlertOctagon,
  Bell,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import { formatDate, cn, generateId } from '@/utils';
import type { Inspection, Training, Calibration } from '@/types';

type TabType = 'inspections' | 'calibrations' | 'trainings' | 'violations';

export default function Safety() {
  const {
    inspections,
    calibrations,
    trainings,
    violations,
    devices,
    users,
    addInspection,
    addTraining,
    addCalibration,
    updateDevice,
    currentUser,
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('inspections');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  
  const [inspectionForm, setInspectionForm] = useState({
    title: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  
  const [trainingForm, setTrainingForm] = useState({
    deviceId: '',
    userId: '',
    trainingDate: new Date().toISOString().slice(0, 10),
    trainer: '',
    result: 'passed' as 'passed' | 'failed',
    expiryDate: '',
  });

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'inspections', label: '安全检查', icon: Shield },
    { key: 'calibrations', label: '校准提醒', icon: Clock },
    { key: 'trainings', label: '培训准入', icon: GraduationCap },
    { key: 'violations', label: '违规记录', icon: AlertOctagon },
  ];

  const pendingCalibrations = devices.filter((d) => {
    if (!d.lastCalibration || !d.calibrationCycleDays) return false;
    const lastCal = new Date(d.lastCalibration);
    const nextCal = new Date(lastCal.getTime() + d.calibrationCycleDays * 24 * 60 * 60 * 1000);
    const daysUntil = Math.ceil((nextCal.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  });

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionForm.title) return;

    const newInspection: Inspection = {
      id: generateId(),
      title: inspectionForm.title,
      inspectorId: currentUser.id,
      inspectionDate: inspectionForm.inspectionDate,
      status: 'scheduled',
      notes: inspectionForm.notes,
    };
    addInspection(newInspection);
    setShowInspectionModal(false);
    setInspectionForm({ title: '', inspectionDate: new Date().toISOString().slice(0, 10), notes: '' });
  };

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingForm.deviceId || !trainingForm.userId || !trainingForm.trainer) return;

    const newTraining: Training = {
      id: generateId(),
      deviceId: trainingForm.deviceId,
      userId: trainingForm.userId,
      trainingDate: trainingForm.trainingDate,
      trainer: trainingForm.trainer,
      result: trainingForm.result,
      expiryDate: trainingForm.expiryDate || undefined,
    };
    addTraining(newTraining);
    setShowTrainingModal(false);
    setTrainingForm({
      deviceId: '',
      userId: '',
      trainingDate: new Date().toISOString().slice(0, 10),
      trainer: '',
      result: 'passed',
      expiryDate: '',
    });
  };

  const handleCalibrate = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const now = new Date();
    const nextCal = new Date(now.getTime() + (device.calibrationCycleDays || 90) * 24 * 60 * 60 * 1000);

    const newCalibration: Calibration = {
      id: generateId(),
      deviceId,
      calibrationDate: now.toISOString().slice(0, 10),
      nextCalibrationDate: nextCal.toISOString().slice(0, 10),
      calibrator: currentUser.name,
      result: 'passed',
    };
    addCalibration(newCalibration);
    updateDevice(deviceId, { lastCalibration: now.toISOString().slice(0, 10) });
  };

  const isUserTrainedForDevice = (userId: string, deviceId: string) => {
    return trainings.some(
      (t) => t.userId === userId && t.deviceId === deviceId && t.result === 'passed'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">安全巡检</h1>
        <p className="text-gray-500 mt-1">安全检查、设备校准、培训管理与违规记录</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="待检查项"
          value={inspections.filter((i) => i.status !== 'completed').length}
          icon={Shield}
          color="yellow"
        />
        <StatCard
          title="待校准设备"
          value={pendingCalibrations.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="培训通过"
          value={trainings.filter((t) => t.result === 'passed').length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="违规记录"
          value={violations.length}
          icon={AlertOctagon}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium relative transition-colors',
                  activeTab === tab.key
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">安全检查计划</h3>
                <button
                  onClick={() => setShowInspectionModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新建检查
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">检查名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">检查日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">检查人</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inspections.map((inspection) => {
                      const inspector = users.find((u) => u.id === inspection.inspectorId);
                      return (
                        <tr key={inspection.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">{inspection.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inspection.inspectionDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inspector?.name}</td>
                          <td className="px-4 py-3"><StatusBadge status={inspection.status} /></td>
                          <td className="px-4 py-3">
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">查看详情</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {inspections.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>暂无安全检查记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calibrations' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">校准提醒</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCalibrations.map((device) => {
                  const lastCal = device.lastCalibration ? new Date(device.lastCalibration) : null;
                  const nextCal = lastCal && device.calibrationCycleDays
                    ? new Date(lastCal.getTime() + device.calibrationCycleDays * 24 * 60 * 60 * 1000)
                    : null;
                  const daysUntil = nextCal ? Math.ceil((nextCal.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  const isOverdue = daysUntil < 0;

                  return (
                    <div
                      key={device.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{device.name}</h4>
                          <p className="text-xs text-gray-500">{device.model}</p>
                        </div>
                        <Bell className={cn('w-5 h-5', isOverdue ? 'text-red-500' : 'text-yellow-500')} />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">上次校准</span>
                          <span className="font-medium">{device.lastCalibration || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">下次校准</span>
                          <span className={cn('font-medium', isOverdue ? 'text-red-600' : 'text-yellow-600')}>
                            {nextCal ? formatDate(nextCal) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">剩余天数</span>
                          <span className={cn('font-medium', isOverdue ? 'text-red-600' : 'text-yellow-600')}>
                            {isOverdue ? `已逾期 ${Math.abs(daysUntil)} 天` : `${daysUntil} 天`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCalibrate(device.id)}
                        className={cn(
                          'w-full mt-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
                          isOverdue
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        )}
                      >
                        立即校准
                      </button>
                    </div>
                  );
                })}
                {pendingCalibrations.length === 0 && (
                  <div className="col-span-full p-8 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p>所有设备校准状态正常</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">培训记录</h3>
                <button
                  onClick={() => setShowTrainingModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增培训
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">培训人员</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">培训日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">培训师</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">结果</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期至</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">准入状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trainings.map((training) => {
                      const device = devices.find((d) => d.id === training.deviceId);
                      const user = users.find((u) => u.id === training.userId);
                      const isPassed = training.result === 'passed';
                      const isExpired = training.expiryDate && new Date(training.expiryDate) <= new Date();
                      const hasAccess = isPassed && !isExpired;
                      return (
                        <tr key={training.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{device?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(training.trainingDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{training.trainer}</td>
                          <td className="px-4 py-3"><StatusBadge status={training.result} /></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{training.expiryDate ? formatDate(training.expiryDate) : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              hasAccess
                                ? 'bg-green-100 text-green-700'
                                : isExpired
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-500'
                            )}>
                              {hasAccess ? '已准入' : isExpired ? '已过期' : '未通过'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {trainings.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>暂无培训记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">违规记录</h3>
              <div className="space-y-3">
                {violations.map((violation) => {
                  const user = users.find((u) => u.id === violation.userId);
                  const device = devices.find((d) => d.id === violation.deviceId);
                  return (
                    <div key={violation.id} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertOctagon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{user?.name}</span>
                              <span className="text-gray-400">·</span>
                              <span className="text-sm text-gray-500">{device?.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>违规日期：{formatDate(violation.violationDate)}</span>
                              <span>处罚：{violation.penalty}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {violations.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p>暂无违规记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新建安全检查</h3>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddInspection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检查名称 *</label>
                <input
                  type="text"
                  value={inspectionForm.title}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, title: e.target.value })}
                  placeholder="请输入检查名称"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检查日期</label>
                <input
                  type="date"
                  value={inspectionForm.inspectionDate}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                  placeholder="检查备注..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrainingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新增培训记录</h3>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddTraining} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">培训设备 *</label>
                <select
                  value={trainingForm.deviceId}
                  onChange={(e) => setTrainingForm({ ...trainingForm, deviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择设备</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">培训人员 *</label>
                <select
                  value={trainingForm.userId}
                  onChange={(e) => setTrainingForm({ ...trainingForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择人员</option>
                  {users.filter((u) => u.active).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} - {u.department} ({u.role === 'admin' ? '管理员' : '教师'})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">培训日期</label>
                  <input
                    type="date"
                    value={trainingForm.trainingDate}
                    onChange={(e) => setTrainingForm({ ...trainingForm, trainingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label>
                  <input
                    type="date"
                    value={trainingForm.expiryDate}
                    onChange={(e) => setTrainingForm({ ...trainingForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">培训师 *</label>
                <input
                  type="text"
                  value={trainingForm.trainer}
                  onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                  placeholder="请输入培训师姓名"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">培训结果</label>
                <select
                  value={trainingForm.result}
                  onChange={(e) => setTrainingForm({ ...trainingForm, result: e.target.value as 'passed' | 'failed' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="passed">通过</option>
                  <option value="failed">未通过</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
