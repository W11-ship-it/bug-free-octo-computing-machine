'use client';

import { Button, Typography, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function GlobalError({ error, reset }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Result
            status="error"
            title="系统错误"
            subTitle={error.message || '系统发生严重错误'}
            extra={
              <Button type="primary" icon={<ReloadOutlined />} onClick={() => reset()}>
                刷新页面
              </Button>
            }
          />
        </div>
      </body>
    </html>
  );
}