import React, { useState } from 'react';
import {
  Plus,
  AlertCircle,
  Clock,
  User,
  Cpu,
  MessageSquare,
  Package,
  Filter,
  X,
  Save,
  Minus,
  CheckCircle2,
  History,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, cn, generateId } from '@/utils';
import type { WorkOrder, MaterialUsage, MaintenanceLog } from '@/types';

const statusColumns = [
  { key: 'pending', label: '待派单', color: 'bg-orange-50' },
  { key: 'assigned', label: '已派单', color: 'bg-blue-50' },
  { key: 'processing', label: '处理中', color: 'bg-yellow-50' },
  { key: 'completed', label: '已完成', color: 'bg-green-50' },
  { key: 'closed', label: '已关闭', color: 'bg-gray-50' },
];

export default function Maintenance() {
  const {
    workOrders,
    devices,
    users,
    materials,
    addWorkOrder,
    updateWorkOrder,
    currentUser,
    addMaterialUsage,
    updateMaterialStock,
    addMaintenanceLog,
    maintenanceLogs,
    materialUsages,
  } = useAppStore();
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [formData, setFormData] = useState({
    deviceId: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const getOrdersByStatus = (status: string) => {
    return workOrders.filter((w) => w.status === status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceId || !formData.title) return;

    const newOrder: WorkOrder = {
      id: generateId(),
      deviceId: formData.deviceId,
      reporterId: currentUser.id,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    addWorkOrder(newOrder);
    setShowModal(false);
    setFormData({ deviceId: '', title: '', description: '', priority: 'medium' });
  };

  const handleOpenDetail = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    setSelectedMaterialId('');
    setMaterialQuantity(1);
  };

  const handleAssign = (orderId: string) => {
    updateWorkOrder(orderId, { status: 'assigned', assigneeId: 'u4' });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'assigned', assigneeId: 'u4' });
    }
    const log: MaintenanceLog = {
      id: generateId(),
      workOrderId: orderId,
      handlerId: currentUser.id,
      action: '派单',
      description: '工单已派发给维修人员',
      createdAt: new Date().toISOString(),
    };
    addMaintenanceLog(log);
  };

  const handleStartProcess = (orderId: string) => {
    updateWorkOrder(orderId, { status: 'processing' });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'processing' });
    }
    const log: MaintenanceLog = {
      id: generateId(),
      workOrderId: orderId,
      handlerId: 'u4',
      action: '开始处理',
      description: '维修人员开始处理故障',
      createdAt: new Date().toISOString(),
    };
    addMaintenanceLog(log);
  };

  const handleAddMaterial = () => {
    if (!selectedOrder || !selectedMaterialId || materialQuantity <= 0) return;

    const material = materials.find((m) => m.id === selectedMaterialId);
    if (!material || material.stock < materialQuantity) {
      alert('库存不足！');
      return;
    }

    const usage: MaterialUsage = {
      id: generateId(),
      workOrderId: selectedOrder.id,
      materialId: selectedMaterialId,
      quantity: materialQuantity,
    };
    addMaterialUsage(usage);
    updateMaterialStock(selectedMaterialId, materialQuantity);

    const log: MaintenanceLog = {
      id: generateId(),
      workOrderId: selectedOrder.id,
      handlerId: currentUser.id,
      action: '添加耗材',
      description: `使用耗材：${material.name} x ${materialQuantity}${material.unit}`,
      createdAt: new Date().toISOString(),
    };
    addMaintenanceLog(log);

    setSelectedMaterialId('');
    setMaterialQuantity(1);
  };

  const handleComplete = (orderId: string) => {
    updateWorkOrder(orderId, { status: 'completed', completedAt: new Date().toISOString() });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'completed', completedAt: new Date().toISOString() });
    }
    const log: MaintenanceLog = {
      id: generateId(),
      workOrderId: orderId,
      handlerId: 'u4',
      action: '完成维修',
      description: '故障已修复，工单完成',
      createdAt: new Date().toISOString(),
    };
    addMaintenanceLog(log);
  };

  const device = selectedOrder ? devices.find((d) => d.id === selectedOrder.deviceId) : null;
  const reporter = selectedOrder ? users.find((u) => u.id === selectedOrder.reporterId) : null;
  const assignee = selectedOrder?.assigneeId ? users.find((u) => u.id === selectedOrder.assigneeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">维修工单</h1>
          <p className="text-gray-500 mt-1">设备故障上报、维修派单与工单跟踪</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            上报故障
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusColumns.map((col) => {
          const count = getOrdersByStatus(col.key).length;
          return (
            <div key={col.key} className={cn('rounded-xl p-4 border border-gray-100', col.color)}>
              <p className="text-sm text-gray-600 font-medium">{col.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statusColumns.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {getOrdersByStatus(col.key).length}
              </span>
            </div>
            <div className="space-y-3">
              {getOrdersByStatus(col.key).map((order) => {
                const device = devices.find((d) => d.id === order.deviceId);
                const reporter = users.find((u) => u.id === order.reporterId);
                const assignee = order.assigneeId ? users.find((u) => u.id === order.assigneeId) : null;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenDetail(order)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{order.title}</h4>
                      <StatusBadge status={order.priority} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Cpu className="w-3 h-3" />
                      <span>{device?.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{order.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{reporter?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(order.createdAt).slice(5, 16)}</span>
                      </div>
                    </div>
                    {assignee && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-500">
                        <MessageSquare className="w-3 h-3" />
                        <span>处理人：{assignee.name}</span>
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssign(order.id);
                        }}
                        className="mt-3 w-full py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        立即派单
                      </button>
                    )}
                    {order.status === 'assigned' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartProcess(order.id);
                        }}
                        className="mt-3 w-full py-1.5 text-xs bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                      >
                        开始处理
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(order.id);
                        }}
                        className="mt-3 w-full py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        完成维修
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">耗材库存</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {materials.map((mat) => (
            <div key={mat.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">{mat.name}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{mat.specification}</p>
              <div className="flex items-end justify-between">
                <span className={cn(
                  'text-xl font-bold',
                  mat.stock < 5 ? 'text-red-600' : 'text-gray-900'
                )}>
                  {mat.stock}
                </span>
                <span className="text-xs text-gray-500">{mat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">上报故障</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">故障设备</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">故障标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="简要描述故障"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请详细描述故障现象..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
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
                  提交工单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">工单详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedOrder.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">工单号：{selectedOrder.id}</p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">故障设备</p>
                    <p className="text-sm font-medium text-gray-900">{device?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">优先级</p>
                    <StatusBadge status={selectedOrder.priority} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">报修人</p>
                    <p className="text-sm font-medium text-gray-900">{reporter?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">处理人</p>
                    <p className="text-sm font-medium text-gray-900">{assignee?.name || '未指派'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">创建时间</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  {selectedOrder.completedAt && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">完成时间</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(selectedOrder.completedAt)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">故障描述</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                </div>
              </div>

              {(selectedOrder.status === 'processing' || selectedOrder.status === 'assigned') && (
                <div className="border-t border-gray-100 pt-6">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    添加耗材
                  </h5>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">选择耗材</label>
                      <select
                        value={selectedMaterialId}
                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">请选择耗材</option>
                        {materials.filter((m) => m.stock > 0).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.specification}) - 库存: {m.stock}{m.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">数量</label>
                      <input
                        type="number"
                        min="1"
                        value={materialQuantity}
                        onChange={(e) => setMaterialQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAddMaterial}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder && (() => {
                const orderLogs = maintenanceLogs.filter((l) => l.workOrderId === selectedOrder.id).sort((a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                const orderMaterialUsages = materialUsages.filter((u) => u.workOrderId === selectedOrder.id);
                
                return (
                  <>
                    {orderMaterialUsages.length > 0 && (
                      <div className="border-t border-gray-100 pt-6">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          耗材使用记录
                        </h5>
                        <div className="space-y-2">
                          {orderMaterialUsages.map((usage) => {
                            const material = materials.find((m) => m.id === usage.materialId);
                            return (
                              <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-900">{material?.name}</span>
                                <span className="text-sm font-medium text-gray-600">x {usage.quantity}{material?.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100 pt-6">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        流转记录
                      </h5>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">工单创建</p>
                            <p className="text-xs text-gray-500">{formatDateTime(selectedOrder.createdAt)}</p>
                          </div>
                        </div>
                        {orderLogs.map((log) => {
                          const handler = users.find((u) => u.id === log.handlerId);
                          const actionIcon = log.action === '派单' ? User :
                                            log.action === '开始处理' ? Wrench :
                                            log.action === '添加耗材' ? Package :
                                            log.action === '完成维修' ? CheckCircle2 : AlertCircle;
                          const actionColor = log.action === '派单' ? 'bg-blue-100 text-blue-600' :
                                             log.action === '开始处理' ? 'bg-yellow-100 text-yellow-600' :
                                             log.action === '添加耗材' ? 'bg-purple-100 text-purple-600' :
                                             log.action === '完成维修' ? 'bg-green-100 text-green-600' :
                                             'bg-gray-100 text-gray-600';
                          return (
                            <div key={log.id} className="flex gap-3">
                              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', actionColor)}>
                                {React.createElement(actionIcon, { className: 'w-4 h-4' })}
                              </div>
                              <div>
                                <p className="text-sm text-gray-900">
                                  {log.action}
                                  {handler && <span className="text-gray-500"> - {handler.name}</span>}
                                </p>
                                <p className="text-xs text-gray-500">{log.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleAssign(selectedOrder.id)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    立即派单
                  </button>
                )}
                {selectedOrder.status === 'assigned' && (
                  <button
                    onClick={() => handleStartProcess(selectedOrder.id)}
                    className="flex-1 px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    开始处理
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => handleComplete(selectedOrder.id)}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    完成维修
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
