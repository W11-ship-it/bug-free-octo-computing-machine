'use client';

import dynamic from 'next/dynamic';

const PlansPage = dynamic(() => import('./plans-page'), {
  ssr: false,
});

export default PlansPage;
