import { useEffect, useState } from "react";
import { Database, Trash2 } from "lucide-react";

export default function DatabaseTables() {
    const [apps, setApps] = useState([]);
    const [load, setLoad] = useState(null);

    useEffect(() => {
        if (!load) return;
        fetch(`${wpApiSettings.root}sitecore/v1/database/tables`)
            .then(res => res.json())
            .then(data => setApps(data.tables))
            .catch(err => console.log(err));
    }, [load]);

    const updateTable = (id, tableKey, action) => {
        fetch(`${wpApiSettings.root}sitecore/v1/database/tables`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tableKey, action }),
            method: 'POST'
        })
            .then(res => res.json())
            .then(data =>
                data?.success && setApps(prev =>
                    prev.map(app => {
                        if (app.id === id) {
                            return {
                                ...app,
                                tables: {
                                    ...app.tables,
                                    [tableKey]: !app?.tables?.[tableKey]
                                }
                            };
                        }
                        return app;
                    })
                )
            )
            .catch(err => console.log(err));
    };

    if (!load) {
        return (
            <div className="min-h-96 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Load Database Tables</h2>
                    <p className="text-gray-600 mb-6">Click the button below to load the tables.</p>
                    <button
                        type="button"
                        onClick={() => setLoad(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                        Load Tables
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h6 className="text-md font-bold mb-3">Install and Drop Tables</h6>
            <p className="text-gray-600 mb-6">This database table only for the table managements of the site core plugin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apps?.length > 0 && apps.map((app, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">{app.title}</h4>

                        <div className="space-y-3">
                            {Object.keys(app?.tables ?? {}).map((table, idx) => {
                                const isInstalled = app.tables[table] === true;
                                const tableName = `${table.slice(0, 1).toUpperCase()}${table.slice(1)}`.replaceAll('_', ' ');

                                return (
                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Database className="w-4 h-4" />
                                            {tableName}
                                        </div>

                                        {isInstalled ? (
                                            <button
                                                type="button"
                                                onClick={() => confirm('Are you sure about this steps?') && confirm('This will remove all data regarding the database.\nAre you still want to delete this table?') && updateTable(app.id, table, 'disable')}
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-500 text-white text-sm rounded font-medium hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Drop Table
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => updateTable(app.id, table, 'active')}
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-500 text-white text-sm rounded font-medium hover:bg-green-600 transition-colors"
                                            >
                                                <Database className="w-4 h-4" />
                                                Install Table
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}