import React from 'react';

const NoAccess = () => {
  return (
    <div className="h-full flex items-center justify-center card py-6 px-3">
      <div className="w-full text-center flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-primary-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 text-base">
          You don't have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default NoAccess;