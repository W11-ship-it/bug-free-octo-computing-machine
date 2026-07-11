'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Form, Input, Button, message, Space, Switch, Avatar, Divider, Modal, Upload } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeTwoTone,
  BorderOutlined,
  UploadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;

function Section({ title, icon, children }) {
  return (
    <Card title={<span><span style={{ marginRight: 8 }}>{icon}</span>{title}</span>}>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const { logout, username } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    taskReminder: true,
    dailySummary: true,
    achievement: true,
  });
  const [theme, setTheme] = useState('light');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const presetAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  ];

  useEffect(() => {
    const savedAvatar = localStorage.getItem('avatarUrl');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    try {
      await form.validateFields();
      message.success('个人资料更新成功');
    } catch {
      message.error('更新失败');
    }
  }, [form]);

  const handleChangePassword = useCallback(async () => {
    try {
      await passwordForm.validateFields();
      const values = passwordForm.getFieldsValue();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch {
      message.error('修改失败');
    }
  }, [passwordForm]);

  const handleToggleNotification = useCallback((key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    message.success(`${notifications[key] ? '已关闭' : '已开启'}通知`);
  }, [notifications]);

  const handleChangeTheme = useCallback((value) => {
    setTheme(value);
    message.success(`已切换到${value === 'light' ? '浅色' : '深色'}主题`);
  }, []);

  const handleOpenAvatarModal = useCallback(() => {
    setSelectedAvatar(avatarUrl);
    setShowAvatarModal(true);
  }, [avatarUrl]);

  const handleSelectAvatar = useCallback((avatar) => {
    setSelectedAvatar(avatar);
  }, []);

  const handleConfirmAvatar = useCallback(() => {
    if (selectedAvatar) {
      setAvatarUrl(selectedAvatar);
      localStorage.setItem('avatarUrl', selectedAvatar);
      message.success('头像更换成功');
    }
    setShowAvatarModal(false);
  }, [selectedAvatar]);

  const handleCancelAvatar = useCallback(() => {
    setShowAvatarModal(false);
  }, []);

  const handleCustomUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setSelectedAvatar(base64);
    };
    reader.readAsDataURL(file);
    return false;
  }, []);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>个人设置</Title>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveProfile}>
            保存设置
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Avatar src={avatarUrl} icon={<UserOutlined />} size={80} />
              <div style={{ marginTop: 12, fontWeight: 'bold', fontSize: 16 }}>{username}</div>
              <div style={{ fontSize: 12, color: '#999' }}>普通用户</div>
              <Button type="default" size="small" style={{ marginTop: 12 }} onClick={handleOpenAvatarModal}>更换头像</Button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <Section title="个人资料" icon={<UserOutlined />}>
                <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Form.Item name="username" label="用户名" initialValue={username}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号">
                    <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                  </Form.Item>
                  <Form.Item name="bio" label="个人简介">
                    <Input.TextArea rows={3} placeholder="简单介绍一下自己..." />
                  </Form.Item>
                </Form>
              </Section>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Section title="修改密码" icon={<LockOutlined />}>
                <Form form={passwordForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Form.Item name="currentPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
                  <Input.Password 
                    prefix={<LockOutlined />}
                    iconRender={(visible) => (
                      visible ? <EyeOutlined /> : <EyeTwoTone />
                    )}
                  />
                </Form.Item>
                <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度不少于6位' }]}>
                  <Input.Password 
                    prefix={<LockOutlined />}
                    iconRender={(visible) => (
                      visible ? <EyeOutlined /> : <EyeTwoTone />
                    )}
                  />
                </Form.Item>
                  <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认新密码' }]}>
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
                    <Button type="primary" onClick={handleChangePassword}>修改密码</Button>
                  </Form.Item>
                </Form>
              </Section>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Section title="通知设置" icon={<BellOutlined />}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>任务提醒</div>
                    <div style={{ fontSize: 12, color: '#999' }}>任务到期前提醒</div>
                  </div>
                  <Switch checked={notifications.taskReminder} onChange={() => handleToggleNotification('taskReminder')} />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>每日摘要</div>
                    <div style={{ fontSize: 12, color: '#999' }}>每日学习情况汇总</div>
                  </div>
                  <Switch checked={notifications.dailySummary} onChange={() => handleToggleNotification('dailySummary')} />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>成就通知</div>
                    <div style={{ fontSize: 12, color: '#999' }}>获得新成就时提醒</div>
                  </div>
                  <Switch checked={notifications.achievement} onChange={() => handleToggleNotification('achievement')} />
                </div>
              </Section>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Section title="主题设置" icon={<BorderOutlined />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Button 
                    type={theme === 'light' ? 'primary' : 'default'} 
                    onClick={() => handleChangeTheme('light')}
                  >
                    浅色主题
                  </Button>
                  <Button 
                    type={theme === 'dark' ? 'primary' : 'default'} 
                    onClick={() => handleChangeTheme('dark')}
                  >
                    深色主题
                  </Button>
                  <span style={{ color: '#999', fontSize: 12 }}>主题设置将在下次登录时生效</span>
                </div>
              </Section>
            </div>

            <Section title="账号安全">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>退出登录</div>
                    <div style={{ fontSize: 12, color: '#999' }}>安全退出当前账号</div>
                  </div>
                  <Button danger onClick={logout}>退出登录</Button>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>删除账号</div>
                    <div style={{ fontSize: 12, color: '#999' }}>永久删除账号及所有数据</div>
                  </div>
                  <Button danger type="text">删除账号</Button>
                </div>
              </Space>
            </Section>
          </div>
        </div>

        <Modal
          title="更换头像"
          open={showAvatarModal}
          onOk={handleConfirmAvatar}
          onCancel={handleCancelAvatar}
          footer={[
            <Button key="back" onClick={handleCancelAvatar}>取消</Button>,
            <Button key="submit" type="primary" onClick={handleConfirmAvatar}>确认更换</Button>,
          ]}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>选择预设头像</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {presetAvatars.map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAvatar(avatar)}
                  style={{
                    border: selectedAvatar === avatar ? '2px solid #1890ff' : '2px solid transparent',
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <img src={avatar} alt={`avatar-${index}`} style={{ width: 50, height: 50, borderRadius: 50 }} />
                  {selectedAvatar === avatar && (
                    <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>上传自定义头像</div>
            <Upload
              beforeUpload={handleCustomUpload}
              fileList={[]}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>支持 JPG、PNG 格式，建议尺寸 100x100</div>
          </div>
          {selectedAvatar && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>预览</div>
              <Avatar src={selectedAvatar} size={80} />
            </div>
          )}
        </Modal>
      </div>
    </RequireAuth>
  );
}