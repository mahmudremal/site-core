import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";
import { sleep } from '@functions';
import { __, Popup, ClipboardInput } from "../utils";

export default function TaskConfig() {
  const [apps, setApps] = useState([]);
  const [keys, setKeys] = useState([]);
  const [popup, setPopup] = useState(null);
  const [users, setUsers] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  
  useEffect(() => {
    axios
    .get(`https://${location.host}/wp-json/sitecore/v1/apps`)
    .then((res) => setApps(res.data))
    .then(() => {
      if (users) {return;}
      axios.get(`https://${location.host}/wp-json/sitecore/v1/apps/users`).then(res => setUsers(res?.data))
    })
    .catch(err => alert(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!')));
  }, []);
  
  useEffect(() => {
    if (selectedApp) {
      setLoadingKeys(true);
      axios
        .get(`https://${location.host}/wp-json/sitecore/v1/apps/${selectedApp}/keys`)
        .then((res) => setKeys(res.data))
        .catch(err => alert(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoadingKeys(false));
    }
  }, [selectedApp]);
  
  const showAddApiKeys = selectedApp && !loadingKeys && Array.isArray(keys) && keys.length < 2;

  const EditApp = ({data = {}, users = []}) => {
    const [form, setForm] = useState(data);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    // 
    return (
      <div className="xpo_flex">
        <div className="xpo_w-96">
          <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4">{__('Create New App')}</h3>
          <form onSubmit={(e) => {
            setError(null);
            setLoading(true);
            e.preventDefault();
            sleep(2000).then(async () => {
              await axios.post(`https://${location.host}/wp-json/sitecore/v1/apps/${form?.id??0}`, {...form, active: form?.active?1:0})
              .then(res => res.data).then(res => setForm(prev => ({...prev, ...res})))
              .then(() => console.log("Form Submitted:", form))
            })
            .catch(err => setError(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!')))
            .finally(() => setLoading(false));
          }}>
            {error ? (
              <div className="xpo_mb-4">
                <div className="xpo_bg-primary-100 xpo_border xpo_border-primary-400 xpo_text-primary-700 xpo_px-4 xpo_py-3 xpo_rounded xpo_relative" role="alert">
                  <strong className="xpo_font-bold">{__('Error')}</strong>
                  <span className="xpo_block sm:xpo_inline">{error}</span>
                  <span className="xpo_absolute xpo_-top-3 xpo_-right-3 xpo_px-4 xpo_py-3">
                    <svg className="xpo_fill-current xpo_h-6 xpo_w-6 xpo_text-primary-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={(e) => setError(null)}><title>{__('Close')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </span>
                </div>
              </div>
            ) : null}
            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
                {__('User')}
              </label>
              <select
                requiprimary
                value={form?.user_id}
                onChange={(e) => setForm(prev => ({...prev, user_id: e.target.value}))}
                className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg focus:xpo_ring-primary-500 focus:xpo_border-primary-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-primary-500 dark:focus:xpo_border-primary-500"
              >
                <option value="">{__('Select an User')}</option>
                {(users?users:[]).map((o, i) => <option key={i} defaultValue={o.id}>{o.full_name} #{o.id}</option>)}
              </select>
            </div>

            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Description')}</label>
              <textarea
                rows="4"
                value={form?.description}
                onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                className="xpo_block xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded xpo_p-2"
              />
            </div>
            
            <div className="xpo_mb-4">
              <label className="xpo_inline-flex xpo_items-center xpo_cursor-pointer xpo_gap-4">
                <span className="xpo_text-sm xpo_font-medium xpo_text-gray-900 dark:xpo_xpo_text-gray-300">{__('Status')}</span>
                <input type="checkbox" checked={form?.active} className="xpo_sr-only xpo_peer" onChange={(e) => setForm(prev => ({...prev, active: e.target.checked}))} />
                <div className="xpo_relative xpo_w-11 xpo_h-6 xpo_bg-gray-200 peer-focus:xpo_outline-none peer-focus:xpo_ring-4 peer-focus:xpo_ring-primary-300 dark:peer-focus:xpo_ring-primary-800 xpo_rounded-full xpo_peer dark:xpo_xpo_bg-gray-700 peer-checked:after:xpo_translate-x-full xpo_rtl:peer-checked:after:xpo_-translate-x-full peer-checked:after:xpo_border-white after:xpo_content-[''] after:xpo_absolute after:xpo_top-[2px] after:xpo_start-[2px] after:xpo_bg-white after:xpo_border-gray-300 after:xpo_border after:xpo_rounded-full after:xpo_h-5 after:xpo_w-5 after:xpo_transition-all dark:xpo_border-gray-600 peer-checked:xpo_bg-primary-600 dark:peer-checked:xpo_bg-primary-600"></div>
              </label>
            </div>

            {!form?.active ? (
              <div className="xpo_mb-4">
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Void reason')}</label>
                <textarea
                  rows="4"
                  value={form?.void_reason}
                  onChange={(e) => setForm(prev => ({...prev, void_reason: e.target.value}))}
                  className="xpo_block xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded xpo_p-2"
                />
              </div>
            ) : null}
            

            <div className="xpo_flex xpo_justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const prev = e.target.innerHTML;
                  e.target.innerHTML = '...';
                  e.target.disabled = true;
                  sleep(2000).finally(() => {
                    e.target.innerHTML = prev;
                    e.target.disabled = false;
                    setPopup(null);
                  })
                }}
                className="xpo_bg-gray-300 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded xpo_mr-2"
              >{__('Cancel')}</button>
              <button
                type="submit"
                disabled={loading}
                className="xpo_bg-primary-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded"
              >{loading ? __('Loading...') : __('Submit')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  const EditApiKey = ({app_id, data = {}}) => {
    const [form, setForm] = useState(data);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    
    return (
      <div className="xpo_flex">
        <div className="xpo_w-96">
          <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4">{__('Edit API key')}</h3>
          <form onSubmit={(e) => {
            setError(null);
            setLoading(true);
            e.preventDefault();
            sleep(2000).then(async () => {
              await axios.post(`https://${location.host}/wp-json/sitecore/v1/apps/${app_id}/keys/${form?.id}`, {...form})
              .then(res => res.data).then(res => setForm(prev => ({...prev, ...res})))
              .then(() => console.log("Form Submitted:", form))
            })
            .catch(err => setError(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!')))
            .finally(() => setLoading(false));
          }}>
            {error ? (
              <div className="xpo_mb-4">
                <div className="xpo_bg-primary-100 xpo_border xpo_border-primary-400 xpo_text-primary-700 xpo_px-4 xpo_py-3 xpo_rounded xpo_relative" role="alert">
                  <strong className="xpo_font-bold">{__('Error')}</strong>
                  <span className="xpo_block sm:xpo_inline">{error}</span>
                  <span className="xpo_absolute xpo_-top-3 xpo_-right-3 xpo_px-4 xpo_py-3">
                    <svg className="xpo_fill-current xpo_h-6 xpo_w-6 xpo_text-primary-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={(e) => setError(null)}><title>{__('Close')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </span>
                </div>
              </div>
            ) : null}
            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
                {__('Key type')}
              </label>
              <select
                requiprimary
                value={form?.key_type}
                onChange={(e) => setForm(prev => ({...prev, key_type: e.target.value}))}
                className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg focus:xpo_ring-primary-500 focus:xpo_border-primary-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-primary-500 dark:focus:xpo_border-primary-500"
              >
                <option value="">{__('Select type')}</option>
                {[{id: 'secret', label: __('Secret Key')}, {id: 'public', label: __('Public Key')}].map(({id, label}, i) => <option key={i} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
                {__('API Key')}
              </label>
              <ClipboardInput text={form?.api_key} />
              {/* <input
                requiprimary
                type="text"
                value={form?.api_key}
                onChange={(e) => setForm(prev => ({...prev, api_key: e.target.value}))}
                className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg focus:xpo_ring-primary-500 focus:xpo_border-primary-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-primary-500 dark:focus:xpo_border-primary-500"
              /> */}
            </div>
            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
                {__('Expiry')}
              </label>
              <input
                requiprimary
                type="date"
                value={form?.expiprimary_on}
                onChange={(e) => setForm(prev => ({...prev, expiprimary_on: e.target.value}))}
                className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg focus:xpo_ring-primary-500 focus:xpo_border-primary-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-primary-500 dark:focus:xpo_border-primary-500"
              />
            </div>
            

            <div className="xpo_flex xpo_justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const prev = e.target.innerHTML;
                  e.target.innerHTML = '...';
                  e.target.disabled = true;
                  sleep(2000).finally(() => {
                    e.target.innerHTML = prev;
                    e.target.disabled = false;
                    setPopup(null);
                  })
                }}
                className="xpo_bg-gray-300 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded xpo_mr-2"
              >{__('Cancel')}</button>
              <button
                type="submit"
                disabled={loading}
                className="xpo_bg-primary-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded"
              >{loading ? __('Loading...') : __('Submit')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_w-full">
      <div className="xpo_mb-2 xpo_flex xpo_justify-end">
        {users ? 
          <button
            type="button"
            onClick={() => setPopup(<EditApp data={{id: 0, active: true}} users={users} />)}
            className="xpo_inline-flex xpo_items-center xpo_bg-primary-600 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-semibold xpo_gap-2 hover:xpo_bg-primary-700"
          >
            <Plus size={18} />
            {__('Create new App')}
          </button>
          : null
        }
      </div>

      <div className="xpo_bg-white xpo_rounded-lg xpo_shadow">
        <table className="xpo_min-w-full xpo_table-auto">
          <thead>
            <tr>
              <th className="xpo_text-left xpo_border-b !xpo_p-3">{__('Description')}</th>
              <th className="xpo_text-left xpo_border-b !xpo_p-3">{__('Status')}</th>
              <th className="xpo_text-left xpo_border-b !xpo_p-3">{__('Issued on')}</th>
              <th className="xpo_text-left xpo_border-b !xpo_p-3">{__('Void reason')}</th>
              <th className="xpo_text-left xpo_border-b !xpo_p-3">{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {apps.length ? (
              apps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`xpo_cursor-pointer ${selectedApp === app.id ? 'xpo_bg-primary-100' : ''}`}
                >
                  <td className="xpo_p-3">{!app.description?.length ? <span className="xpo_text-gray-300">—</span> : app.description.length >= 33 ? `${app.description.substr(0, 30)}...` : app.description}</td>
                  <td className="xpo_p-3">
                    <span className={`xpo_text-xs xpo_py-1 xpo_px-3 xpo_rounded ${
                      app.active ? "xpo_bg-green-100 xpo_text-green-700" : "xpo_bg-primary-100 xpo_text-primary-700"
                    }`}>
                      {app.active ? __('Active') : __('Inactive')}
                    </span>
                  </td>
                  <td className="xpo_p-3">{app.issued_on}</td>
                  <td className="xpo_p-3 xpo_text-xs">{!app.void_reason?.length ? <span className="xpo_text-gray-300">—</span> : app.void_reason.length >= 33 ? `${app.void_reason.substr(0, 30)}...` : app.void_reason}</td>
                  <td className="xpo_p-3">
                    <div className={`xpo_flex xpo_flex-wrap xpo_gap-2 ${selectedApp !== app.id ? 'xpo_hidden' : ''}`}>
                      <button
                        type="button"
                        onClick={(e) => setPopup(<EditApp data={app} users={users} />)}
                        className="xpo_p-0 xpo_bg-transparent xpo_border-0 xpo_inline-flex xpo_items-center xpo_text-primary-600 hover:xpo_text-primary-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPopup(() => (
                          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center">
                            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">{__('Delete the App')}</h3>
                            <p className="xpo_text-gray-600 xpo_mt-2">{__('Are you sure you want to delete this app?')}</p>
                            <div className="xpo_flex xpo_mt-4 xpo_gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const prev = e.target.innerHTML;
                                  e.target.innerHTML = '...';
                                  sleep(2000)
                                  .then(async () => 
                                    await axios.delete(`https://${location.host}/wp-json/sitecore/v1/apps/${app.id}`)
                                    .catch(err => alert(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!'))))
                                  .then(() => e.target.innerHTML = prev)
                                  .finally(() => setPopup(null));
                                }}
                                className="xpo_py-2 xpo_px-4 xpo_bg-primary-600 xpo_text-white xpo_font-medium hover:xpo_bg-primary-700 active:xpo_bg-primary-800 xpo_rounded"
                              >
                                {__('Confirm')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPopup(null)}
                                className="xpo_py-2 xpo_px-4 xpo_bg-gray-300 xpo_text-gray-800 xpo_font-medium hover:xpo_bg-gray-400 active:xpo_bg-gray-500 xpo_rounded"
                              >
                                {__('Cancel')}
                              </button>
                            </div>
                          </div>
                        ))}
                        className="xpo_p-0 xpo_bg-transparent xpo_border-0 xpo_inline-flex xpo_items-center xpo_text-primary-600 hover:xpo_text-primary-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="xpo_text-center xpo_p-6 xpo_text-gray-500" colSpan={4}>
                  {__('No API applications found.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <div className="xpo_mt-8">
          <h3 className="xpo_text-right xpo_text-sm xpo_text-gray-600">{__('Application Keys')}</h3>
          {loadingKeys ? (
            <div className="xpo_py-10 xpo_text-center">{__('Loading keys...')}</div>
          ) : (
            <div className="xpo_relative">
              <table className="xpo_min-w-full xpo_table-auto xpo_mt-4 xpo_bg-white xpo_rounded-lg xpo_shadow">
                <thead>
                  <tr>
                    <th className="xpo_border-b !xpo_p-2">{__('Key Type')}</th>
                    <th className="xpo_border-b !xpo_p-2">{__('API Key')}</th>
                    <th className="xpo_border-b !xpo_p-2">{__('Created On')}</th>
                    <th className="xpo_border-b !xpo_p-2">{__('Expiry On')}</th>
                    <th className="xpo_border-b !xpo_p-2">{__('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.length ? (
                    keys.map((key) => (
                      <tr key={key.id}>
                        <td className="xpo_p-2">{__(key.key_type)}</td>
                        <td className="xpo_p-2 xpo_font-mono">{key.api_key}</td>
                        <td className="xpo_p-2">{key.created_on}</td>
                        <td className="xpo_p-2">{key.expiprimary_on}</td>
                        <td className="xpo_p-2 xpo_space-x-2">
                          <button
                            type="button"
                            title={__('Edit Key')}
                            onClick={() => setPopup(() => <EditApiKey app_id={selectedApp} data={key} />)}
                            className="xpo_inline-flex xpo_items-center xpo_text-primary-600 hover:xpo_text-primary-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            title={__('Delete Key')}
                            onClick={() => setPopup(() => (
                              <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center">
                                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">{__('Delete API Key')}</h3>
                                <p className="xpo_text-gray-600 xpo_mt-2">{__('Are you sure you want to delete this key?')}</p>
                                <div className="xpo_flex xpo_mt-4 xpo_gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const prev = e.target.innerHTML;
                                      e.target.innerHTML = '...';
                                      sleep(2000)
                                      .then(async () => 
                                        await axios.delete(`https://${location.host}/wp-json/sitecore/v1/apps/${selectedApp}/keys/${key?.id}`)
                                        .catch(err => alert(err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!'))))
                                      .then(() => e.target.innerHTML = prev)
                                      .finally(() => setPopup(null));
                                    }}
                                    className="xpo_py-2 xpo_px-4 xpo_bg-primary-600 xpo_text-white xpo_font-medium hover:xpo_bg-primary-700 active:xpo_bg-primary-800 xpo_rounded"
                                  >
                                    {__('Confirm')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPopup(null)}
                                    className="xpo_py-2 xpo_px-4 xpo_bg-gray-300 xpo_text-gray-800 xpo_font-medium hover:xpo_bg-gray-400 active:xpo_bg-gray-500 xpo_rounded"
                                  >
                                    {__('Cancel')}
                                  </button>
                                </div>
                              </div>
                            ))}
                            className="xpo_inline-flex xpo_items-center xpo_text-primary-600 hover:xpo_text-primary-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="xpo_text-center xpo_p-4">{__('No API keys found for this application.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {showAddApiKeys && (
                <div className="xpo_mt-4">
                  <button
                    type="button"
                    className="xpo_inline-flex xpo_items-center xpo_bg-primary-600 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-semibold xpo_gap-2 hover:xpo_bg-primary-700"
                    onClick={() => setPopup(() => <EditApiKey app_id={selectedApp} data={{id: 0, key_type: 'secret'}} />)}
                  >
                    <Plus size={18} />
                    {__('Create new API keys')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}

    </div>
  );
}

