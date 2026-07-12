'use client';

import { Card, Col, Row, Statistic, Typography, List, Tag, Progress, Avatar, Button, Space } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, RiseOutlined, UserOutlined, ArrowRightOutlined, LineChartOutlined, BarChartOutlined, CalendarOutlined, AimOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const api = {
  get: async (url, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { headers, ...config });
    return { data: await response.json() };
  },
};
import StatCard from '../components/StatCard';
import RequireAuth from '../lib/require-auth';

const { Title } = Typography;

const priorityColors = { high: 'red', medium: 'orange', low: 'green' };
const priorityLabels = { high: '高', medium: '中', low: '低' };



const NoteItem = memo(function NoteItem({ item }) {
  return (
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
  );
});

const TaskItem = memo(function TaskItem({ task }) {
  return (
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
  );
});

function DashboardPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ notes: 0, tasks: 0, completed: 0, overdue: 0, highPriority: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [subjectStats, setSubjectStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [notesRes, tasksRes] = await Promise.all([
        api.get('/notes'),
        api.get('/tasks'),
      ]);
      const notes = notesRes.data.data || [];
      const tasks = tasksRes.data.data || [];
      
      const today = new Date();
      const thisWeekNotes = notes.filter(n => {
        const date = new Date(n.created_at);
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
      
      const thisWeekTasks = tasks.filter(t => {
        const date = new Date(t.created_at);
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });

      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weeklyNotesData = [];
      const weeklyTasksData = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        weeklyNotesData.push({
          day: weekDays[d.getDay()],
          count: notes.filter(n => n.created_at?.startsWith(dayStr)).length,
        });
        weeklyTasksData.push({
          day: weekDays[d.getDay()],
          count: tasks.filter(t => t.created_at?.startsWith(dayStr)).length,
        });
      }
      
      setWeeklyData({ notes: weeklyNotesData, tasks: weeklyTasksData });
      
      setStats({
        notes: notes.length,
        tasks: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today).length,
        highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
        weeklyNotes: thisWeekNotes.length,
        weeklyTasks: thisWeekTasks.length,
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completionRate = useMemo(() => {
    return stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;
  }, [stats.tasks, stats.completed]);

  const username = useMemo(() => {
    return token ? JSON.parse(atob(token.split('.')[1])).username : '用户';
  }, [token]);

  const subjectColors = useMemo(() => ['blue', 'green', 'purple', 'orange', 'pink', 'cyan'], []);

  const subjectTags = useMemo(() => {
    return Object.entries(subjectStats).map(([subject, count], index) => (
      <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', backgroundColor: '#f5f5f5', borderRadius: 16 }}>
        <Tag color={subjectColors[index % subjectColors.length]}>{subject}</Tag>
        <span style={{ fontSize: 12 }}>{count}篇</span>
      </div>
    ));
  }, [subjectStats, subjectColors]);

  return (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>学习仪表盘</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ fontSize: 14 }}>{username}</span>
          </div>
        </div>

        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="学习笔记" 
              value={stats.notes} 
              prefix={<BookOutlined />} 
              loading={loading} 
              onClick={() => router.push('/notes')} 
              color="#1890ff"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="待办任务" 
              value={stats.tasks - stats.completed} 
              prefix={<ClockCircleOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#faad14"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="已完成" 
              value={stats.completed} 
              prefix={<CheckCircleOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#52c41a"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="完成率" 
              value={completionRate} 
              suffix="%" 
              prefix={<RiseOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#722ed1"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="本周笔记" 
              value={stats.weeklyNotes} 
              prefix={<LineChartOutlined />} 
              loading={loading} 
              onClick={() => router.push('/notes')} 
              color="#1890ff"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="本周任务" 
              value={stats.weeklyTasks} 
              prefix={<BarChartOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#faad14"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="已逾期" 
              value={stats.overdue} 
              prefix={<CalendarOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#ff4d4f"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <StatCard 
              title="高优先级" 
              value={stats.highPriority} 
              prefix={<AimOutlined />} 
              loading={loading} 
              onClick={() => router.push('/tasks')} 
              color="#ff7875"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} lg={12}>
            <Card 
              title="任务完成进度" 
              loading={loading}
              extra={<Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push('/tasks')}>查看详情</Button>}
            >
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
          <Col xs={24} sm={12} lg={12}>
            <Card 
              title="学科分布" 
              loading={loading}
              extra={<Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push('/notes')}>查看详情</Button>}
            >
              {Object.keys(subjectStats).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {subjectTags}
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无笔记数据</p>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24}>
            <Card 
              title="本周学习活动" 
              loading={loading}
              extra={<Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push('/stats')}>查看统计</Button>}
            >
              {weeklyData.notes && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, gap: 4 }}>
                  {weeklyData.notes.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <div style={{ fontSize: 11, marginBottom: 4 }}>{item.day}</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                        <div 
                          style={{ 
                            width: '40%', 
                            backgroundColor: '#1890ff',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                            marginBottom: 4,
                            height: `${Math.max(item.count * 25, 8)}px`
                          }}
                        />
                        <div style={{ fontSize: 11, color: '#666' }}>{item.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={12}>
            <Card 
              title="最近笔记" 
              extra={<><Tag color="blue">最新</Tag><Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push('/notes')} style={{ marginLeft: 8 }}>查看全部</Button></>} 
              loading={loading}
              onClick={() => router.push('/notes')}
              style={{ cursor: 'pointer' }}
            >
              <List
                dataSource={recentNotes}
                locale={{ emptyText: '暂无笔记，去创建一个吧' }}
                renderItem={(item) => <NoteItem item={item} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card 
              title="最近任务" 
              extra={<><Tag color="orange">待办</Tag><Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push('/tasks')} style={{ marginLeft: 8 }}>查看全部</Button></>} 
              loading={loading}
              onClick={() => router.push('/tasks')}
              style={{ cursor: 'pointer' }}
            >
              <List
                dataSource={recentTasks}
                locale={{ emptyText: '暂无任务，创建一个吧' }}
                renderItem={(task) => <TaskItem task={task} />}
              />
            </Card>
          </Col>
        </Row>
      </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardPageContent />
    </RequireAuth>
  );
}

