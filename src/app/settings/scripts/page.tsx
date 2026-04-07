'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import SourceSettings from '@/app/settings/scripts/SourceSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="py-4">
      <h2>Scripts</h2>
      

      <div className="card my-4">
        <h5 className="card-header">Data management</h5>
        <div className="card-body">

        <SourceSettings />
        </div>

      </div>
    </div>
  );
}
