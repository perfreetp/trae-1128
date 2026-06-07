export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    available: '空闲',
    in_use: '使用中',
    maintenance: '维护中',
    faulty: '故障',
    calibrating: '校准中',
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    cancelled: '已取消',
    completed: '已完成',
    assigned: '已派单',
    processing: '处理中',
    closed: '已关闭',
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
    scheduled: '计划中',
    in_progress: '进行中',
    passed: '通过',
    failed: '未通过',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    faulty: 'bg-red-100 text-red-700',
    calibrating: 'bg-purple-100 text-purple-700',
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    completed: 'bg-green-100 text-green-700',
    assigned: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-700',
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
