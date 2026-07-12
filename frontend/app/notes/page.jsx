'use client';

import dynamic from 'next/dynamic';

const NotesPage = dynamic(() => import('./notes-page'), {
  ssr: false,
});

export default NotesPage;
