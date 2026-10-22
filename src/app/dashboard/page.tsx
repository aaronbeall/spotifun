'use client';

import { Suspense } from 'react';
import DashboardContent from './DashboardContent';

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-md"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
