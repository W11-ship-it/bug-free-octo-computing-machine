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
import { LineChart, PieChart, BarChart, MultiBarChart, RadarChart, ScatterChart, FunnelChart } from '../../components/Charts';

const { Title } = Typography;

function StatCard({ title, value, icon, color, suffix = '' }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, color }}>{icon}</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>{value}{suffix}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{title}</div>
        </div>
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
  const [plans, setPlans] = useState([]);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMinutes = localStorage.getItem('studyMinutes');
    if (savedMinutes) {
      const parsed = parseInt(savedMinutes, 10);
      if (!isNaN(parsed)) {
        setStudyMinutes(parsed);
      }
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [notesRes, tasksRes, plansRes] = await Promise.all([
          api.get('/api/notes'),
          api.get('/api/tasks'),
          api.get('/api/plans'),
        ]);
        setNotes(notesRes.data.data || []);
        setTasks(tasksRes.data.data || []);
        setPlans(plansRes.data.data || []);
      } catch {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
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
    
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.completed).length;
    const planCompletionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
    
    const todayNotes = notes.filter(n => {
      return n.created_at && dayjs(n.created_at).isSame(dayjs(), 'day');
    }).length;
    
    const todayTasks = tasks.filter(t => {
      return t.created_at && dayjs(t.created_at).isSame(dayjs(), 'day') && t.completed;
    }).length;

    return { totalNotes, totalTasks, completedTasks, completionRate, todayNotes, todayTasks, totalPlans, completedPlans, planCompletionRate };
  }, [notes, tasks, plans]);

  const weeklyData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayNotes = notes.filter(n => n.created_at && dayjs(n.created_at).isSame(date, 'day')).length;
      const dayTasks = tasks.filter(t => t.created_at && dayjs(t.created_at).isSame(date, 'day') && t.completed).length;
      const dayPlans = plans.filter(p => p.created_at && dayjs(p.created_at).isSame(date, 'day') && p.completed).length;
      data.push({
        day: days[date.day() === 0 ? 6 : date.day() - 1],
        notes: dayNotes,
        tasks: dayTasks,
        plans: dayPlans,
        total: dayNotes + dayTasks + dayPlans,
      });
    }
    return data;
  }, [notes, tasks, plans]);

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
    plans.forEach(p => {
      if (p.completed && p.created_at) {
        const date = dayjs(p.created_at).format('YYYY-MM-DD');
        data[date] = (data[date] || 0) + 0.5;
      }
    });
    return data;
  }, [notes, tasks, plans]);

  const subjectData = useMemo(() => {
    const counts = {};
    notes.forEach(n => {
      const subject = n.subject || '未分类';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [notes]);

  const taskPriorityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return [
      { name: '高优先级', value: counts.high },
      { name: '中优先级', value: counts.medium },
      { name: '低优先级', value: counts.low },
    ];
  }, [tasks]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, 'day');
      const hasActivity = notes.some(n => n.created_at && dayjs(n.created_at).isSame(date, 'day')) ||
                         tasks.some(t => t.created_at && dayjs(t.created_at).isSame(date, 'day')) ||
                         plans.some(p => p.created_at && dayjs(p.created_at).isSame(date, 'day'));
      if (hasActivity) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [notes, tasks, plans]);

  const radarData = useMemo(() => {
    const subjectCounts = {};
    notes.forEach(n => {
      const subject = n.subject || '未分类';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    const totalNotes = notes.length || 1;
    const subjects = ['数学', '英语', '编程', '语文', '物理', '其他'];
    
    return [{
      name: '学习分布',
      value: subjects.map(s => Math.round((subjectCounts[s] || 0) / totalNotes * 100)),
    }];
  }, [notes]);

  const radarIndicator = useMemo(() => [
    { name: '数学', max: 100 },
    { name: '英语', max: 100 },
    { name: '编程', max: 100 },
    { name: '语文', max: 100 },
    { name: '物理', max: 100 },
    { name: '其他', max: 100 },
  ], []);

  const scatterData = useMemo(() => {
    return weeklyData.map(d => ({
      name: d.day,
      x: d.notes + d.tasks,
      y: d.plans,
      color: '#1890ff',
    }));
  }, [weeklyData]);

  const funnelData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    const total = tasks.length || 1;
    return [
      { name: '高优先级', value: Math.round((counts.high / total) * 100) },
      { name: '中优先级', value: Math.round((counts.medium / total) * 100) },
      { name: '低优先级', value: Math.round((counts.low / total) * 100) },
    ];
  }, [tasks]);

  const dailyProgress = Math.min(Math.round((studyMinutes / dailyGoal) * 100), 100);

  const handleAddMinutes = useCallback((minutes) => {
    setStudyMinutes(s => s + minutes);
    message.success(`已记录${minutes}分钟学习时长`);
  }, []);

  return (
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

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6} lg={6}>
          <StatCard title="今日学习" value={Math.round(studyMinutes / 60)} suffix="h" icon={<ClockCircleOutlined />} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <StatCard title="学习天数" value={streak} suffix="天" icon={<StarOutlined />} color="#ff4d4f" />
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <StatCard title="完成任务" value={stats.completedTasks} icon={<CheckSquareOutlined />} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <StatCard title="学习笔记" value={stats.totalNotes} icon={<BookOutlined />} color="#722ed1" />
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={12}>
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
        <Col xs={24} sm={12} lg={12}>
          <Card>
            <MultiBarChart 
              data={weeklyData} 
              title="本周学习活动"
              series={[
                { name: '笔记', field: 'notes' },
                { name: '任务', field: 'tasks' },
                { name: '计划', field: 'plans' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <PieChart 
              data={subjectData} 
              title="笔记学科分布"
              nameField="name"
              valueField="value"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <PieChart 
              data={taskPriorityData} 
              title="任务优先级分布"
              nameField="name"
              valueField="value"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card>
            <LineChart 
              data={weeklyData} 
              title="学习趋势"
              xField="day"
              yField="total"
              color="#1890ff"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <RadarChart 
              data={radarData} 
              title="学科能力雷达图"
              indicator={radarIndicator}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <ScatterChart 
              data={scatterData} 
              title="学习活动散点图"
              xField="x"
              yField="y"
              colorField="color"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card>
            <FunnelChart 
              data={funnelData} 
              title="任务优先级漏斗"
              nameField="name"
              valueField="value"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={16}>
          <LearningCalendar data={calendarData} />
        </Col>
        <Col xs={24} lg={8}>
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
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 50, 
                background: stats.totalPlans >= 5 ? '#722ed1' : '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <CalendarOutlined style={{ fontSize: 24, color: stats.totalPlans >= 5 ? '#fff' : '#999' }} />
                <span style={{ fontSize: 10, color: stats.totalPlans >= 5 ? '#fff' : '#999', marginTop: 4 }}>计划达人</span>
              </div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>今日动态</div>
              <div style={{ fontSize: 14, color: '#666' }}>
                {stats.todayNotes > 0 && <span>📝 创建了 {stats.todayNotes} 篇笔记<br /></span>}
                {stats.todayNotes === 0 && stats.todayTasks === 0 && <span>今天还没有学习记录，开始学习吧！</span>}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
