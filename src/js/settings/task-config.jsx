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
        if (users) { return; }
        axios.get(`https://${location.host}/wp-json/sitecore/v1/apps/users`).then(res => setUsers(res?.data))
      })
      .catch(err => alert(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!')));
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setLoadingKeys(true);
      axios
        .get(`https://${location.host}/wp-json/sitecore/v1/apps/${selectedApp}/keys`)
        .then((res) => setKeys(res.data))
        .catch(err => alert(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!')))
        .finally(() => setLoadingKeys(false));
    }
  }, [selectedApp]);

  const showAddApiKeys = selectedApp && !loadingKeys && Array.isArray(keys) && keys.length < 2;

  const EditApp = ({ data = {}, users = [] }) => {
    const [form, setForm] = useState(data);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    // 
    return (
      <div className="flex">
        <div className="w-96">
          <h3 className="text-lg font-semibold mb-4">{__('Create New App')}</h3>
          <form onSubmit={(e) => {
            setError(null);
            setLoading(true);
            e.preventDefault();
            sleep(2000).then(async () => {
              await axios.post(`https://${location.host}/wp-json/sitecore/v1/apps/${form?.id ?? 0}`, { ...form, active: form?.active ? 1 : 0 })
                .then(res => res.data).then(res => setForm(prev => ({ ...prev, ...res })))
                .then(() => console.log("Form Submitted:", form))
            })
              .catch(err => setError(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!')))
              .finally(() => setLoading(false));
          }}>
            {error ? (
              <div className="mb-4">
                <div className="bg-primary-100 border border-primary-400 text-primary-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">{__('Error')}</strong>
                  <span className="block sm:inline">{error}</span>
                  <span className="absolute -top-3 -right-3 px-4 py-3">
                    <svg className="fill-current h-6 w-6 text-primary-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={(e) => setError(null)}><title>{__('Close')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
              </div>
            ) : null}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {__('User')}
              </label>
              <select
                requiprimary
                value={form?.user_id}
                onChange={(e) => setForm(prev => ({ ...prev, user_id: e.target.value }))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              >
                <option value="">{__('Select an User')}</option>
                {(users ? users : []).map((o, i) => <option key={i} defaultValue={o.id}>{o.full_name} #{o.id}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{__('Description')}</label>
              <textarea
                rows="4"
                value={form?.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{__('Status')}</span>
                <input type="checkbox" checked={form?.active} className="sr-only peer" onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))} />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 dark:peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {!form?.active ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{__('Void reason')}</label>
                <textarea
                  rows="4"
                  value={form?.void_reason}
                  onChange={(e) => setForm(prev => ({ ...prev, void_reason: e.target.value }))}
                  className="block w-full border border-gray-300 rounded p-2"
                />
              </div>
            ) : null}


            <div className="flex justify-end">
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
                className="bg-gray-300 text-white px-4 py-2 rounded mr-2"
              >{__('Cancel')}</button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 text-white px-4 py-2 rounded"
              >{loading ? __('Loading...') : __('Submit')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const EditApiKey = ({ app_id, data = {} }) => {
    const [form, setForm] = useState(data);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);

    return (
      <div className="flex">
        <div className="w-96">
          <h3 className="text-lg font-semibold mb-4">{__('Edit API key')}</h3>
          <form onSubmit={(e) => {
            setError(null);
            setLoading(true);
            e.preventDefault();
            sleep(2000).then(async () => {
              await axios.post(`https://${location.host}/wp-json/sitecore/v1/apps/${app_id}/keys/${form?.id}`, { ...form })
                .then(res => res.data).then(res => setForm(prev => ({ ...prev, ...res })))
                .then(() => console.log("Form Submitted:", form))
            })
              .catch(err => setError(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!')))
              .finally(() => setLoading(false));
          }}>
            {error ? (
              <div className="mb-4">
                <div className="bg-primary-100 border border-primary-400 text-primary-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">{__('Error')}</strong>
                  <span className="block sm:inline">{error}</span>
                  <span className="absolute -top-3 -right-3 px-4 py-3">
                    <svg className="fill-current h-6 w-6 text-primary-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={(e) => setError(null)}><title>{__('Close')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
              </div>
            ) : null}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {__('Key type')}
              </label>
              <select
                requiprimary
                value={form?.key_type}
                onChange={(e) => setForm(prev => ({ ...prev, key_type: e.target.value }))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              >
                <option value="">{__('Select type')}</option>
                {[{ id: 'secret', label: __('Secret Key') }, { id: 'public', label: __('Public Key') }].map(({ id, label }, i) => <option key={i} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {__('API Key')}
              </label>
              <ClipboardInput text={form?.api_key} />
              {/* <input
                requiprimary
                type="text"
                value={form?.api_key}
                onChange={(e) => setForm(prev => ({...prev, api_key: e.target.value}))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              /> */}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {__('Expiry')}
              </label>
              <input
                requiprimary
                type="date"
                value={form?.expiprimary_on}
                onChange={(e) => setForm(prev => ({ ...prev, expiprimary_on: e.target.value }))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>


            <div className="flex justify-end">
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
                className="bg-gray-300 text-white px-4 py-2 rounded mr-2"
              >{__('Cancel')}</button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 text-white px-4 py-2 rounded"
              >{loading ? __('Loading...') : __('Submit')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-end">
        {users ?
          <button
            type="button"
            onClick={() => setPopup(<EditApp data={{ id: 0, active: true }} users={users} />)}
            className="inline-flex items-center bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold gap-2 hover:bg-primary-700"
          >
            <Plus size={18} />
            {__('Create new App')}
          </button>
          : null
        }
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="text-left border-b !p-3">{__('Description')}</th>
              <th className="text-left border-b !p-3">{__('Status')}</th>
              <th className="text-left border-b !p-3">{__('Issued on')}</th>
              <th className="text-left border-b !p-3">{__('Void reason')}</th>
              <th className="text-left border-b !p-3">{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {apps.length ? (
              apps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`cursor-pointer ${selectedApp === app.id ? 'bg-primary-100' : ''}`}
                >
                  <td className="p-3">{!app.description?.length ? <span className="text-gray-300">—</span> : app.description.length >= 33 ? `${app.description.substr(0, 30)}...` : app.description}</td>
                  <td className="p-3">
                    <span className={`text-xs py-1 px-3 rounded ${app.active ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                      }`}>
                      {app.active ? __('Active') : __('Inactive')}
                    </span>
                  </td>
                  <td className="p-3">{app.issued_on}</td>
                  <td className="p-3 text-xs">{!app.void_reason?.length ? <span className="text-gray-300">—</span> : app.void_reason.length >= 33 ? `${app.void_reason.substr(0, 30)}...` : app.void_reason}</td>
                  <td className="p-3">
                    <div className={`flex flex-wrap gap-2 ${selectedApp !== app.id ? 'hidden' : ''}`}>
                      <button
                        type="button"
                        onClick={(e) => setPopup(<EditApp data={app} users={users} />)}
                        className="p-0 bg-transparent border-0 inline-flex items-center text-primary-600 hover:text-primary-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPopup(() => (
                          <div className="flex flex-col items-center justify-center">
                            <h3 className="text-lg font-semibold text-gray-800">{__('Delete the App')}</h3>
                            <p className="text-gray-600 mt-2">{__('Are you sure you want to delete this app?')}</p>
                            <div className="flex mt-4 gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const prev = e.target.innerHTML;
                                  e.target.innerHTML = '...';
                                  sleep(2000)
                                    .then(async () =>
                                      await axios.delete(`https://${location.host}/wp-json/sitecore/v1/apps/${app.id}`)
                                        .catch(err => alert(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!'))))
                                    .then(() => e.target.innerHTML = prev)
                                    .finally(() => setPopup(null));
                                }}
                                className="py-2 px-4 bg-primary-600 text-white font-medium hover:bg-primary-700 active:bg-primary-800 rounded"
                              >
                                {__('Confirm')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPopup(null)}
                                className="py-2 px-4 bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 active:bg-gray-500 rounded"
                              >
                                {__('Cancel')}
                              </button>
                            </div>
                          </div>
                        ))}
                        className="p-0 bg-transparent border-0 inline-flex items-center text-primary-600 hover:text-primary-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center p-6 text-gray-500" colSpan={4}>
                  {__('No API applications found.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <div className="mt-8">
          <h3 className="text-right text-sm text-gray-600">{__('Application Keys')}</h3>
          {loadingKeys ? (
            <div className="py-10 text-center">{__('Loading keys...')}</div>
          ) : (
            <div className="relative">
              <table className="min-w-full table-auto mt-4 bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="border-b !p-2">{__('Key Type')}</th>
                    <th className="border-b !p-2">{__('API Key')}</th>
                    <th className="border-b !p-2">{__('Created On')}</th>
                    <th className="border-b !p-2">{__('Expiry On')}</th>
                    <th className="border-b !p-2">{__('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.length ? (
                    keys.map((key) => (
                      <tr key={key.id}>
                        <td className="p-2">{__(key.key_type)}</td>
                        <td className="p-2 font-mono">{key.api_key}</td>
                        <td className="p-2">{key.created_on}</td>
                        <td className="p-2">{key.expiprimary_on}</td>
                        <td className="p-2 space-x-2">
                          <button
                            type="button"
                            title={__('Edit Key')}
                            onClick={() => setPopup(() => <EditApiKey app_id={selectedApp} data={key} />)}
                            className="inline-flex items-center text-primary-600 hover:text-primary-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            title={__('Delete Key')}
                            onClick={() => setPopup(() => (
                              <div className="flex flex-col items-center justify-center">
                                <h3 className="text-lg font-semibold text-gray-800">{__('Delete API Key')}</h3>
                                <p className="text-gray-600 mt-2">{__('Are you sure you want to delete this key?')}</p>
                                <div className="flex mt-4 gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const prev = e.target.innerHTML;
                                      e.target.innerHTML = '...';
                                      sleep(2000)
                                        .then(async () =>
                                          await axios.delete(`https://${location.host}/wp-json/sitecore/v1/apps/${selectedApp}/keys/${key?.id}`)
                                            .catch(err => alert(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? __('Something went wrong!'))))
                                        .then(() => e.target.innerHTML = prev)
                                        .finally(() => setPopup(null));
                                    }}
                                    className="py-2 px-4 bg-primary-600 text-white font-medium hover:bg-primary-700 active:bg-primary-800 rounded"
                                  >
                                    {__('Confirm')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPopup(null)}
                                    className="py-2 px-4 bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 active:bg-gray-500 rounded"
                                  >
                                    {__('Cancel')}
                                  </button>
                                </div>
                              </div>
                            ))}
                            className="inline-flex items-center text-primary-600 hover:text-primary-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-4">{__('No API keys found for this application.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {showAddApiKeys && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold gap-2 hover:bg-primary-700"
                    onClick={() => setPopup(() => <EditApiKey app_id={selectedApp} data={{ id: 0, key_type: 'secret' }} />)}
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

