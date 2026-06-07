import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Download, TrendingUp, PieChart, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { mockStatistics, mockLabs } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import StatCard from '@/components/StatCard';
import { formatDateTime } from '@/utils';

export default function Statistics() {
  const { reservations, devices, users, workOrders, usageRecords } = useAppStore();
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = useState('month');

  const generateCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const filteredReservations = reservations.filter((r) => {
      if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(r.createdAt) >= weekAgo;
      }
      if (dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(r.createdAt) >= monthAgo;
      }
      if (dateRange === 'quarter') {
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return new Date(r.createdAt) >= quarterAgo;
      }
      return true;
    });

    const filteredWorkOrders = workOrders.filter((w) => {
      if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(w.createdAt) >= weekAgo;
      }
      if (dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(w.createdAt) >= monthAgo;
      }
      if (dateRange === 'quarter') {
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return new Date(w.createdAt) >= quarterAgo;
      }
      return true;
    });

    const deviceUtilizationHeaders = ['设备名称', '型号', '所属实验室', '使用次数', '总时长(小时)', '利用率(%)', '产生费用(元)'];
    const deviceUtilizationRows = devices.map((device) => {
      const lab = mockLabs.find((l) => l.id === device.labId);
      const deviceReservations = filteredReservations.filter((r) => r.deviceId === device.id && r.status !== 'rejected' && r.status !== 'cancelled');
      const usageCount = deviceReservations.length;
      const totalHours = deviceReservations.reduce((sum, r) => {
        if (r.usageDuration) return sum + r.usageDuration;
        return sum + Math.max(1, Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / (1000 * 60 * 60)));
      }, 0);
      const utilization = Math.min(100, Math.round((totalHours / (30 * 8)) * 100));
      const revenue = deviceReservations.reduce((sum, r) => sum + (r.totalCost || 0), 0);
      return [device.name, device.model, lab?.name || '', usageCount, totalHours, utilization, revenue];
    });

    const reservationHeaders = ['预约编号', '申请人', '设备名称', '预约时间', '实际使用时间', '用途', '状态', '时长(小时)', '费用(元)'];
    const reservationRows = filteredReservations.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      const device = devices.find((d) => d.id === r.deviceId);
      return [
        r.id,
        user?.name || '',
        device?.name || '',
        `${formatDateTime(r.startTime)} - ${formatDateTime(r.endTime)}`,
        r.actualStartTime ? `${formatDateTime(r.actualStartTime)} - ${formatDateTime(r.actualEndTime || '')}` : '',
        r.purpose,
        getStatusText(r.status),
        r.usageDuration || Math.max(1, Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / (1000 * 60 * 60))),
        r.totalCost || 0,
      ];
    });

    const billingHeaders = ['设备名称', '使用次数', '总时长(小时)', '总费用(元)', '平均每小时费用(元)'];
    const billingRows = devices.map((device) => {
      const deviceReservations = filteredReservations.filter((r) => r.deviceId === device.id && (r.status === 'completed' || r.status === 'approved'));
      const usageCount = deviceReservations.length;
      const totalHours = deviceReservations.reduce((sum, r) => sum + (r.usageDuration || 0), 0);
      const totalCost = deviceReservations.reduce((sum, r) => sum + (r.totalCost || 0), 0);
      const avgCost = totalHours > 0 ? Math.round(totalCost / totalHours) : 0;
      return [device.name, usageCount, totalHours, totalCost, avgCost];
    }).filter((row) => Number(row[1]) > 0);

    const maintenanceHeaders = ['工单号', '设备名称', '报修人', '处理人', '优先级', '状态', '创建时间', '完成时间'];
    const maintenanceRows = filteredWorkOrders.map((w) => {
      const device = devices.find((d) => d.id === w.deviceId);
      const reporter = users.find((u) => u.id === w.reporterId);
      const assignee = w.assigneeId ? users.find((u) => u.id === w.assigneeId) : null;
      return [
        w.id,
        device?.name || '',
        reporter?.name || '',
        assignee?.name || '',
        getPriorityText(w.priority),
        getWorkOrderStatusText(w.status),
        formatDateTime(w.createdAt),
        w.completedAt ? formatDateTime(w.completedAt) : '',
      ];
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    generateCSV(deviceUtilizationHeaders, deviceUtilizationRows, `设备利用率报表_${timestamp}`);
    setTimeout(() => generateCSV(reservationHeaders, reservationRows, `预约明细报表_${timestamp}`), 300);
    setTimeout(() => generateCSV(billingHeaders, billingRows, `计费汇总报表_${timestamp}`), 600);
    setTimeout(() => generateCSV(maintenanceHeaders, maintenanceRows, `维修情况报表_${timestamp}`), 900);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已驳回',
      cancelled: '已取消',
      completed: '已完成',
    };
    return map[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return map[priority] || priority;
  };

  const getWorkOrderStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待派单',
      assigned: '已派单',
      processing: '处理中',
      completed: '已完成',
      closed: '已关闭',
    };
    return map[status] || status;
  };

  useEffect(() => {
    if (barChartRef.current) {
      const chart = echarts.init(barChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLine: { lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280' },
          splitLine: { lineStyle: { color: '#F3F4F6' } },
        },
        series: [{
          data: mockStatistics.monthlyReservations,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#60A5FA' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '50%',
        }],
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        chart.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (pieChartRef.current) {
      const chart = echarts.init(pieChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [{
          name: '设备类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
          data: mockStatistics.categoryDistribution.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index],
            },
          })),
        }],
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        chart.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (lineChartRef.current) {
      const chart = echarts.init(lineChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: mockStatistics.labUtilization.map((d) => d.lab),
          axisLine: { lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280', rotate: 0 },
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLine: { lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280', formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#F3F4F6' } },
        },
        series: [{
          data: mockStatistics.labUtilization.map((d) => d.rate),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#10B981', width: 3 },
          itemStyle: { color: '#10B981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ]),
          },
        }],
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        chart.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const totalRevenue = reservations
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
          <p className="text-gray-500 mt-1">设备利用率、计费统计与数据报表</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="设备利用率"
          value={`${mockStatistics.utilizationRate}%`}
          icon={TrendingUp}
          color="green"
          trend="5.2% 较上月"
          trendUp
        />
        <StatCard
          title="总预约次数"
          value={reservations.length}
          icon={Calendar}
          color="blue"
          trend="12% 较上月"
          trendUp
        />
        <StatCard
          title="共享计费"
          value={`¥${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
          trend="8.5% 较上月"
          trendUp
        />
        <StatCard
          title="活跃用户"
          value={users.filter((u) => u.active).length}
          icon={BarChart3}
          color="purple"
          trend="3 人"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">月度预约趋势</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div ref={barChartRef} className="h-72" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">设备类型分布</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div ref={pieChartRef} className="h-72" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">各实验室利用率</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div ref={lineChartRef} className="h-72" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">设备使用排行</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">所属实验室</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用时长</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">利用率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devices.slice(0, 5).map((device, index) => {
                const lab = mockLabs.find((l) => l.id === device.labId);
                const usageCount = reservations.filter((r) => r.deviceId === device.id && r.status !== 'rejected' && r.status !== 'cancelled').length;
                const utilization = Math.floor(Math.random() * 30 + 50);
                return (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{device.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lab?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usageCount} 次</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usageCount * 4} 小时</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{utilization}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
