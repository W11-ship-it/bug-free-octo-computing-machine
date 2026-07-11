'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { memo } from 'react';
import { Typography, Button, List, Modal, Form, Input, DatePicker, Select, Tag, Checkbox, message, Space, Card, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UpOutlined, DownOutlined, ClockCircleOutlined, BellOutlined, RepeatOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;

const priorityConfig = {
  high: { color: 'red', label: '高' },
  medium: { color: 'orange', label: '中' },
  low: { color: 'green', label: '低' },
};

const repeatConfig = {
  none: { label: '不重复', icon: null },
  daily: { label: '每天', icon: '📅' },
  weekly: { label: '每周', icon: '📆' },
  monthly: { label: '每月', icon: '📊' },
};

const StatCard = memo(function StatCard({ title, value, color }) {
  return (
    <Card>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', color }}>{value}</div>
        <div style={{ fontSize: 12, color: '#999' }}>{title}</div>
      </div>
    </Card>
  );
});

const TaskCard = memo(function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const isOverdue = !task.completed && task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
  
  return (
    <Card 
      hoverable 
      style={{ marginBottom: 8, borderLeft: `3px solid ${isOverdue ? '#ff4d4f' : (task.completed ? '#52c41a' : priorityConfig[task.priority]?.color || '#faad14')}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox checked={task.completed} onChange={() => onToggle(task)} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#999' : '#333', fontSize: 16 }}>
            {task.title}
          </span>
          <Space style={{ marginTop: 4 }}>
            <Tag color={priorityConfig[task.priority]?.color}>{priorityConfig[task.priority]?.label || '中'}</Tag>
            {task.completed && <Tag color="green">已完成</Tag>}
            {isOverdue && <Tag color="red">已逾期</Tag>}
            {task.repeat && task.repeat !== 'none' && <Tag color="blue">{repeatConfig[task.repeat]?.label}</Tag>}
            {task.due_date && (
              <span style={{ color: isOverdue ? '#ff4d4f' : '#999', fontSize: 12 }}>
                截止：{dayjs(task.due_date).format('YYYY-MM-DD')}
              </span>
            )}
            {task.reminder && (
              <span style={{ color: '#1890ff', fontSize: 12, marginLeft: 4 }}>
                <BellOutlined style={{ fontSize: 12 }} /> {task.reminder}
              </span>
            )}
          </Space>
        </div>
        <Space>
          <Button icon={<UpOutlined />} size="small" onClick={() => onEdit(task)}>编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(task.id)} />
        </Space>
      </div>
    </Card>
  );
});

function Row({ gutter, children, style }) {
  return <div style={{ display: 'flex', gap: `${gutter}px`, ...style }}>{children}</div>;
}

function Col({ span, children }) {
  return <div style={{ flex: `0 0 ${(span / 24) * 100}%`, maxWidth: `${(span / 24) * 100}%` }}>{children}</div>;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('all');
  const searchTimeoutRef = useRef(null);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data.data || []);
    } catch {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        priority: values.priority || 'medium',
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        repeat: values.repeat || 'none',
        reminder: values.reminder || null,
      };
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, payload);
        message.success('任务更新成功');
      } else {
        await api.post('/api/tasks', payload);
        message.success('任务创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('操作失败:', err);
      message.error('操作失败');
    }
  }, [form, fetchTasks, editingTask]);

  const handleToggle = useCallback(async (task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { completed: !task.completed });
      if (task.repeat && task.repeat !== 'none' && !task.completed) {
        let nextDate = dayjs(task.due_date);
        if (task.repeat === 'daily') nextDate = nextDate.add(1, 'day');
        else if (task.repeat === 'weekly') nextDate = nextDate.add(1, 'week');
        else if (task.repeat === 'monthly') nextDate = nextDate.add(1, 'month');
        
        await api.post('/api/tasks', {
          title: task.title,
          priority: task.priority,
          due_date: nextDate.format('YYYY-MM-DD'),
          repeat: task.repeat,
          reminder: task.reminder,
        });
        message.info('重复任务已创建');
      }
      fetchTasks();
    } catch {
      message.error('更新失败');
    }
  }, [fetchTasks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      message.success('删除成功');
      fetchTasks();
    } catch {
      message.error('删除失败');
    }
  }, [fetchTasks]);

  const handleEdit = useCallback((task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      priority: task.priority,
      due_date: task.due_date ? dayjs(task.due_date) : null,
      repeat: task.repeat || 'none',
      reminder: task.reminder || null,
    });
    setModalOpen(true);
  }, [form]);

  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField, sortOrder]);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isSame(dayjs(), 'day'));
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isAfter(dayjs(), 'day'));
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    
    if (activeTab === 'today') {
      result = todayTasks;
    } else if (activeTab === 'upcoming') {
      result = upcomingTasks;
    }
    
    result = result.filter(task => {
      const matchSearch = !debouncedSearch || task.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchStatus = !selectedStatus || (selectedStatus === 'completed' ? task.completed : !task.completed);
      const matchPriority = !selectedPriority || task.priority === selectedPriority;
      return matchSearch && matchStatus && matchPriority;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'due_date') {
        comparison = (a.due_date || '').localeCompare(b.due_date || '');
      } else if (sortField === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        comparison = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      } else {
        comparison = (a.created_at || '').localeCompare(b.created_at || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, debouncedSearch, selectedStatus, selectedPriority, sortField, sortOrder, activeTab, todayTasks, upcomingTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isBefore(dayjs(), 'day')).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const handleNewTask = useCallback(() => {
    form.resetFields();
    setEditingTask(null);
    setModalOpen(true);
  }, [form]);

  const handleQuickAdd = useCallback((title) => {
    api.post('/api/tasks', {
      title,
      priority: 'medium',
      due_date: dayjs().format('YYYY-MM-DD'),
    }).then(() => {
      message.success('任务创建成功');
      fetchTasks();
    }).catch(() => {
      message.error('创建失败');
    });
  }, [fetchTasks]);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>任务管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewTask}>
            新建任务
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <StatCard title="总任务" value={stats.total} color="#1890ff" />
          </Col>
          <Col span={6}>
            <StatCard title="待完成" value={stats.pending} color="#faad14" />
          </Col>
          <Col span={6}>
            <StatCard title="已完成" value={stats.completed} color="#52c41a" />
          </Col>
          <Col span={6}>
            <StatCard title="已逾期" value={stats.overdue} color="#ff4d4f" />
          </Col>
        </Row>

        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Radio.Group value={activeTab} onChange={(e) => setActiveTab(e.target.value)} buttonStyle="solid">
              <Radio.Button value="all">全部任务</Radio.Button>
              <Radio.Button value="today">今日待办</Radio.Button>
              <Radio.Button value="upcoming">即将到期</Radio.Button>
            </Radio.Group>
            <div style={{ width: 1, height: 24, background: '#f0f0f0', margin: '0 8px' }} />
            <Input
              placeholder="搜索任务..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="pending">待完成</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
            <Select
              placeholder="优先级"
              value={selectedPriority}
              onChange={setSelectedPriority}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
            <div style={{ width: 1, height: 24, background: '#f0f0f0', margin: '0 8px' }} />
            <Space>
              <span style={{ color: '#999', fontSize: 12 }}>排序：</span>
              <Button
                type={sortField === 'created_at' ? 'primary' : 'default'}
                size="small"
                onClick={() => toggleSort('created_at')}
              >
                创建时间
                {sortField === 'created_at' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
              </Button>
              <Button
                type={sortField === 'due_date' ? 'primary' : 'default'}
                size="small"
                onClick={() => toggleSort('due_date')}
              >
                截止日期
                {sortField === 'due_date' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
              </Button>
              <Button
                type={sortField === 'priority' ? 'primary' : 'default'}
                size="small"
                onClick={() => toggleSort('priority')}
              >
                优先级
                {sortField === 'priority' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
              </Button>
            </Space>
            <span style={{ color: '#999', fontSize: 12 }}>
              共 {filteredAndSortedTasks.length} 条任务
            </span>
          </Space>
        </Card>

        {activeTab === 'today' && todayTasks.length > 0 && (
          <Card style={{ marginBottom: 16, borderColor: '#1890ff', borderWidth: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>今日待办 ({todayTasks.length})</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {todayTasks.slice(0, 5).map(task => (
                <Tag key={task.id} color={priorityConfig[task.priority]?.color} style={{ cursor: 'pointer', padding: '4px 12px' }} onClick={() => handleToggle(task)}>
                  {task.completed ? '✓ ' : ''}{task.title}
                </Tag>
              ))}
              {todayTasks.length > 5 && (
                <span style={{ color: '#999', fontSize: 12, display: 'flex', alignItems: 'center' }}>
                  +{todayTasks.length - 5} 更多
                </span>
              )}
            </div>
          </Card>
        )}

        <List
          loading={loading}
          dataSource={filteredAndSortedTasks}
          locale={{ emptyText: '暂无任务，创建一个吧' }}
          renderItem={(task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
          )}
        />

        <Modal title={editingTask ? '编辑任务' : '新建任务'} open={modalOpen} onOk={handleCreate} onCancel={() => { setModalOpen(false); setEditingTask(null); form.resetFields(); }}>
          <Form form={form} layout="vertical" initialValues={{ priority: 'medium', repeat: 'none' }}>
            <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="priority" label="优先级">
              <Select options={[
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ]} />
            </Form.Item>
            <Form.Item name="due_date" label="截止日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="repeat" label="重复设置">
              <Select options={[
                { value: 'none', label: '不重复' },
                { value: 'daily', label: '每天' },
                { value: 'weekly', label: '每周' },
                { value: 'monthly', label: '每月' },
              ]} />
            </Form.Item>
            <Form.Item name="reminder" label="提醒设置">
              <Select placeholder="选择提醒时间" allowClear>
                <Select.Option value="15min">提前15分钟</Select.Option>
                <Select.Option value="1hour">提前1小时</Select.Option>
                <Select.Option value="1day">提前1天</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RequireAuth>
  );
}