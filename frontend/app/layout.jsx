'use client';

import { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, Avatar, Tooltip } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Link from 'next/link';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/auth-context';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/notes', icon: <FileTextOutlined />, label: '学习笔记' },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: '任务管理' },
];

function LayoutContent({ children }) {
  const pathname = usePathname();
  const { logout, token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const username = token ? JSON.parse(atob(token.split('.')[1])).username : '用户';

  if (pathname === '/login') {
    return <div style={{ minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="light" 
        width={200} 
        collapsed={collapsed} 
        collapsible
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'center',
          fontWeight: 'bold', 
          fontSize: collapsed ? 16 : 18,
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && 'StudyHub'}
          {collapsed && 'SH'}
        </div>
        <Menu 
          mode="inline" 
          selectedKeys={[pathname]} 
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Button 
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tooltip title={username}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} size={32} />
                {!collapsed && <span style={{ fontSize: 14, color: '#333' }}>{username}</span>}
              </div>
            </Tooltip>
            <Button icon={<LogoutOutlined />} onClick={logout}>退出登录</Button>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider locale={zhCN}>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}