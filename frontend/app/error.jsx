'use client';

import { Button, Typography, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Error({ error, reset }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Result
        status="error"
        title="页面出错了"
        subTitle={error.message || '发生未知错误'}
        extra={
          <Button type="primary" icon={<ReloadOutlined />} onClick={() => reset()}>
            重新加载
          </Button>
        }
      />
    </div>
  );
}