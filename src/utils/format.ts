export function formatCurrency(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return `${days}天${remainHours > 0 ? remainHours + '小时' : ''}`;
}

export function formatStock(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    low_stock: '低库存',
    fault: '故障',
    maintenance: '维护中',
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    assigned: '已派单',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    success: '支付成功',
    failed: '支付失败',
    refunded: '已退款',
  };
  return map[status] || status;
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    online: 'badge-success',
    low_stock: 'badge-warning',
    fault: 'badge-danger',
    offline: 'badge-neutral',
    maintenance: 'badge-neutral',
    pending: 'badge-warning',
    processing: 'badge-primary',
    resolved: 'badge-success',
    assigned: 'badge-primary',
    in_progress: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-neutral',
    success: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
}

export function getSeverityText(severity: string): string {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
    urgent: '紧急',
  };
  return map[severity] || severity;
}

export function getSeverityClass(severity: string): string {
  const map: Record<string, string> = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
    critical: 'badge-danger',
    urgent: 'badge-danger',
  };
  return map[severity] || 'badge-neutral';
}

export function getTaskTypeText(type: string): string {
  const map: Record<string, string> = {
    replenishment: '补货',
    maintenance: '维修',
    inspection: '巡检',
    price_adjustment: '调价',
  };
  return map[type] || type;
}

export function getExceptionTypeText(type: string): string {
  const map: Record<string, string> = {
    device_fault: '设备故障',
    payment_error: '支付异常',
    temperature_abnormal: '温度异常',
    network_error: '网络故障',
  };
  return map[type] || type;
}
