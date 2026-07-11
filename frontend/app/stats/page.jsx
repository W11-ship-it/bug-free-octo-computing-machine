'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Card, Progress, Tag, Button, message, Space, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  TrendingUpOutlined,
  BookOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  StarOutlined,
  AimOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;

function StatCard({ title, value, icon, color, suffix = '' }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24, color }}>{icon}</span>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{value}{suffix}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{title}</div>
        </div>
      </div>
    </Card>
  );
}

function WeeklyChart({ data }) {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  return (
    <Card title="本周学习时长">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, paddingTop: 20 }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
            <div 
              style={{ 
                width: 32, 
                background: '#1890ff',
                borderRadius: 4,
                transition: 'height 0.3s',
                height: `${Math.max(item * 20, 10)}px`
              }} 
            />
            <span style={{ fontSize: 12, color: '#999', marginTop: 8 }}>{days[index]}</span>
            <span style={{ fontSize: 11, color: '#666' }}>{item}h</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LearningCalendar({ data }) {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const daysInMonth = today.daysInMonth();
  
  const getDayStyle = (day) => {
    const date = startOfMonth.add(day - 1, 'day');
    const level = data[date.format('YYYY-MM-DD')] || 0;
    if (level >= 4) return '#1890ff';
    if (level >= 3) return '#73d13d';
    if (level >= 2) return '#faad14';
    if (level >= 1) return '#ffc53d';
    return '#f0f0f0';
  };

  return (
    <Card title="学习日历">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: 4 }}>{day}</div>
        ))}
        {Array.from({ length: startOfMonth.day() }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 32 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.date();
          const bgColor = isToday ? '#ff4d4f' : getDayStyle(day);
          return (
            <div 
              key={day} 
              style={{ 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 4,
                fontSize: 12,
                color: isToday ? '#fff' : '#333',
                background: bgColor
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 12, color: '#999' }}>少</span>
        <div style={{ width: 16, height: 16, background: '#f0f0f0', borderRadius: 2 }} />
        <div style={{ width: 16, height: 16, background: '#ffc53d', borderRadius: 2 }} />
        <div style={{ width: 16, height: 16, background: '#faad14', borderRadius: 2 }} />
        <div style={{ width: 16, height: 16, background: '#73d13d', borderRadius: 2 }} />
        <div style={{ width: 16, height: 16, background: '#1890ff', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#999' }}>多</span>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(60);

  useEffect(() => {
    const savedMinutes = localStorage.getItem('studyMinutes');
    if (savedMinutes) {
      const parsed = parseInt(savedMinutes, 10);
      if (!isNaN(parsed)) {
        setStudyMinutes(parsed);
      }
    }

    const fetchData = async () => {
      try {
        const [notesRes, tasksRes] = await Promise.all([
          api.get('/api/notes'),
          api.get('/api/tasks')
        ]);
        setNotes(notesRes.data.data || []);
        setTasks(tasksRes.data.data || []);
      } catch {
        message.error('加载数据失败');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('studyMinutes', studyMinutes.toString());
  }, [studyMinutes]);

  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const todayNotes = notes.filter(n => {
      return n.created_at && dayjs(n.created_at).isSame(dayjs(), 'day');
    }).length;
    
    const todayTasks = tasks.filter(t => {
      return t.created_at && dayjs(t.created_at).isSame(dayjs(), 'day') && t.completed;
    }).length;

    return { totalNotes, totalTasks, completedTasks, completionRate, todayNotes, todayTasks };
  }, [notes, tasks]);

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayNotes = notes.filter(n => n.created_at && dayjs(n.created_at).isSame(date, 'day')).length;
      const dayTasks = tasks.filter(t => t.created_at && dayjs(t.created_at).isSame(date, 'day') && t.completed).length;
      data.push(Math.round((dayNotes * 15 + dayTasks * 10) / 60));
    }
    return data;
  }, [notes, tasks]);

  const calendarData = useMemo(() => {
    const data = {};
    notes.forEach(n => {
      if (n.created_at) {
        const date = dayjs(n.created_at).format('YYYY-MM-DD');
        data[date] = (data[date] || 0) + 1;
      }
    });
    tasks.forEach(t => {
      if (t.completed && t.created_at) {
        const date = dayjs(t.created_at).format('YYYY-MM-DD');
        data[date] = (data[date] || 0) + 0.5;
      }
    });
    return data;
  }, [notes, tasks]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, 'day');
      const hasActivity = notes.some(n => n.created_at && dayjs(n.created_at).isSame(date, 'day')) ||
                         tasks.some(t => t.created_at && dayjs(t.created_at).isSame(date, 'day'));
      if (hasActivity) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [notes, tasks]);

  const dailyProgress = Math.min(Math.round((studyMinutes / dailyGoal) * 100), 100);

  const handleAddMinutes = useCallback((minutes) => {
    setStudyMinutes(s => s + minutes);
    message.success(`已记录${minutes}分钟学习时长`);
  }, []);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>学习统计</Title>
          <Space>
            <Button icon={<ClockCircleOutlined />} onClick={() => handleAddMinutes(15)}>
              +15分钟
            </Button>
            <Button type="primary" icon={<ClockCircleOutlined />} onClick={() => handleAddMinutes(30)}>
              +30分钟
            </Button>
          </Space>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <StatCard title="今日学习" value={Math.round(studyMinutes / 60)} suffix="h" icon={<ClockCircleOutlined />} color="#1890ff" />
          </Col>
          <Col span={6}>
            <StatCard title="学习天数" value={streak} suffix="天" icon={<StarOutlined />} color="#ff4d4f" />
          </Col>
          <Col span={6}>
            <StatCard title="完成任务" value={stats.completedTasks} icon={<CheckSquareOutlined />} color="#52c41a" />
          </Col>
          <Col span={6}>
            <StatCard title="学习笔记" value={stats.totalNotes} icon={<BookOutlined />} color="#722ed1" />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card title="今日目标进度">
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#666' }}>学习时长目标</span>
                  <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{dailyProgress}%</span>
                </div>
                <Progress percent={dailyProgress} strokeColor="#1890ff" />
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  已学习 {studyMinutes} 分钟 / 目标 {dailyGoal} 分钟
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#666' }}>任务完成率</span>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{stats.completionRate}%</span>
                </div>
                <Progress percent={stats.completionRate} strokeColor="#52c41a" />
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  已完成 {stats.completedTasks} / 总任务 {stats.totalTasks}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <WeeklyChart data={weeklyData} />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <LearningCalendar data={calendarData} />
          </Col>
          <Col span={8}>
            <Card title="成就徽章">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 50, 
                  background: streak >= 7 ? '#ffd700' : '#f0f0f0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <TrophyOutlined style={{ fontSize: 24, color: streak >= 7 ? '#fff' : '#999' }} />
                  <span style={{ fontSize: 10, color: streak >= 7 ? '#fff' : '#999', marginTop: 4 }}>7天连续</span>
                </div>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 50, 
                  background: stats.totalNotes >= 10 ? '#1890ff' : '#f0f0f0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <BookOutlined style={{ fontSize: 24, color: stats.totalNotes >= 10 ? '#fff' : '#999' }} />
                  <span style={{ fontSize: 10, color: stats.totalNotes >= 10 ? '#fff' : '#999', marginTop: 4 }}>笔记达人</span>
                </div>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 50, 
                  background: stats.completionRate >= 80 ? '#52c41a' : '#f0f0f0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <AimOutlined style={{ fontSize: 24, color: stats.completionRate >= 80 ? '#fff' : '#999' }} />
                  <span style={{ fontSize: 10, color: stats.completionRate >= 80 ? '#fff' : '#999', marginTop: 4 }}>高效达人</span>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>今日动态</div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  {stats.todayNotes > 0 && <span>📝 创建了 {stats.todayNotes} 篇笔记<br /></span>}
                  {stats.todayTasks > 0 && <span>✅ 完成了 {stats.todayTasks} 个任务</span>}
                  {stats.todayNotes === 0 && stats.todayTasks === 0 && <span>今天还没有学习记录，开始学习吧！</span>}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </RequireAuth>
  );
}