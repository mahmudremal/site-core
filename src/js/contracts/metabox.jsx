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
        <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-agreements-600 to-agreements-600 px-8 py-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Settings size={28} />
                    <h2 className="text-xl font-bold text-white">Service Configuration</h2>
                </div>
                <p className="text-agreements-100">Configure pricing, agreements, and conditional rules for your service</p>
            </div>

            <div className="p-8 space-y-8">
                {/* Basic Configuration */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <DollarSign className="text-agreements-600" size={24} />
                        Basic Pricing & Agreement
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {__('Base Price')}
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    min={0}
                                    type="number"
                                    className="w-full !pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                    value={formdata?.primary ?? ''}
                                    placeholder={__('Enter base price')}
                                    onChange={(e) => setFormdata(prev => ({ ...prev, primary: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {__('Base Agreement Terms')}
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                                <textarea
                                    rows={4}
                                    className="w-full !pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all resize-none"
                                    placeholder={__('Enter base agreement terms')}
                                    value={formdata?.primary_agreement ?? ''}
                                    onChange={(e) => setFormdata(prev => ({ ...prev, primary_agreement: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditional Agreements */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Filter className="text-agreements-600" size={24} />
                            Conditional Agreements
                        </h3>
                        <button
                            onClick={addConditional}
                            className="flex items-center gap-2 px-4 py-2 bg-agreements-600 hover:bg-agreements-700 text-white rounded-lg transition-colors duration-200"
                        >
                            <Plus size={16} />
                            Add Conditional Rule
                        </button>
                    </div>

                    {formdata.conditionals.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Filter className="mx-auto text-gray-400 mb-4" size={48} />
                            <h4 className="text-lg font-medium text-gray-600 mb-2">No Conditional Rules</h4>
                            <p className="text-gray-500 mb-4">Create conditional pricing and agreement rules based on specific criteria</p>
                            <button onClick={addConditional} className="inline-flex items-center gap-2 px-4 py-2 bg-agreements-600 hover:bg-agreements-700 text-white rounded-lg transition-colors">
                                <Plus size={16} />
                                Create First Rule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formdata.conditionals.map((conditional, conditionalIndex) => (
                                <div key={conditionalIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            Rule #{conditionalIndex + 1}
                                        </h4>
                                        <button
                                            onClick={() => removeConditional(conditionalIndex)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Conditions */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">Conditions (All must match)</label>
                                            <button
                                                onClick={() => addCondition(conditionalIndex)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-agreements-100 hover:bg-agreements-200 text-agreements-700 rounded"
                                            >
                                                <Plus size={14} />
                                                Add Condition
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {conditional.condition.map((condition, conditionIndex) => {
                                                const currentMethod = Object.keys(condition)[0];
                                                const currentValue = condition[currentMethod];
                                                const methodType = getConditionMethodType(currentMethod);

                                                return (
                                                    <div key={conditionIndex} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                                                        <select
                                                            value={currentMethod}
                                                            onChange={(e) => updateCondition(conditionalIndex, conditionIndex, e.target.value, methodType === 'boolean' ? true : '')}
                                                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-agreements-500 focus:border-transparent"
                                                        >
                                                            {conditionMethods.map(method => (
                                                                <option key={method.value} value={method.value}>
                                                                    {method.label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <span className="text-gray-500">=</span>

                                                        {methodType === 'boolean' ? (
                                                            <select
                                                                value={currentValue.toString()}
                                                                onChange={(e) => updateCondition(conditionalIndex, conditionIndex, currentMethod, e.target.value === 'true')}
                                                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-agreements-500 focus:border-transparent"
                                                            >
                                                                <option value="true">True</option>
                                                                <option value="false">False</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={methodType}
                                                                value={currentValue}
                                                                onChange={(e) => updateCondition(conditionalIndex, conditionIndex, currentMethod, methodType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-agreements-500 focus:border-transparent"
                                                                placeholder={`Enter ${currentMethod}`}
                                                            />
                                                        )}

                                                        {conditional.condition.length > 1 && (
                                                            <button
                                                                onClick={() => removeCondition(conditionalIndex, conditionIndex)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Conditional Price
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    min={0}
                                                    type="number"
                                                    value={conditional.price}
                                                    onChange={(e) => updateConditional(conditionalIndex, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-full !pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-agreements-500 focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Conditional Agreement
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={conditional.agreement}
                                                onChange={(e) => updateConditional(conditionalIndex, 'agreement', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-agreements-500 focus:border-transparent resize-none"
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
                <div className="bg-agreements-50 border border-agreements-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Check className="text-agreements-600" size={20} />
                        Configuration Preview
                    </h3>
                    <div className="bg-white rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-sm text-gray-700">
                            {JSON.stringify(formdata, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}