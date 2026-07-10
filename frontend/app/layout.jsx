'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link href="/">仪表盘</Link> },
  { key: '/notes', icon: <FileTextOutlined />, label: <Link href="/notes">学习笔记</Link> },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: <Link href="/tasks">任务管理</Link> },
];

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider locale={zhCN}>
            <Layout style={{ minHeight: '100vh' }}>
              <Sider theme="light" width={200}>
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>
                  StudyHub
                </div>
                <Menu mode="inline" selectedKeys={[pathname]} items={menuItems} />
              </Sider>
              <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #f0f0f0' }}>
                  <LogoutOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                </Header>
                <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
                  {children}
                </Content>
              </Layout>
            </Layout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
