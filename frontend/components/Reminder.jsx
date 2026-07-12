'use client';

import { useState, useEffect, useCallback } from 'react';
import { notification, Button, Badge, message } from 'antd';
import { BellOutlined, AlertOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../lib/auth-context';

const api = {
  get: async (url, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { headers, ...config });
    return { data: await response.json() };
  },
  put: async (url, data, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify(data),
      ...config 
    });
    return { data: await response.json() };
  },
};

export default function Reminder() {
  const { isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [count, setCount] = useState(0);

  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated) {
      setReminders([]);
      setCount(0);
      return;
    }

    try {
      const now = dayjs();
      const [tasksRes, plansRes] = await Promise.all([
        api.get('/tasks', { cache: 'no-store' }),
        api.get('/plans', { cache: 'no-store' }),
      ]);

      const tasks = tasksRes.data.data || [];
      const plans = plansRes.data.data || [];

      const newReminders = [];

      tasks.forEach(task => {
        if (!task.completed && task.due_date) {
          const dueDate = dayjs(task.due_date);
          const diffHours = dueDate.diff(now, 'hour');

          if (diffHours <= 24 && diffHours > 0) {
            newReminders.push({
              id: `task-${task.id}`,
              type: 'task',
              title: task.title,
              message: `任务即将到期：${dueDate.format('YYYY-MM-DD')}`,
              time: dueDate,
              icon: <AlertOutlined />,
              color: '#ff4d4f',
            });
          } else if (diffHours <= 0) {
            newReminders.push({
              id: `task-${task.id}`,
              type: 'task',
              title: task.title,
              message: `任务已逾期：${dueDate.format('YYYY-MM-DD')}`,
              time: dueDate,
              icon: <AlertOutlined />,
              color: '#ff7875',
            });
          }
        }
      });

      plans.forEach(plan => {
        if (!plan.completed && plan.time) {
          let planTime;
          if (plan.type === 'daily' && plan.date) {
            planTime = dayjs(`${plan.date} ${plan.time}`);
          } else {
            const today = dayjs().format('YYYY-MM-DD');
            planTime = dayjs(`${today} ${plan.time}`);
          }

          const diffMinutes = planTime.diff(now, 'minute');

          if (diffMinutes <= 30 && diffMinutes > 0) {
            newReminders.push({
              id: `plan-${plan.id}`,
              type: 'plan',
              title: plan.title,
              message: `学习计划即将开始：${plan.time}`,
              time: planTime,
              icon: <ClockCircleOutlined />,
              color: '#1890ff',
            });
          }
        }
      });

      newReminders.sort((a, b) => a.time.diff(b.time));
      setReminders(newReminders);
      setCount(newReminders.length);
    } catch (error) {
      if (error.response) {
        console.error('获取提醒失败:', error.response.data);
        if (error.response.status === 401) {
          message.warning('登录状态已失效，请重新登录');
        } else if (error.response.status >= 500) {
          message.error('服务器错误，无法获取提醒');
        } else {
          message.error('获取提醒失败');
        }
      } else if (error.request) {
        console.error('获取提醒失败 - 网络错误:', error.message);
        message.warning('网络连接异常，请检查网络');
      } else {
        console.error('获取提醒失败:', error.message);
        message.error('获取提醒失败');
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  const openNotification = useCallback(() => {
    if (reminders.length === 0) {
      notification.info({
        message: '暂无提醒',
        description: '当前没有即将到期的任务或计划',
      });
      return;
    }

    reminders.forEach(reminder => {
      notification.open({
        message: reminder.title,
        description: reminder.message,
        icon: reminder.icon,
        style: {
          borderLeft: `4px solid ${reminder.color}`,
        },
        duration: 10,
      });
    });
  }, [reminders]);

  const markAsRead = useCallback(async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      if (reminder.type === 'task') {
        const taskId = id.split('-')[1];
        try {
          await api.put(`/tasks/${taskId}`, { completed: true });
          message.success('任务已完成');
        } catch {
          message.error('操作失败');
        }
      } else {
        const planId = id.split('-')[1];
        try {
          await api.put(`/plans/${planId}`, { completed: true });
          message.success('计划已完成');
        } catch {
          message.error('操作失败');
        }
      }
      fetchReminders();
    }
  }, [reminders, fetchReminders]);

  return (
    <div>
      <Badge count={count} overflowCount={99}>
        <Button 
          icon={<BellOutlined />} 
          onClick={openNotification}
          style={{ marginRight: 8 }}
        >
          提醒
        </Button>
      </Badge>

      {count > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          background: '#fff', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
          borderRadius: 8,
          padding: 16,
          maxWidth: 360,
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOutlined style={{ color: '#1890ff', fontSize: 18 }} />
              <span style={{ fontWeight: 'bold' }}>学习提醒</span>
              <Badge count={count} />
            </div>
            <Button size="small" onClick={() => setCount(0)}>关闭</Button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {reminders.slice(0, 5).map(reminder => (
              <div 
                key={reminder.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: 8,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    backgroundColor: `${reminder.color}15`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: reminder.color }}>{reminder.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{reminder.title}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>{reminder.message}</div>
                </div>
                <Button size="small" onClick={() => markAsRead(reminder.id)}>
                  <CheckCircleOutlined />
                </Button>
              </div>
            ))}
          </div>
          {reminders.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 8, color: '#999', fontSize: 12 }}>
              还有 {reminders.length - 5} 条提醒...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
