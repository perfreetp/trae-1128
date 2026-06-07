import { create } from 'zustand';
import type {
  User,
  Device,
  Reservation,
  WorkOrder,
  Calibration,
  Training,
  Violation,
  Announcement,
  Inspection,
  Material,
  UsageRecord,
  MaintenanceLog,
  MaterialUsage,
} from '@/types';
import {
  mockUsers,
  mockDevices,
  mockReservations,
  mockWorkOrders,
  mockCalibrations,
  mockTrainings,
  mockViolations,
  mockAnnouncements,
  mockInspections,
  mockMaterials,
} from '@/data/mockData';
import { generateId } from '@/utils';

const generateInitialMaintenanceLogs = (): MaintenanceLog[] => {
  const logs: MaintenanceLog[] = [];
  
  mockWorkOrders.forEach((order) => {
    const baseTime = new Date(order.createdAt).getTime();
    
    if (order.status !== 'pending') {
      logs.push({
        id: generateId(),
        workOrderId: order.id,
        handlerId: 'u1',
        action: '派单',
        description: '工单已派发给维修人员',
        createdAt: new Date(baseTime + 10 * 60 * 1000).toISOString(),
      });
    }
    
    if (order.status === 'processing' || order.status === 'completed') {
      logs.push({
        id: generateId(),
        workOrderId: order.id,
        handlerId: order.assigneeId || 'u4',
        action: '开始处理',
        description: '维修人员开始处理故障',
        createdAt: new Date(baseTime + 30 * 60 * 1000).toISOString(),
      });
    }
    
    if (order.status === 'completed') {
      logs.push({
        id: generateId(),
        workOrderId: order.id,
        handlerId: order.assigneeId || 'u4',
        action: '完成维修',
        description: '故障已修复，工单完成',
        createdAt: order.completedAt || new Date(baseTime + 2 * 60 * 60 * 1000).toISOString(),
      });
    }
  });
  
  return logs;
};

interface AppState {
  currentUser: User;
  users: User[];
  devices: Device[];
  reservations: Reservation[];
  workOrders: WorkOrder[];
  calibrations: Calibration[];
  trainings: Training[];
  violations: Violation[];
  announcements: Announcement[];
  inspections: Inspection[];
  materials: Material[];
  usageRecords: UsageRecord[];
  maintenanceLogs: MaintenanceLog[];
  materialUsages: MaterialUsage[];
  
  setCurrentUser: (user: User) => void;
  
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
  
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  
  addUsageRecord: (record: UsageRecord) => void;
  
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  
  addMaintenanceLog: (log: MaintenanceLog) => void;
  
  addMaterialUsage: (usage: MaterialUsage) => void;
  updateMaterialStock: (id: string, quantity: number) => void;
  
  addAnnouncement: (announcement: Announcement) => void;
  
  updateDevice: (id: string, data: Partial<Device>) => void;
  
  addCalibration: (calibration: Calibration) => void;
  addTraining: (training: Training) => void;
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  devices: mockDevices,
  reservations: mockReservations,
  workOrders: mockWorkOrders,
  calibrations: mockCalibrations,
  trainings: mockTrainings,
  violations: mockViolations,
  announcements: mockAnnouncements,
  inspections: mockInspections,
  materials: mockMaterials,
  usageRecords: [],
  maintenanceLogs: generateInitialMaintenanceLogs(),
  materialUsages: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),
  
  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, ...data } : u
      ),
    })),
  
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),
  
  toggleUserActive: (id) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      ),
    })),
  
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),
  
  updateReservation: (id, data) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),
  
  addUsageRecord: (record) =>
    set((state) => ({
      usageRecords: [...state.usageRecords, record],
    })),
  
  addWorkOrder: (workOrder) =>
    set((state) => ({
      workOrders: [...state.workOrders, workOrder],
    })),
  
  updateWorkOrder: (id, data) =>
    set((state) => ({
      workOrders: state.workOrders.map((w) =>
        w.id === id ? { ...w, ...data } : w
      ),
    })),
  
  addMaintenanceLog: (log) =>
    set((state) => ({
      maintenanceLogs: [...state.maintenanceLogs, log],
    })),
  
  addMaterialUsage: (usage) =>
    set((state) => ({
      materialUsages: [...state.materialUsages, usage],
    })),
  
  updateMaterialStock: (id, quantity) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, stock: Math.max(0, m.stock - quantity) } : m
      ),
    })),
  
  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [announcement, ...state.announcements],
    })),
  
  updateDevice: (id, data) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, ...data } : d
      ),
    })),
  
  addCalibration: (calibration) =>
    set((state) => ({
      calibrations: [...state.calibrations, calibration],
    })),
  
  addTraining: (training) =>
    set((state) => ({
      trainings: [...state.trainings, training],
    })),
  
  addInspection: (inspection) =>
    set((state) => ({
      inspections: [...state.inspections, inspection],
    })),
  
  updateInspection: (id, data) =>
    set((state) => ({
      inspections: state.inspections.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    })),
}));
