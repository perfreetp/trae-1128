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
  
  setCurrentUser: (user: User) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
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

  setCurrentUser: (user) => set({ currentUser: user }),
  
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
}));
