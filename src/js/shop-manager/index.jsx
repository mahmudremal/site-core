import { useState, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { __ } from '@js/utils';
import VendorList from './VendorList';
import VendorDetails from './VendorDetails';
import ProductList from './ProductList';


export default function ShopManager() {
  return (
    <HashRouter>
      <Toaster />
      <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...', 'site-core')}</div>}>
        <Routes>
          <Route path="/" element={<VendorList />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/:vendor_id" element={<VendorDetails />} />
          <Route path="/vendors/:vendor_id/warehouses/:warehouse_id/products" element={<ProductList />} />
          <Route path="/vendors/:vendor_id/products" element={<ProductList />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
