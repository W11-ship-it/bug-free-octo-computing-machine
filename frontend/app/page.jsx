'use client';

import { Card, Col, Row, Statistic, Typography, List, Tag, Progress, Avatar } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, RiseOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import RequireAuth from '../lib/require-auth';
import { useAuth } from '../lib/auth-context';

const { Title } = Typography;

const priorityColors = { high: 'red', medium: 'orange', low: 'green' };
const priorityLabels = { high: '高', medium: '中', low: '低' };

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ notes: 0, tasks: 0, completed: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [subjectStats, setSubjectStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
        setRecentTasks(tasks.slice(0, 5));
        
        const subjectCounts = {};
        notes.forEach(note => {
          const subject = note.subject || '未分类';
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
        setSubjectStats(subjectCounts);
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completionRate = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;
  const username = token ? JSON.parse(atob(token.split('.')[1])).username : '用户';

  const subjectColors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan'];

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>学习仪表盘</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ fontSize: 14 }}>{username}</span>
          </div>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card hoverable>
              <Statistic title="学习笔记" value={stats.notes} prefix={<BookOutlined />} loading={loading} />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic title="待办任务" value={stats.tasks - stats.completed} prefix={<ClockCircleOutlined />} loading={loading} />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic title="已完成" value={stats.completed} prefix={<CheckCircleOutlined />} loading={loading} />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic title="完成率" value={completionRate} suffix="%" prefix={<RiseOutlined />} loading={loading} />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="任务完成进度" loading={loading}>
              <Progress percent={completionRate} showInfo={false} strokeColor={{
                '0%': '#FF6B6B',
                '50%': '#FFD93D',
                '100%': '#6BCB77',
              }} />
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#FF6B6B' }}>待完成: {stats.tasks - stats.completed}</span>
                <span style={{ color: '#6BCB77' }}>已完成: {stats.completed}</span>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="学科分布" loading={loading}>
              {Object.keys(subjectStats).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.entries(subjectStats).map(([subject, count], index) => (
                    <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', backgroundColor: '#f5f5f5', borderRadius: 16 }}>
                      <Tag color={subjectColors[index % subjectColors.length]}>{subject}</Tag>
                      <span style={{ fontSize: 12 }}>{count}篇</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无笔记数据</p>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="最近笔记" extra={<Tag color="blue">最新</Tag>} loading={loading}>
              <List
                dataSource={recentNotes}
                locale={{ emptyText: '暂无笔记，去创建一个吧' }}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} size={36} />}
                      title={item.title}
                      description={
                        <>
                          <Tag color="blue">{item.subject || '未分类'}</Tag>
                          {item.created_at && <span style={{ marginLeft: 8, color: '#999' }}>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="最近任务" extra={<Tag color="orange">待办</Tag>} loading={loading}>
              <List
                dataSource={recentTasks}
                locale={{ emptyText: '暂无任务，创建一个吧' }}
                renderItem={(task) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#999' : '#333' }}>
                        {task.title}
                      </span>
                      <div style={{ marginTop: 4 }}>
                        <Tag color={priorityColors[task.priority] || 'default'}>{priorityLabels[task.priority] || '中'}</Tag>
                        {task.completed && <Tag color="green" style={{ marginLeft: 8 }}>已完成</Tag>}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </RequireAuth>
  );
}