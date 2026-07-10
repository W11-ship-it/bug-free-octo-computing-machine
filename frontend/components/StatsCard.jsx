'use client';

import { Card } from 'antd';

export default function StatsCard({ title, value, icon, loading }) {
  return (
    <Card hoverable>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 24, color: '#1677ff' }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, color: '#666' }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{loading ? '...' : value}</div>
        </div>
      </div>
    </Card>
  );
}
