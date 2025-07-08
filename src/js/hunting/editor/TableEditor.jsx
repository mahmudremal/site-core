import React, { useEffect, useState } from 'react';
import api from './API';
import { Popup, __ } from '@js/utils';
import { CheckCircle, Loader, Play, RefreshCw } from 'lucide-react';
import { sleep } from "@functions";
import { sprintf } from 'sprintf-js';

export default function TableEditor({ endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [importPopup, setImportPopup] = useState(null);

  const [filters, setFilters] = useState({per_page: 24, page: 1, s: ''});

  const fetchItems = async () => {
    setLoading(true);
    const res = await api.get(endpoint, { params: filters });
    setItems(res.data);
    setTotalPages(parseInt(res.headers['x-wp-totalpages'] || 1));
    setLoading(false);
  };



  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 3;
    const start = Math.max(1, filters.page - maxVisible);
    const end = Math.min(totalPages, filters.page + maxVisible);

    const Page = ({ page, label }) => {
      return (
        <button
          disabled={filters.page === page}
          onClick={(e) => setFilters(prev => ({...prev, page: page}))}
          className={`xpo_px-2 xpo_py-1 xpo_rounded ${filters.page === page ? 'xpo_bg-blue-600 xpo_text-white' : 'xpo_bg-gray-100'}`}
        >
            {label || page}
        </button>
      );
    }
    
    if (start > 1) pages.push(<Page key="first" page={1} label={1} />);
    if (start > 2) pages.push(<span key="dots-start">... </span>);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={(e) => setFilters(prev => ({...prev, page: i}))}
          className={`xpo_px-2 xpo_py-1 xpo_rounded ${filters.page === i ? 'xpo_bg-blue-600 xpo_text-white' : 'xpo_bg-gray-100'}`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) pages.push(<span key="dots-end"> ...</span>);
    if (end < totalPages) pages.push(<Page key={totalPages} page={totalPages} label={totalPages} />);

    return (
      <div className="xpo_mt-4 xpo_space-x-2">
        {filters.page > 1 ? <Page page={Math.max(1, filters.page - 1)} label={'<'} /> : null}
        {pages}
        {filters.page < totalPages ? <Page page={Math.min(totalPages, filters.page + 1)} label={'>'} /> : null}
      </div>
    );
  };

  const EditEntry = ({ entry }) => {
    const [formData, setFormData] = useState(entry);

    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        api.post(endpoint, formData)
        .then(res => res.data)
        .then(res => res.data)
        .then(data => setFormData(data))
        .then(data => setPopup(null))
        .finally(() => fetchItems());
      }} className="xpo_space-y-2 xpo_mb-4 xpo_max-h-screen xpo_overflow-y-auto">
        <h2 className="xpo_text-lg xpo_font-semibold">{entry.id ? __('Edit Entry') : __('Create New Entry')}</h2>
        {fields.map((field) => (
          <div key={field} className="xpo_flex xpo_flex-col xpo_gap-1/2">
            <label htmlFor={`f-${field}`} className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1 xpo_capitalize">{field.replaceAll('_', ' ').trim()}</label>
            {field == '_status' ? (
              <input
                name={field}
                id={`f-${field}`}
                type={'checkbox'}
                checked={formData[field] == true}
                onChange={(e) => setFormData((prev) => ({...prev, [field]: e.target.checked}))}
                className="xpo_block xpo_w-full xpo_border xpo_rounded xpo_p-2"
              />
            ) : (
              <input
                name={field}
                type={'text'}
                id={`f-${field}`}
                placeholder={field}
                value={formData[field] || ''}
                onChange={(e) => setFormData((prev) => ({...prev, [field]: e.target.value}))}
                className="xpo_block xpo_w-full xpo_border xpo_rounded xpo_p-2"
              />
            )}
          </div>
        ))}
        <div className="xpo_flex xpo_justify-end xpo_gap-2">
          <button type="submit" className="xpo_bg-blue-600 xpo_text-white xpo_rounded xpo_px-4 xpo_py-2">{__('Save')}</button>
          <button type="button" className="xpo_text-red-600 xpo_cursor-pointer" onClick={() => setPopup(null)}>{__('Close')}</button>
        </div>
      </form>
    );
  }

  const ImportData = ({  }) => {
    const [error, setError] = useState(null);
    const [process, setProcess] = useState(0);
    const [success, setSuccess] = useState(null);
    const [currentImport, setCurrentImport] = useState(null)
    const [totalProcess, setTotalProcess] = useState(1);

    const process_operation = async (e) => {
      e.preventDefault();
      setProcess(1);
      setCurrentImport('data files');
      const ends = ['species', 'weapons', 'states'];
      sleep(2000)
      .then(async res => {
        const lists = {};
        setTotalProcess(prev => prev + ends.length);
        for (const _end of ends) {
          setCurrentImport(sprintf(__('%s data'), _end));
          await api.post(_end + '/sync', {})
          .then(res => res.data)
          .then(res => lists[_end] = res?.data??[])
          .then(res => setProcess(prev => prev + 1));
        }
        return lists;
      })
      .then(async lists => {
        // return lists;
        // console.log(lists);
        setTotalProcess(prev => prev + lists.species.length * 2);
        // setTotalProcess(prev => prev + (lists.states.length * lists.species.length) * 2);
        // for (const stateId of lists.states.map(s => s.id)) {
          for (const speciesId of lists.species.map(s => s.id)) {
            for (const isResident of [1, 0]) {
              let hasNext = true;let pageNum = 0;
              while (hasNext) {
                setCurrentImport(sprintf(__('data of %s'), lists.species.find(s => s.id == speciesId)?.name));
                const _formData = new FormData();
                const dataobj = {
                  points: 0,
                  cursor: null,
                  stateId: lists.states.find(s => s.abbreviation == 'AZ')?.id, // stateId,
                  speciesId: speciesId,
                  sortOrder: 'DRAW_ODDS_DESC',
                  isResident: isResident,
                  pointsType: 'BONUS',
                  pageNum: pageNum++
                };
                Object.keys(dataobj).forEach(_key => _formData.append(_key, dataobj[_key]));
                await api.post('hunts' + '/sync', _formData)
                .then(res => res.data?.data??res.data)
                .then(res => {
                  hasNext = res?.pageInfo?.hasNextPage;
                  if (res.error?.code) {
                    setError(res.error.message);
                    throw new Error(__('Failed to fetch hunting database.'));
                  }
                  return res;
                })
                .then(res => setProcess(prev => prev + 1));
              }
            }
          }
        // }


      })
      .then(async res => await sleep(1000))
      .catch(err => setError(err?.message))
      .finally(() => setSuccess(true));
    }
    
    return (
      <div>
        {success ? (
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_p-6 xpo_gap-4">
            <div className="xpo_flex xpo_items-center xpo_justify-center xpo_w-20 xpo_h-20 xpo_bg-green-500 xpo_rounded-full">
              <CheckCircle className="xpo_text-white" size={48} />
            </div>
            <span>{__('Successfully updated database with latest data.')}</span>
            <button type="button" onClick={(e) => sleep(100).then(res => e.target.innerHTML = __('Closing...')).then(async res => await sleep(2000)).finally(() => setImportPopup(null))}>{__('Close Popup')}</button>
          </div>
        ) : 
          <div className="xpo_flex xpo_items-center xpo_p-6 xpo_space-x-4">
            <div className="xpo_w-24 xpo_h-24 xpo_m-auto xpo_relative xpo_flex xpo_items-center xpo_justify-center">
              {!process ? <Play className="xpo_border xpo_rounded-full xpo_border-2 xpo_border-solid xpo_p-2 xpo_cursor-pointer" type="button" size={40} onClick={(e) => process_operation(e)} /> : null}
              {process ? <Loader className={`${!error ? 'xpo_animate-spin' : ''} xpo_duration-[2s]`} size={90} /> : null}
              {process ? <div className="xpo_absolute xpo_inset-0 xpo_m-auto xpo_flex xpo_items-center xpo_justify-center xpo_text-blue-500 xpo_text-lg font-bold"><span className="xpo_bg-white xpo_rounded xpo_px-2 xpo_select-none">{process}/{totalProcess}</span></div> : null}
            </div>
            <div className="xpo_flex-1 xpo_p-4">
              <h2 className="xpo_text-lg xpo_font-semibold xpo_text-blue-800">{__('Import in Progress')}</h2>
              <p className="xpo_text-sm xpo_text-blue-600">{sprintf(__('Currently importing %s...'), currentImport)}</p>
              {error ? <p className="xpo_text-sm xpo_text-primary-600">{sprintf(__('Error: %s'), error)}</p> : null}
            </div>
          </div>
        }
      </div>
    )
  }

  useEffect(() => {
    fetchItems();
  }, [endpoint, filters]);

  return (
    <div className="xpo_p-4 xpo_border xpo_rounded-xl xpo_shadow xpo_bg-white xpo_mb-8">
      <div className="xpo_grid xpo_grid-cols-[300px_1fr_180px] xpo_gap-3 xpo_py-2 xpo_border-b xpo_border-gray-200 xpo_items-center">
        <h2 className="xpo_text-xl xpo_font-semibold">/{endpoint}</h2>
        <div className="xpo_flex">
          <input
            name="s"
            value={filters.s}
            placeholder={__('Search...')}
            className="xpo_block xpo_w-full xpo_border xpo_rounded xpo_p-2"
            onChange={(e) => setFilters(prev => ({...prev, s: e.target.value, page: 1}))}
          />
        </div>
        <div className="xpo_flex xpo_gap-3 xpo_justify-end xpo_items-center">
          {window?.siteCoreConfig?.hunt_api ? (
            <RefreshCw
              type="button"
              title={__('Create New')}
              className={`xpo_cursor-pointer`}
              onClick={(e) => setImportPopup(<ImportData />)}
            />
          ) : null}
          <button
            type="button"
            onClick={(e) => setPopup(<EditEntry entry={{}} />)}
            className="xpo_bg-primary-600 xpo_text-white xpo_rounded xpo_px-4 xpo_py-2"
          >
            {__('Create New')}
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="xpo_w-full xpo_table-auto xpo_border-collapse">
            <thead>
              <tr className="xpo_bg-gray-100">
                {fields.map((field) => (
                  <th key={field} className="xpo_border xpo_p-2 xpo_text-left">{field}</th>
                ))}
                <th className="xpo_border xpo_p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:xpo_bg-gray-50">
                  {fields.map((field) => (
                    <td key={field} className="xpo_border xpo_p-2">{item[field]}</td>
                  ))}
                  <td className="xpo_border xpo_p-2">
                    <div className="xpo_flex xpo_gap-2 xpo_items-center">
                      <button
                        onClick={() => setPopup(<EditEntry entry={item} />)}
                        className="xpo_text-gray-600"
                      >{__('Edit')}</button>
                      <button
                        onClick={() => setPopup(
                          <div className="xpo_relative xpo_max-w-sm xpo_flex xpo_flex-col xpo_gap-5">
                            <h6 className="xpo_text-lg fw-semibold">{__("Are you sure you want to delete this item? This can't be undone!")}</h6>
                            <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                              <button className="btn btn-light-100 xpo_text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                              <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                e.preventDefault();
                                api.delete(endpoint, {params: {id}})
                                .then(res => notify.success(__('Item successfully!')))
                                .then(() => fetchItems())
                                .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                .finally(() => setPopup(null));
                              }}>{__("Yes, I'm sure")}</button>
                            </div>
                          </div>
                        )}
                        className="xpo_text-red-600"
                      >{__('Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Pagination />
          {importPopup && <Popup onClose={() => confirm(__("Please don't close this popup until the operation completed.")) && setImportPopup(null)}>{importPopup}</Popup>}
          {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
        </>
      )}
    </div>
  );
}
