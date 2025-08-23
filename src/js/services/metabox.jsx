import { __ } from '@js/utils';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Settings, DollarSign, FileText, Filter, X, Check } from 'lucide-react';

export default function ServiceMetaBox({ config, input }) {
    const [formdata, setFormdata] = useState({
        primary: '',
        primary_agreement: '',
        conditionals: [],
        ...config
    });

    const conditionMethods = [
        { value: 'single', label: 'Single Service', type: 'boolean' },
        { value: 'tax_id', label: 'Tax ID', type: 'number' },
        { value: 'minbudget', label: 'Minimum Budget', type: 'number' },
        { value: 'maxbudget', label: 'Maximum Budget', type: 'number' },
        { value: 'itemslength', label: 'Items Length', type: 'number' },
        { value: 'region', label: 'Region', type: 'text' },
        { value: 'industry', label: 'Industry', type: 'text' }
    ];

    useEffect(() => {
        const delay = setTimeout(() => {
            input.value = JSON.stringify(formdata);
        }, 2000);
        
        return () => clearTimeout(delay);
    }, [formdata]);

    const addConditional = () => {
        setFormdata(prev => ({
            ...prev,
            conditionals: [
                ...prev.conditionals,
                {
                    condition: [{ single: true }],
                    price: 0,
                    agreement: ''
                }
            ]
        }));
    };

    const removeConditional = (index) => {
        setFormdata(prev => ({
            ...prev,
            conditionals: prev.conditionals.filter((_, i) => i !== index)
        }));
    };

    const updateConditional = (index, field, value) => {
        setFormdata(prev => ({
            ...prev,
            conditionals: prev.conditionals.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addCondition = (conditionalIndex) => {
        setFormdata(prev => ({
            ...prev,
            conditionals: prev.conditionals.map((item, i) => 
                i === conditionalIndex 
                    ? { ...item, condition: [...item.condition, { single: true }] }
                    : item
            )
        }));
    };

    const removeCondition = (conditionalIndex, conditionIndex) => {
        setFormdata(prev => ({
            ...prev,
            conditionals: prev.conditionals.map((item, i) => 
                i === conditionalIndex 
                    ? { ...item, condition: item.condition.filter((_, j) => j !== conditionIndex) }
                    : item
            )
        }));
    };

    const updateCondition = (conditionalIndex, conditionIndex, method, value) => {
        setFormdata(prev => ({
            ...prev,
            conditionals: prev.conditionals.map((item, i) => 
                i === conditionalIndex 
                    ? {
                        ...item,
                        condition: item.condition.map((cond, j) => 
                            j === conditionIndex 
                                ? { [method]: value }
                                : cond
                        )
                    }
                    : item
            )
        }));
    };

    const getConditionMethodType = (method) => {
        const methodConfig = conditionMethods.find(m => m.value === method);
        return methodConfig ? methodConfig.type : 'text';
    };

    return (
        <div className="xpo_mx-auto xpo_bg-white xpo_rounded-xl xpo_shadow-lg xpo_overflow-hidden">
            {/* Header */}
            <div className="xpo_bg-gradient-to-r xpo_from-markethia-600 xpo_to-markethia-600 xpo_px-8 xpo_py-6 xpo_text-white">
                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-2">
                    <Settings size={28} />
                    <h2 className="xpo_text-xl xpo_font-bold xpo_text-white">Service Configuration</h2>
                </div>
                <p className="xpo_text-markethia-100">Configure pricing, agreements, and conditional rules for your service</p>
            </div>

            <div className="xpo_p-8 xpo_space-y-8">
                {/* Basic Configuration */}
                <div className="xpo_space-y-6">
                    <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_flex xpo_items-center xpo_gap-2">
                        <DollarSign className="xpo_text-markethia-600" size={24} />
                        Basic Pricing & Agreement
                    </h3>

                    <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-6">
                        <div className="xpo_space-y-2">
                            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                {__('Base Price')}
                            </label>
                            <div className="xpo_relative">
                                <DollarSign className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={20} />
                                <input
                                    min={0}
                                    type="number"
                                    className="xpo_w-full !xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all"
                                    value={formdata?.primary ?? ''}
                                    placeholder={__('Enter base price')}
                                    onChange={(e) => setFormdata(prev => ({...prev, primary: e.target.value}))}
                                />
                            </div>
                        </div>

                        <div className="xpo_space-y-2">
                            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                {__('Base Agreement Terms')}
                            </label>
                            <div className="xpo_relative">
                                <FileText className="xpo_absolute xpo_left-3 xpo_top-3 xpo_text-gray-400" size={20} />
                                <textarea
                                    rows={4}
                                    className="xpo_w-full !xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all xpo_resize-none"
                                    placeholder={__('Enter base agreement terms')}
                                    value={formdata?.primary_agreement ?? ''}
                                    onChange={(e) => setFormdata(prev => ({...prev, primary_agreement: e.target.value}))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditional Agreements */}
                <div className="xpo_space-y-6">
                    <div className="xpo_flex xpo_items-center xpo_justify-between">
                        <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_flex xpo_items-center xpo_gap-2">
                            <Filter className="xpo_text-markethia-600" size={24} />
                            Conditional Agreements
                        </h3>
                        <button
                            onClick={addConditional}
                            className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-markethia-600 hover:xpo_bg-markethia-700 xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_duration-200"
                        >
                            <Plus size={16} />
                            Add Conditional Rule
                        </button>
                    </div>

                    {formdata.conditionals.length === 0 ? (
                        <div className="xpo_bg-gray-50 xpo_border-2 xpo_border-dashed xpo_border-gray-300 xpo_rounded-lg xpo_p-8 xpo_text-center">
                            <Filter className="xpo_mx-auto xpo_text-gray-400 xpo_mb-4" size={48} />
                            <h4 className="xpo_text-lg xpo_font-medium xpo_text-gray-600 xpo_mb-2">No Conditional Rules</h4>
                            <p className="xpo_text-gray-500 xpo_mb-4">Create conditional pricing and agreement rules based on specific criteria</p>
                            <button onClick={addConditional} className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-markethia-600 hover:xpo_bg-markethia-700 xpo_text-white xpo_rounded-lg xpo_transition-colors">
                                <Plus size={16} />
                                Create First Rule
                            </button>
                        </div>
                    ) : (
                        <div className="xpo_space-y-6">
                            {formdata.conditionals.map((conditional, conditionalIndex) => (
                                <div key={conditionalIndex} className="xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-6">
                                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
                                        <h4 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">
                                            Rule #{conditionalIndex + 1}
                                        </h4>
                                        <button
                                            onClick={() => removeConditional(conditionalIndex)}
                                            className="xpo_p-2 xpo_text-red-600 hover:xpo_bg-red-100 xpo_rounded-lg xpo_transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Conditions */}
                                    <div className="xpo_space-y-4 xpo_mb-6">
                                        <div className="xpo_flex xpo_items-center xpo_justify-between">
                                            <label className="xpo_text-sm xpo_font-medium xpo_text-gray-700">Conditions (All must match)</label>
                                            <button
                                                onClick={() => addCondition(conditionalIndex)}
                                                className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-1 xpo_text-sm xpo_bg-markethia-100 hover:xpo_bg-markethia-200 xpo_text-markethia-700 xpo_rounded"
                                            >
                                                <Plus size={14} />
                                                Add Condition
                                            </button>
                                        </div>

                                        <div className="xpo_space-y-3">
                                            {conditional.condition.map((condition, conditionIndex) => {
                                                const currentMethod = Object.keys(condition)[0];
                                                const currentValue = condition[currentMethod];
                                                const methodType = getConditionMethodType(currentMethod);

                                                return (
                                                    <div key={conditionIndex} className="xpo_flex xpo_items-center xpo_gap-3 xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4">
                                                        <select
                                                            value={currentMethod}
                                                            onChange={(e) => updateCondition(conditionalIndex, conditionIndex, e.target.value, methodType === 'boolean' ? true : '')}
                                                            className="xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent"
                                                        >
                                                            {conditionMethods.map(method => (
                                                                <option key={method.value} value={method.value}>
                                                                    {method.label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <span className="xpo_text-gray-500">=</span>

                                                        {methodType === 'boolean' ? (
                                                            <select
                                                                value={currentValue.toString()}
                                                                onChange={(e) => updateCondition(conditionalIndex, conditionIndex, currentMethod, e.target.value === 'true')}
                                                                className="xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent"
                                                            >
                                                                <option value="true">True</option>
                                                                <option value="false">False</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={methodType}
                                                                value={currentValue}
                                                                onChange={(e) => updateCondition(conditionalIndex, conditionIndex, currentMethod, methodType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                                                className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent"
                                                                placeholder={`Enter ${currentMethod}`}
                                                            />
                                                        )}

                                                        {conditional.condition.length > 1 && (
                                                            <button
                                                                onClick={() => removeCondition(conditionalIndex, conditionIndex)}
                                                                className="xpo_p-1 xpo_text-red-600 hover:xpo_bg-red-100 xpo_rounded"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Price and Agreement for this conditional */}
                                    <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-4">
                                        <div className="xpo_space-y-2">
                                            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                                Conditional Price
                                            </label>
                                            <div className="xpo_relative">
                                                <DollarSign className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={16} />
                                                <input
                                                    min={0}
                                                    type="number"
                                                    value={conditional.price}
                                                    onChange={(e) => updateConditional(conditionalIndex, 'price', parseFloat(e.target.value) || 0)}
                                                    className="xpo_w-full !xpo_pl-9 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="xpo_space-y-2">
                                            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                                Conditional Agreement
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={conditional.agreement}
                                                onChange={(e) => updateConditional(conditionalIndex, 'agreement', e.target.value)}
                                                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_resize-none"
                                                placeholder="Enter conditional agreement terms"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="xpo_bg-markethia-50 xpo_border xpo_border-markethia-200 xpo_rounded-lg xpo_p-6">
                    <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                        <Check className="xpo_text-markethia-600" size={20} />
                        Configuration Preview
                    </h3>
                    <div className="xpo_bg-white xpo_rounded-lg xpo_p-4 xpo_max-h-64 xpo_overflow-auto">
                        <pre className="xpo_text-sm xpo_text-gray-700">
                            {JSON.stringify(formdata, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}