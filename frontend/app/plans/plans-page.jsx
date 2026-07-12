'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Modal, Form, Input, DatePicker, Select, Tag, message, Space, Card, Radio, Checkbox, Switch, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, AlertOutlined, UnorderedListOutlined, CalendarTwoTone } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;

const planTypes = [
  { value: 'daily', label: '每日计划', icon: <CalendarOutlined /> },
  { value: 'weekly', label: '每周计划', icon: <CalendarTwoTone /> },
];

const weekDays = [
  { value: 'Monday', label: '周一' },
  { value: 'Tuesday', label: '周二' },
  { value: 'Wednesday', label: '周三' },
  { value: 'Thursday', label: '周四' },
  { value: 'Friday', label: '周五' },
  { value: 'Saturday', label: '周六' },
  { value: 'Sunday', label: '周日' },
];

const subjectColors = {
  '数学': 'blue', '英语': 'green', '编程': 'purple', '语文': 'cyan', '物理': 'orange', '化学': 'pink', '生物': 'lime', '历史': 'gold', '地理': 'geekblue', '其他': 'default',
};

export default function PlansPageComponent() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans', { cache: false });
      setPlans(res.data.data || []);
    } catch {
      message.error('加载计划失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        type: values.type,
        subject: values.subject,
        duration: values.duration,
        time: values.time?.format('HH:mm') || null,
        date: values.date?.format('YYYY-MM-DD') || null,
        days: values.days || [],
        reminder: values.reminder,
        completed: false,
      };

      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, payload);
        message.success('更新成功');
      } else {
        await api.post('/plans', payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingPlan(null);
      fetchPlans();
    } catch {
      message.error('保存失败');
    }
  }, [editingPlan, form, fetchPlans]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/plans/${id}`);
      message.success('删除成功');
      fetchPlans();
    } catch {
      message.error('删除失败');
    }
  }, [fetchPlans]);

  const handleComplete = useCallback(async (id) => {
    try {
      await api.put(`/plans/${id}`, { completed: true });
      message.success('已完成');
      fetchPlans();
    } catch {
      message.error('操作失败');
    }
  }, [fetchPlans]);

  const handleEdit = useCallback((plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      time: plan.time ? dayjs(plan.time, 'HH:mm') : null,
      date: plan.date ? dayjs(plan.date) : null,
    });
    setModalOpen(true);
  }, [form]);

  const filteredPlans = useMemo(() => {
    let result = plans.filter(p => p.type === activeTab);
    if (activeTab === 'daily') {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      result = result.filter(p => p.date === dateStr);
    }
    return result;
  }, [plans, activeTab, selectedDate]);

  const stats = useMemo(() => {
    const total = filteredPlans.length;
    const completed = filteredPlans.filter(p => p.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [filteredPlans]);

  const todayPlans = useMemo(() => {
    return plans.filter(p => 
      p.type === 'daily' && 
      p.date === dayjs().format('YYYY-MM-DD') && 
      !p.completed
    );
  }, [plans]);

  const handleNewPlan = useCallback(() => {
    form.resetFields();
    setEditingPlan(null);
    setModalOpen(true);
  }, [form]);

  return (
    <RequireAuth>
      <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
        <Title level={3} style={{ margin: 0 }}>学习计划</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleNewPlan}>
          新建计划
        </Button>
      </div>

      {todayPlans.length > 0 && (
        <Card 
          style={{ marginBottom: 16, borderLeft: '4px solid #1890ff' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <span>今日待完成计划</span>
              <Tag color="blue">{todayPlans.length}项</Tag>
            </div>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {todayPlans.map(plan => (
              <div 
                key={plan.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '8px 16px', 
                  background: '#f5f5f5', 
                  borderRadius: 8,
                }}
              >
                <Tag color={subjectColors[plan.subject] || 'default'}>{plan.subject}</Tag>
                <span>{plan.title}</span>
                <span style={{ color: '#999', fontSize: 12 }}>{plan.time}</span>
                <Button size="small" onClick={() => handleComplete(plan.id)}>完成</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic title="计划总数" value={stats.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic title="已完成" value={stats.completed} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic title="进行中" value={stats.pending} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic 
              title="完成率" 
              value={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0} 
              suffix="%" 
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Radio.Group value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
            <Radio.Button value="daily">每日计划</Radio.Button>
            <Radio.Button value="weekly">每周计划</Radio.Button>
          </Radio.Group>
          {activeTab === 'daily' && (
            <DatePicker 
              value={selectedDate} 
              onChange={(date) => setSelectedDate(date)}
              style={{ width: 200 }}
            />
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {filteredPlans.map(plan => (
          <Card
            key={plan.id}
            hoverable
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {plan.completed ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                  )}
                  <span style={{ textDecoration: plan.completed ? 'line-through' : 'none' }}>{plan.title}</span>
                </div>
                <Tag color={subjectColors[plan.subject] || 'default'}>{plan.subject}</Tag>
              </div>
            }
            extra={
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(plan)} />
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(plan.id)} />
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: '#999' }} />
                {plan.type === 'daily' ? (
                  <span>{plan.date || '未设置日期'}</span>
                ) : (
                  <span>{plan.days.map(d => weekDays.find(w => w.value === d)?.label).join('、')}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#999' }} />
                <span>{plan.time || '未设置时间'}</span>
                <span style={{ marginLeft: 'auto', color: '#666' }}>{plan.duration}分钟</span>
              </div>
              {plan.reminder && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertOutlined style={{ color: '#faad14' }} />
                  <span style={{ color: '#666', fontSize: 12 }}>提前{plan.reminder}分钟提醒</span>
                </div>
              )}
              {!plan.completed && (
                <Button 
                  type="primary" 
                  block 
                  onClick={() => handleComplete(plan.id)}
                >
                  完成计划
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <p style={{ color: '#999' }}>暂无{activeTab === 'daily' ? '每日' : '每周'}计划</p>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewPlan}>
            创建计划
          </Button>
        </Card>
      )}

      <Modal
        title={editingPlan ? '编辑计划' : '新建计划'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingPlan(null); }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="计划标题" rules={[{ required: true, message: '请输入计划标题' }]}>
            <Input placeholder="如：学习数学第三章" />
          </Form.Item>
          <Form.Item name="type" label="计划类型">
            <Radio.Group defaultValue="daily">
              <Radio value="daily">每日计划</Radio>
              <Radio value="weekly">每周计划</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="subject" label="学科">
            <Select placeholder="选择学科">
              {Object.keys(subjectColors).map(s => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="时长（分钟）">
            <Input type="number" placeholder="60" />
          </Form.Item>
          <Form.Item name="time" label="时间">
            <DatePicker picker="time" format="HH:mm" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: ({ getFieldValue }) => getFieldValue('type') === 'daily', message: '请选择日期' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="days" label="重复日期" rules={[{ required: ({ getFieldValue }) => getFieldValue('type') === 'weekly', message: '请选择重复日期' }]}>
            <Select mode="multiple" placeholder="选择周几">
              {weekDays.map(d => (
                <Select.Option key={d.value} value={d.value}>{d.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reminder" label="提醒">
            <Select placeholder="不提醒">
              <Select.Option value="5">提前5分钟</Select.Option>
              <Select.Option value="15">提前15分钟</Select.Option>
              <Select.Option value="30">提前30分钟</Select.Option>
              <Select.Option value="60">提前1小时</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSave}>保存</Button>
              <Button onClick={() => { setModalOpen(false); setEditingPlan(null); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </RequireAuth>
  );
}
