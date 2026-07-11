'use client';

import { useState, useEffect, useMemo } from 'react';
import { Typography, Button, List, Modal, Form, Input, DatePicker, Select, Tag, Checkbox, message, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;

const priorityConfig = {
  high: { color: 'red', label: '高' },
  medium: { color: 'orange', label: '中' },
  low: { color: 'green', label: '低' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data.data || []);
    } catch {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        priority: values.priority || 'medium',
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
      };
      await api.post('/api/tasks', payload);
      message.success('任务创建成功');
      setModalOpen(false);
      form.resetFields();
      fetchTasks();
    } catch (err) {
      console.error('创建任务失败:', err);
      message.error('创建失败');
    }
  };

  const handleToggle = async (task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { completed: !task.completed });
      fetchTasks();
    } catch {
      message.error('更新失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      message.success('删除成功');
      fetchTasks();
    } catch {
      message.error('删除失败');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    
    result = result.filter(task => {
      const matchSearch = !searchText || task.title.toLowerCase().includes(searchText.toLowerCase());
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
  }, [tasks, searchText, selectedStatus, selectedPriority, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.due_date && dayjs(t.due_date).isBefore(dayjs(), 'day')).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>任务管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
            新建任务
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{stats.total}</div>
                <div style={{ fontSize: 12, color: '#999' }}>总任务</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{stats.pending}</div>
                <div style={{ fontSize: 12, color: '#999' }}>待完成</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{stats.completed}</div>
                <div style={{ fontSize: 12, color: '#999' }}>已完成</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>{stats.overdue}</div>
                <div style={{ fontSize: 12, color: '#999' }}>已逾期</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Space>
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
            </Space>
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

        <List
          loading={loading}
          dataSource={filteredAndSortedTasks}
          locale={{ emptyText: '暂无任务，创建一个吧' }}
          renderItem={(task) => {
            const isOverdue = !task.completed && task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
            return (
              <Card 
                hoverable 
                style={{ marginBottom: 8, borderLeft: `3px solid ${isOverdue ? '#ff4d4f' : (task.completed ? '#52c41a' : priorityConfig[task.priority]?.color || '#faad14')}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox checked={task.completed} onChange={() => handleToggle(task)} />
                  <div style={{ flex: 1, marginLeft: 12 }}>
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#999' : '#333', fontSize: 16 }}>
                      {task.title}
                    </span>
                    <Space style={{ marginTop: 4 }}>
                      <Tag color={priorityConfig[task.priority]?.color}>{priorityConfig[task.priority]?.label || '中'}</Tag>
                      {task.completed && <Tag color="green">已完成</Tag>}
                      {isOverdue && <Tag color="red">已逾期</Tag>}
                      {task.due_date && (
                        <span style={{ color: isOverdue ? '#ff4d4f' : '#999', fontSize: 12 }}>
                          截止：{dayjs(task.due_date).format('YYYY-MM-DD')}
                        </span>
                      )}
                    </Space>
                  </div>
                  <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(task.id)} />
                </div>
              </Card>
            );
          }}
        />

        <Modal title="新建任务" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)}>
          <Form form={form} layout="vertical" initialValues={{ priority: 'medium' }}>
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
          </Form>
        </Modal>
      </div>
    </RequireAuth>
  );
}

function Row({ gutter, children, style }) {
  return <div style={{ display: 'flex', gap: `${gutter}px`, ...style }}>{children}</div>;
}

function Col({ span, children }) {
  return <div style={{ flex: `0 0 ${(span / 24) * 100}%`, maxWidth: `${(span / 24) * 100}%` }}>{children}</div>;
}