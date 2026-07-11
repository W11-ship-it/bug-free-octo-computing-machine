'use client';

import { Card, Col, Row, Statistic, Typography, List, Tag } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../lib/api';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({ notes: 0, tasks: 0, completed: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [notesRes, tasksRes] = await Promise.all([
          api.get('/api/notes'),
          api.get('/api/tasks'),
        ]);
        const notes = notesRes.data.data || [];
        const tasks = tasksRes.data.data || [];
        setStats({
          notes: notes.length,
          tasks: tasks.length,
          completed: tasks.filter((t) => t.completed).length,
        });
        setRecentNotes(notes.slice(0, 5));
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <Title level={3}>学习仪表盘</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="学习笔记" value={stats.notes} prefix={<BookOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="待办任务" value={stats.tasks - stats.completed} prefix={<ClockCircleOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="已完成任务" value={stats.completed} prefix={<CheckCircleOutlined />} loading={loading} />
          </Card>
        </Col>
      </Row>
      <Card title="最近笔记">
        <List
          loading={loading}
          dataSource={recentNotes}
          locale={{ emptyText: '暂无笔记，去创建一个吧' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <Tag color="blue">{item.subject || '未分类'}</Tag>
                    {item.created_at && new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
