'use client';

import { Card, Statistic } from 'antd';
import { memo } from 'react';

const StatCard = memo(function StatCard({ title, value, prefix, suffix, loading, hoverable = true, onClick, color }) {
  return (
    <Card 
      hoverable={hoverable} 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : '', ...(color ? { borderLeft: `3px solid ${color}` } : {}) }}
    >
      <Statistic 
        title={title} 
        value={value} 
        prefix={prefix} 
        suffix={suffix} 
        loading={loading}
        valueStyle={color ? { color } : {}}
      />
    </Card>
  );
});

export default StatCard;