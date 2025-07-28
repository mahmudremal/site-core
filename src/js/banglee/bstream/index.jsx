import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import StorageProvider from './utils/contexts/storage';
import BodyProvider from './utils/contexts/body';

const BStreamHome = lazy(() => import('./home'));
const BStreamVideoPage = lazy(() => import('./single'));
const BStreamUploadPage = lazy(() => import('./upload'));
const BStreamSearchPage = lazy(() => import('./search'));
const BStreamExplorePage = lazy(() => import('./explore'));
const BStreamError = lazy(() => import('./error'));


const BStream = () => {
    return (
        <Suspense fallback={<div className="xpo_text-center xpo_p-4">Loading...</div>}>
            <StorageProvider>
                <BodyProvider>
                    <Routes>
                        <Route path="/" element={<BStreamHome />} />
                        <Route path="watch/:id" element={<BStreamVideoPage />} />
                        <Route path="upload" element={<BStreamUploadPage />} />
                        <Route path="search" element={<BStreamSearchPage />} />
                        <Route path="explore" element={<BStreamExplorePage />} />
                        {/* Wildcard route must be last */}
                        <Route path="*" element={<BStreamError />} />
                    </Routes>
                </BodyProvider>
            </StorageProvider>
        </Suspense>
    );
};

export default BStream;