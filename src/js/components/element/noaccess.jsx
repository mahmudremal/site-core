import React from 'react';

const NoAccess = () => {
  return (
    <div className="h-full flex xpo_items-center xpo_justify-center card py-6 px-3">
      <div className="w-full xpo_text-center flex xpo_flex-col xpo_gap-4">
        <h1 className="text-xl font-semibold xpo_text-primary-600 xpo_mb-4">Access Denied</h1>
        <p className="text-gray-700 xpo_text-base">
          You don't have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default NoAccess;