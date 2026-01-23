import { useState } from "react";
import { __ } from "@js/utils";

export default function PostTypes({ name = 'llmstxt-posttypes', value = '', cpts = [] }) {
    const [values, setValues] = useState(value.split(',').map(i => i.trim()).filter(i => i));

    return (
        <div>
            <input id="llmstxt-termtaxs" type="hidden" name={name} value={values.join(',')} />
            <h6 className="text-md font-bold mb-3">{__('Enable Post Types')}</h6>
            <p></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {cpts.map((pt, i) => (
                    <div key={i}>
                        <label className="inline-flex items-center me-5 cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={values.includes(pt.id)} onChange={e => setValues(prev => e.target.checked ? [...prev, pt.id] : prev.filter(i => i !== pt.id))} />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600 dark:peer-checked:bg-red-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{pt.label}</span>
                        </label>
                    </div>
                ))}
            </div>

        </div>
    )
}