'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import SourceSettings from '@/app/settings/scripts/SourceSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="py-4">
      <h2>Skripty</h2>
      

      <div className="row">

<SourceSettings />

      </div>
    </div>
  );
}
