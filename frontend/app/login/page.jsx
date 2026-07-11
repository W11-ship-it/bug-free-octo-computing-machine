'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', values);
      const { token } = res.data;
      login(token);
      message.success('登录成功');
      router.push('/');
    } catch {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: values.username,
        password: values.password,
      });
      message.success('注册成功，请登录');
      setActiveTab('login');
    } catch {
      message.error('注册失败，用户名可能已存在');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#333' }}>StudyHub</Title>
          <p style={{ color: '#999', marginTop: 8, marginBottom: 0 }}>您的智能学习助手</p>
        </div>
        
        <Tabs
          centered
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={handleLogin} size="large">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input 
                      prefix={<UserOutlined style={{ color: '#667eea' }} />} 
                      placeholder="用户名" 
                      style={{ borderRadius: 8, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#667eea' }} />} 
                      placeholder="密码" 
                      style={{ borderRadius: 8, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      loading={loading}
                      style={{ 
                        borderRadius: 8, 
                        height: 44,
                        fontSize: 16,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                    >登录</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={handleRegister} size="large">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input 
                      prefix={<UserOutlined style={{ color: '#667eea' }} />} 
                      placeholder="用户名" 
                      style={{ borderRadius: 8, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#667eea' }} />} 
                      placeholder="密码" 
                      style={{ borderRadius: 8, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item name="confirm" dependencies={['password']} rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                        return Promise.reject(new Error('两次密码不一致'));
                      },
                    }),
                  ]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#667eea' }} />} 
                      placeholder="确认密码" 
                      style={{ borderRadius: 8, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      loading={loading}
                      style={{ 
                        borderRadius: 8, 
                        height: 44,
                        fontSize: 16,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                    >注册</Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}