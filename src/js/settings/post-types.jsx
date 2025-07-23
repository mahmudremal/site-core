import { useState } from "react";
import { __ } from "@js/utils";

export default function PostTypes({ name = 'llmstxt-posttypes', value = '', cpts = [] }) {
    const [values, setValues] = useState(value.split(',').map(i => i.trim()).filter(i => i));
    
    return (
        <div>
            <input id="llmstxt-termtaxs" type="hidden" name={name} value={values.join(',')} />
            <h6 className="xpo_text-md xpo_font-bold xpo_mb-3">{__('Enable Post Types')}</h6>
            <p></p>
            <div className="xpo_grid xpo_grid-cols-2 sm:xpo_grid-cols-3 md:xpo_grid-cols-4 xpo_gap-5">
                {cpts.map((pt, i) => (
                    <div key={i}>
                        <label className="xpo_inline-flex xpo_items-center xpo_me-5 xpo_cursor-pointer">
                            <input type="checkbox" className="xpo_sr-only xpo_peer" defaultChecked={values.includes(pt.id)} onChange={e => setValues(prev => e.target.checked ? [...prev, pt.id] : prev.filter(i => i !== pt.id))} />
                            <div className="xpo_relative xpo_w-11 xpo_h-6 xpo_bg-gray-200 xpo_rounded-full xpo_peer peer-focus:xpo_ring-4 peer-focus:xpo_ring-red-300 dark:peer-focus:xpo_ring-red-800 dark:xpo_bg-gray-700 peer-checked:after:xpo_translate-x-full rtl:peer-checked:after:xpo_-translate-x-full peer-checked:after:xpo_border-white after:xpo_content-[''] after:xpo_absolute after:xpo_top-0.5 after:xpo_start-[2px] after:xpo_bg-white after:xpo_border-gray-300 after:xpo_border after:xpo_rounded-full after:xpo_h-5 after:xpo_w-5 after:xpo_transition-all dark:xpo_border-gray-600 peer-checked:xpo_bg-red-600 dark:peer-checked:xpo_bg-red-600"></div>
                            <span className="xpo_ms-3 xpo_text-sm xpo_font-medium xpo_text-gray-900 dark:xpo_text-gray-300">{pt.label}</span>
                        </label>
                    </div>
                ))}
            </div>

        </div>
    )
}