import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import PDFTableExtractor from './importer';
import TableEditor from './TableEditor';
import { sleep } from '@functions';
import { __ } from '@js/utils';


export default function Editor() {
  const _pass = window?.siteCoreConfig?._apss;
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(_pass ? true : false);

  return (
    <div className="xpo_mx-auto xpo_p-8 xpo_space-y-8">
      <h1 className="xpo_text-3xl xpo_font-bold xpo_mb-6">{__('Hunts Data Admin')}</h1>

      {locked ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sleep(100)
            .then(res => {
              setError(null);
              if (!password.trim()) {
                throw new Error(__('Please input valid password!'))
              }
              return null;
            })
            .then(() => e.target.querySelector('button[type=submit]').innerHTML = __('Loading...'))
            .then(async () => await sleep(2000))
            .then(() => {
              console.log(_pass, atob(_pass))
              if (password != atob(_pass)) {
                e.target.querySelector('button[type=submit]').innerHTML = __('Unlock');
                throw new Error(__("Password didn't matched!"))
              }
              return null;
            })
            .then(() => setLocked(prev => false))
            .catch(err => setError(err?.message))
          }}
          className="xpo_flex xpo_items-center xpo_justify-center xpo_bg-gray-100 xpo_select-none"
        >
          <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-xl xpo_p-8 xpo_w-full xpo_max-w-sm xpo_text-center">
            <div className="xpo_mb-4 xpo_flex xpo_justify-center">
              <Lock className="xpo_text-gray-700 xpo_w-12 xpo_h-12" />
            </div>
            <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-2">{__('Locked')}</h2>
            <p className="xpo_text-sm xpo_text-gray-500 xpo_mb-6">{__('Enter your password to continue')}</p>

            {error ? <p className="xpo_px-4 xpo_py-2 xpo_text-red-600">{error}</p> : null}

            <div className="xpo_relative xpo_mb-4">
              <input
                value={password}
                placeholder={__('Password')}
                type={visible ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
                className="xpo_w-full xpo_rounded-lg xpo_border xpo_border-gray-300 xpo_p-3 xpo_pl-4 xpo_pr-10 xpo_text-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setVisible(prev => !prev)}
                className="xpo_absolute xpo_top-1/2 xpo_right-3 xpo_-translate-y-1/2 xpo_text-gray-500"
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="xpo_w-full xpo_bg-blue-600 xpo_text-white xpo_rounded-lg xpo_py-2 xpo_text-sm xpo_font-medium hover:xpo_bg-blue-700 xpo_transition">
              {__('Unlock')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <PDFTableExtractor />
          <TableEditor endpoint="species" fields={['id', 'name', '_status']} />
          <TableEditor endpoint="weapons" fields={['id', 'name', '_status']} />
          {/* <TableEditor endpoint="states" fields={['id', 'name', 'abbreviation', '_status']} /> */}
          <TableEditor endpoint="bag_types" fields={['id', 'name', 'species_id', '_status']} />
          <TableEditor endpoint="gmu" fields={['id', 'name', 'code', 'total_sqmi', 'public_sqmi', 'public_ratio', 'state_id']} />
          <TableEditor endpoint="documents" fields={['id', 'code', 'total_quota']} />
          <TableEditor endpoint="applications" fields={['id', 'document_id', 'is_resident', 'quota']} />
          <TableEditor endpoint="odds" fields={['id', 'application_id', 'odds', 'type']} />
          {/* <TableEditor endpoint="hunts" fields={['id', 'app_year', 'user_odds', 'harvest_rate', 'season_type', 'start_date', 'end_date', 'hunters_per_sqmi', 'weapon_id', 'bag_type_id', 'gmu_id', 'document_id']} /> */}
        </>
      )}
      
    </div>
  );
}
