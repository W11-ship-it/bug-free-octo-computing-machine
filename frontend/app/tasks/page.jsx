'use client';

import dynamic from 'next/dynamic';

const TasksPage = dynamic(() => import('./tasks-page'), {
  ssr: false,
});

export default TasksPage;
