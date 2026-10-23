import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

interface UpdateLog {
  id: number;
  task_name: string;
  status: string;
  models_updated: number;
  models_failed: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export function DataUpdatePanel() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/update-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setLastUpdate(new Date());
        // Refresh logs
        fetchUpdateLogs();
      }
    } catch (error) {
      console.error('Failed to trigger update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchUpdateLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/updates/logs?limit=10`);
      if (response.ok) {
        const logs = await response.json();
        setUpdateLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch update logs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'started':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">数据更新管理</CardTitle>
          <Button
            onClick={handleManualUpdate}
            disabled={isUpdating}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? '更新中...' : '手动更新'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {lastUpdate && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ 上次更新时间: {lastUpdate.toLocaleString('zh-CN')}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">最近更新记录</h4>
          {updateLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无更新记录
            </p>
          ) : (
            <div className="space-y-2">
              {updateLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="text-sm font-medium">{log.task_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.started_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-green-600">{log.models_updated}</span> 成功
                      {log.models_failed > 0 && (
                        <span className="ml-2 text-red-600">{log.models_failed} 失败</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      耗时: {formatDuration(log.duration_seconds)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
