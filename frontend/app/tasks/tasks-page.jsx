'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, List, Modal, Form, Input, DatePicker, Select, Tag, Checkbox, message, Space, Card, Radio, Popconfirm, Statistic } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UpOutlined, DownOutlined, ClockCircleOutlined, BellOutlined, RepeatOutlined, CheckCircleOutlined, UndoOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';

const { Title } = Typography;

const priorityColors = { high: 'red', medium: 'orange', low: 'green' };
const priorityLabels = { high: '高', medium: '中', low: '低' };

function Row({ gutter = 16, children, style }) {
  return <div style={{ display: 'flex', gap: `${gutter}px`, ...style }}>{children}</div>;
}

function Col({ span, children }) {
  return <div style={{ flex: `0 0 ${(span / 24) * 100}%`, maxWidth: `${(span / 24) * 100}%` }}>{children}</div>;
}

const TaskCard = memo(function TaskCard({ task, onEdit, onDelete, onComplete, selected, onSelect }) {
  const isOverdue = !task.completed && task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
  
  return (
    <Card
      key={task.id}
      hoverable
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onSelect && <Checkbox checked={selected} onChange={() => onSelect(task.id)} style={{ marginRight: 8 }} />}
          {task.completed ? <span style={{ textDecoration: 'line-through', color: '#999' }}>{task.title}</span> : task.title}
        </div>
      }
      style={{ cursor: 'pointer' }}
      extra={
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); onEdit(task); }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} />
        </Space>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Tag color={priorityColors[task.priority] || 'default'}>{priorityLabels[task.priority] || '未知'}</Tag>
        {task.due_date && (
          <span style={{ color: isOverdue ? '#ff4d4f' : '#666', fontSize: 12 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {dayjs(task.due_date).format('YYYY-MM-DD')}
            {isOverdue && <span style={{ marginLeft: 4 }}>(已逾期)</span>}
          </span>
        )}
        {task.completed ? (
          <Tag color="green">已完成</Tag>
        ) : (
          <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}>
            完成
          </Button>
        )}
      </div>
      <p style={{ color: '#999', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
        创建时间：{task.created_at && new Date(task.created_at).toLocaleDateString('zh-CN')}
      </p>
    </Card>
  );
});

