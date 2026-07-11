'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, List, Modal, Form, Input, DatePicker, Select, Tag, Checkbox, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>任务管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
            新建任务
          </Button>
        </div>
        <List
          loading={loading}
          dataSource={tasks}
          locale={{ emptyText: '暂无任务，创建一个吧' }}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Button key="del" icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(task.id)} />,
              ]}
            >
              <Checkbox checked={task.completed} onChange={() => handleToggle(task)} />
              <List.Item.Meta
                style={{ marginLeft: 12 }}
                title={
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                }
                description={
                  <Space>
                    <Tag color={priorityConfig[task.priority]?.color}>{priorityConfig[task.priority]?.label || '中'}</Tag>
                    {task.due_date && <span>截止：{dayjs(task.due_date).format('YYYY-MM-DD')}</span>}
                  </Space>
                }
              />
            </List.Item>
          )}
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