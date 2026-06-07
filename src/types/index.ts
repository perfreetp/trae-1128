export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  department: string;
  phone: string;
  active: boolean;
  avatar?: string;
}

export interface DeviceCategory {
  id: string;
  name: string;
  description: string;
}

export interface Lab {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export type DeviceStatus = 'available' | 'in_use' | 'maintenance' | 'faulty' | 'calibrating';

export interface Device {
  id: string;
  name: string;
  serialNo: string;
  categoryId: string;
  labId: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  status: DeviceStatus;
  location: string;
  hourlyRate: number;
  image?: string;
  lastCalibration?: string;
  calibrationCycleDays?: number;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  userId: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  approvalComment?: string;
  createdAt: string;
  actualStartTime?: string;
  actualEndTime?: string;
  usageDuration?: number;
  totalCost?: number;
}

export interface UsageRecord {
  id: string;
  reservationId: string;
  deviceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  deviceStatus: DeviceStatus;
  remarks?: string;
  recordedAt: string;
  recordedBy: string;
}

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'closed';

export interface WorkOrder {
  id: string;
  deviceId: string;
  reporterId: string;
  assigneeId?: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  workOrderId: string;
  handlerId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  specification: string;
  stock: number;
  unit: string;
}

export interface MaterialUsage {
  id: string;
  workOrderId: string;
  materialId: string;
  quantity: number;
  notes?: string;
}

export interface Calibration {
  id: string;
  deviceId: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  calibrator: string;
  result: 'passed' | 'failed' | 'pending';
  certificateNo?: string;
}

export interface Inspection {
  id: string;
  inspectorId: string;
  title: string;
  inspectionDate: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes?: string;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  deviceId: string;
  checkItem: string;
  result: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface Training {
  id: string;
  deviceId: string;
  userId: string;
  trainingDate: string;
  trainer: string;
  result: 'passed' | 'failed';
  expiryDate?: string;
}

export interface Violation {
  id: string;
  userId: string;
  deviceId: string;
  description: string;
  violationDate: string;
  penalty: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  important: boolean;
}

export interface Statistics {
  totalDevices: number;
  availableDevices: number;
  faultyDevices: number;
  maintenanceDevices: number;
  utilizationRate: number;
  monthlyReservations: number[];
  categoryDistribution: { name: string; value: number }[];
  labUtilization: { lab: string; rate: number }[];
}