export default function TasksPageComponent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
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
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/login');
    }
  }, [authChecked, isAuthenticated, router]);

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

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(search));
    }
    
    if (selectedStatus) {
      result = result.filter(t => t.completed === (selectedStatus === 'completed'));
    }
    
    if (selectedPriority) {
      result = result.filter(t => t.priority === selectedPriority);
    }
    
    if (activeTab === 'today') {
      result = result.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isSame(dayjs(), 'day'));
    } else if (activeTab === 'upcoming') {
      result = result.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isAfter(dayjs(), 'day'));
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.completed);
    }
    
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    return result;
  }, [tasks, debouncedSearch, selectedStatus, selectedPriority, sortField, sortOrder, activeTab]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isBefore(dayjs(), 'day')).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        priority: values.priority || 'medium',
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        category: values.category,
        reminder: values.reminder,
      };

      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, payload);
        message.success('更新成功');
      } else {
        await api.post('/api/tasks', payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch {
      message.error('保存失败');
    }
  }, [editingTask, form, fetchTasks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      message.success('删除成功');
      fetchTasks();
    } catch {
      message.error('删除失败');
    }
  }, [fetchTasks]);

  const handleComplete = useCallback(async (id) => {
    try {
      await api.put(`/api/tasks/${id}`, { completed: true });
      message.success('任务完成');
      fetchTasks();
    } catch {
      message.error('操作失败');
    }
  }, [fetchTasks]);

  const handleBatchComplete = useCallback(async () => {
    try {
      await Promise.all(selectedIds.map(id => api.put(`/api/tasks/${id}`, { completed: true })));
      message.success(`已完成 ${selectedIds.length} 个任务`);
      setSelectedIds([]);
      fetchTasks();
    } catch {
      message.error('批量完成失败');
    }
  }, [selectedIds, fetchTasks]);

  const handleBatchDelete = useCallback(async () => {
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/tasks/${id}`)));
      message.success(`已删除 ${selectedIds.length} 个任务`);
      setSelectedIds([]);
      fetchTasks();
    } catch {
      message.error('批量删除失败');
    }
  }, [selectedIds, fetchTasks]);

  const handleEdit = useCallback((task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setModalOpen(true);
  }, [form]);

  const handleSelectAll = useCallback(() => {
    if (filteredTasks.length === selectedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map(t => t.id));
    }
  }, [selectedIds, filteredTasks]);

  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleRepeat = useCallback(async (task) => {
    try {
      let nextDate = dayjs(task.due_date);
      const repeatMap = { '1day': 1, '1week': 7, '1month': 30 };
      nextDate = nextDate.add(repeatMap[task.reminder] || 1, 'day');
      
      await api.post('/api/tasks', {
        title: task.title,
        priority: task.priority,
        due_date: nextDate.format('YYYY-MM-DD'),
        category: task.category,
        reminder: task.reminder,
      });
      message.success('已创建重复任务');
      fetchTasks();
    } catch {
      message.error('创建失败');
    }
  }, [fetchTasks]);

  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField, sortOrder]);

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

  if (!authChecked) return null;

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>任务管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewTask}>
            新建任务
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总任务" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已完成" value={stats.completed} suffix={`(${Math.round((stats.completed / stats.total) * 100)}%)`} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="进行中" value={stats.pending} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已逾期" value={stats.overdue} />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ alignItems: 'center' }}>
            <Col span={6}>
              <Input
                placeholder="搜索任务..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
              >
                <Select.Option value="">全部</Select.Option>
                <Select.Option value="pending">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="优先级"
                value={selectedPriority}
                onChange={setSelectedPriority}
                allowClear
              >
                <Select.Option value="">全部</Select.Option>
                <Select.Option value="high">高</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="low">低</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Radio.Group value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="today">今天</Radio.Button>
                <Radio.Button value="upcoming">即将到期</Radio.Button>
                <Radio.Button value="completed">已完成</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Card>

        {selectedIds.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <span>已选择 {selectedIds.length} 个任务</span>
            <Space style={{ marginLeft: 16 }}>
              <Button type="primary" onClick={handleBatchComplete}>批量完成</Button>
              <Button danger onClick={handleBatchDelete}>批量删除</Button>
              <Button onClick={() => setSelectedIds([])}>取消选择</Button>
            </Space>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>排序:</span>
          <Button.Group>
            <Button onClick={() => toggleSort('created_at')}>
              创建时间 {sortField === 'created_at' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
            </Button>
            <Button onClick={() => toggleSort('due_date')}>
              截止日期 {sortField === 'due_date' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
            </Button>
            <Button onClick={() => toggleSort('priority')}>
              优先级 {sortField === 'priority' && (sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />)}
            </Button>
          </Button.Group>
        </div>

        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={filteredTasks}
          loading={loading}
          renderItem={(task) => (
            <TaskCard
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
              selected={selectedIds.includes(task.id)}
              onSelect={handleSelect}
            />
          )}
        />

        <Modal
          title={editingTask ? '编辑任务' : '新建任务'}
          open={modalOpen}
          onCancel={() => { setModalOpen(false); setEditingTask(null); }}
          footer={null}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
              <Input placeholder="请输入任务标题" />
            </Form.Item>
            <Form.Item name="priority" label="优先级">
              <Select defaultValue="medium">
                <Select.Option value="high">高</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="low">低</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="due_date" label="截止日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="category" label="分类">
              <Input placeholder="如：学习、工作、生活" />
            </Form.Item>
            <Form.Item name="reminder" label="重复提醒">
              <Select placeholder="不重复">
                <Select.Option value="1day">每天</Select.Option>
                <Select.Option value="1week">每周</Select.Option>
                <Select.Option value="1month">每月</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave}>保存</Button>
                <Button onClick={() => { setModalOpen(false); setEditingTask(null); }}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}
