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
            headers: {'Content-Type': 'application/json'},
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
            <div className="xpo_min-h-96 xpo_flex xpo_items-center xpo_justify-center xpo_bg-gray-100">
                <div className="xpo_text-center">
                    <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_text-gray-800">Load Database Tables</h2>
                    <p className="xpo_text-gray-600 xpo_mb-6">Click the button below to load the tables.</p>
                    <button
                        type="button"
                        onClick={() => setLoad(true)}
                        className="xpo_bg-blue-500 xpo_hover:bg-blue-600 xpo_text-white xpo_font-medium xpo_py-2 xpo_px-4 xpo_rounded xpo_transition-colors"
                    >
                        Load Tables
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="xpo_p-6">
            <h6 className="xpo_text-md xpo_font-bold xpo_mb-3">Install and Drop Tables</h6>
            <p className="xpo_text-gray-600 xpo_mb-6">This database table only for the table managements of the site core plugin.</p>
            
            <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3 xl:xpo_grid-cols-4 xpo_gap-6">
                {apps?.length > 0 && apps.map((app, i) => (
                    <div key={i} className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4 xpo_bg-white xpo_shadow-sm">
                        <h4 className="xpo_text-lg xpo_font-semibold xpo_mb-4 xpo_text-gray-800 xpo_border-b xpo_pb-2">{app.title}</h4>
                        
                        <div className="xpo_space-y-3">
                            {Object.keys(app?.tables ?? {}).map((table, idx) => {
                                const isInstalled = app.tables[table] === true;
                                const tableName = `${table.slice(0, 1).toUpperCase()}${table.slice(1)}`.replaceAll('_', ' ');
                                
                                return (
                                    <div key={idx} className="xpo_flex xpo_flex-col xpo_gap-2 xpo_p-3 xpo_bg-gray-50 xpo_rounded-md">
                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <Database className="xpo_w-4 xpo_h-4" />
                                            {tableName}
                                        </div>
                                        
                                        {isInstalled ? (
                                            <button
                                                type="button"
                                                onClick={() => confirm('Are you sure about this steps?') && confirm('This will remove all data regarding the database.\nAre you still want to delete this table?') && updateTable(app.id, table, 'disable')}
                                                className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_w-full xpo_px-3 xpo_py-2 xpo_bg-red-500 xpo_text-white xpo_text-sm xpo_rounded xpo_font-medium hover:xpo_bg-red-600 xpo_transition-colors"
                                            >
                                                <Trash2 className="xpo_w-4 xpo_h-4" />
                                                Drop Table
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => updateTable(app.id, table, 'active')}
                                                className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_w-full xpo_px-3 xpo_py-2 xpo_bg-green-500 xpo_text-white xpo_text-sm xpo_rounded xpo_font-medium hover:xpo_bg-green-600 xpo_transition-colors"
                                            >
                                                <Database className="xpo_w-4 xpo_h-4" />
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