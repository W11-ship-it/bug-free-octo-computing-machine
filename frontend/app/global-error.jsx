'use client';

import { Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export default function GlobalError({ error, reset }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
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
  );
}