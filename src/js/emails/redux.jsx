import { useBuilder } from './context';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Palette, Link2, RotateCcw, Eye, EyeOff, Calendar, Clock, Upload, Type, Hash, Mail, Phone, Search } from 'lucide-react';

const ReduxGenerator = ({ className = "" }) => {
  const { template, previewMode, setPreviewMode, saveTemplate, sidebar, setSidebar } = useBuilder();
  const [showTooltip, setShowTooltip] = useState('');
  const [openAccordions, setOpenAccordions] = useState({});

  if (!sidebar || !sidebar.element) return <div></div>;
  const data = sidebar?.element?.data?.[sidebar.selectedTab];
  if (!data) return <div></div>;
  const [formConfig, setFormConfig] = useState(data);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  if (!sidebar.element.data[sidebar.selectedTab]) {
    return <div className={className}>Empty</div>;
  }

  // Check if a field should be visible based on conditions
  const shouldShowField = (field, sectionKey) => {
    if (!field.showIf) return true;

    const { field: conditionField, value: conditionValue } = field.showIf;
    const section = sidebar.element.data[sidebar.selectedTab][sectionKey];
    const targetField = section.fields.find(f => f.id === conditionField);

    if (!targetField) return true;

    const targetValue = targetField.value !== undefined ? targetField.value : targetField.default;
    return targetValue === conditionValue;
  };

  const renderField = (field, sectionKey) => {
    const value = field.value !== undefined ? field.value : field.default;

    switch (field.type) {
      case 'select':
        return (
          <div>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <select
              id={field.id}
              value={value || ''}
              onChange={(e) =>
                setSidebar(prev => ({
                  ...prev,
                  element: {
                    ...prev.element,
                    data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                      tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                        accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: e.target.value } : i)
                        return { accKey, accCont };
                      }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                      return { tabKey, tabCont };
                    }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
                  }
                }))
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select an option</option>
              {field.options && field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
      case 'url':
        return (
          <div>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              value={value || ''}
              onChange={(e) =>
                setSidebar(prev => ({
                  ...prev,
                  element: {
                    ...prev.element,
                    data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                      tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                        accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: e.target.value } : i)
                        return { accKey, accCont };
                      }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                      return { tabKey, tabCont };
                    }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
                  }
                }))
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={field.type === 'url' ? 'https://example.com' : ''}
            />
          </div>
        );

      case 'checkbox':
        return <Switch {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'radio':
        return <Radio {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'button-group':
        return <ButtonGroup {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'color':
        return <ColorPicker {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'range':
        return <RangeSlider {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'number':
        return <NumberInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'textarea':
        return <Textarea {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'password':
        return <PasswordInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'date':
        return <DateInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'time':
        return <TimeInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'file':
        return <FileUpload {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'email':
        return <EmailInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      case 'search':
        return <SearchInput {...field} onChange={(value) =>
          setSidebar(prev => ({
            ...prev,
            element: {
              ...prev.element,
              data: Object.entries(prev.element.data).map(([tabKey, tabCont]) => {
                tabCont = Object.entries(tabCont).map(([accKey, accCont]) => {
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? { ...i, value: value } : i)
                  return { accKey, accCont };
                }).reduce((a, c) => { a[c.accKey] = c.accCont; return a; }, {});
                return { tabKey, tabCont };
              }).reduce((a, c) => { a[c.tabKey] = c.tabCont; return a; }, {})
            }
          }))
        } />;

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white ${className}`}>
      <div className="space-y-4">
        {Object.entries(sidebar.element.data[sidebar.selectedTab]).map(([sectionKey, section]) => (
          <div key={sectionKey} className="border border-gray-200 rounded-lg shadow-sm">
            <div onClick={() => setOpenAccordions(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))} className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                <div className="relative">
                  <HelpCircle
                    size={16}
                    className="text-gray-500 cursor-help hover:text-gray-700 transition-colors"
                    onMouseEnter={() => setShowTooltip(sectionKey)}
                    onMouseLeave={() => setShowTooltip('')}
                  />
                  {showTooltip === sectionKey && (
                    <div className="absolute z-20 w-64 p-3 text-sm text-white bg-gray-800 rounded-md shadow-lg -top-2 left-6">
                      {section.description}
                      <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -left-1 top-3"></div>
                    </div>
                  )}
                </div>
              </div>
              {!!openAccordions[sectionKey] ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
            </div>

            {/* Accordion Content */}
            {openAccordions[sectionKey] && (
              <div className="p-6 space-y-6 bg-white rounded-b-lg">
                {section.fields
                  .filter(field => shouldShowField(field, sectionKey))
                  .map((field) => (
                    <div key={field.id} className="space-y-2">
                      {renderField(field, sectionKey)}
                      {field.description && (
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReduxGenerator;


// Switch Component (Toggle)
export const Switch = ({ id, label, description, value = false, onChange, disabled = false }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'
            }`}
        />
      </label>
    </div>
  </div>
);

// Radio Component
export const Radio = ({ id, label, description, options = [], value, onChange, disabled = false }) => (
  <div>
    <div className="flex items-center mb-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`${id}_${option.value}`}
            name={id}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor={`${id}_${option.value}`} className="ml-2 text-sm text-gray-900">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

// Button Group for spacing controls (margin, padding, etc.)
export const ButtonGroup = ({ id, label, description, value = { top: '', right: '', bottom: '', left: '' }, onChange, placeholder = "px", disabled = false }) => (
  <div>
    <div className="flex items-center mb-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="grid grid-cols-3 gap-2 w-32">
      <div></div>
      <input
        type="text"
        placeholder="Top"
        value={value.top || ''}
        onChange={(e) => onChange({ ...value, top: e.target.value })}
        disabled={disabled}
        className="px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <div></div>
      <input
        type="text"
        placeholder="Left"
        value={value.left || ''}
        onChange={(e) => onChange({ ...value, left: e.target.value })}
        disabled={disabled}
        className="px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex items-center justify-center">
        <Link2 size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Right"
        value={value.right || ''}
        onChange={(e) => onChange({ ...value, right: e.target.value })}
        disabled={disabled}
        className="px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <div></div>
      <input
        type="text"
        placeholder="Bottom"
        value={value.bottom || ''}
        onChange={(e) => onChange({ ...value, bottom: e.target.value })}
        disabled={disabled}
        className="px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <div></div>
    </div>
  </div>
);

// Color Picker
export const ColorPicker = ({ id, label, description, value = '#000000', onChange, disabled = false }) => (
  <div>
    <div className="flex items-center mb-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
        />
        <Palette size={16} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder="#000000"
      />
    </div>
  </div>
);

// Range Slider
export const RangeSlider = ({ id, label, description, value = 0, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = true }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <div className="ml-2 group relative">
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      {showValue && <span className="text-sm text-gray-500">{value}</span>}
    </div>
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
    />
  </div>
);

// Number Input
export const NumberInput = ({ id, label, description, value = '', onChange, min, max, step = 1, disabled = false, placeholder }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// Textarea
export const Textarea = ({ id, label, description, value = '', onChange, rows = 3, disabled = false, placeholder }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
    />
  </div>
);

// Password Input
export const PasswordInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <div className="ml-2 group relative">
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

// Date Input
export const DateInput = ({ id, label, description, value = '', onChange, disabled = false }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// Time Input
export const TimeInput = ({ id, label, description, value = '', onChange, disabled = false }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// File Upload
export const FileUpload = ({ id, label, description, onChange, accept, disabled = false, multiple = false }) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div className="flex items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <div className="ml-2 group relative">
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          if (!disabled && onChange) {
            onChange(multiple ? Array.from(e.dataTransfer.files) : e.dataTransfer.files[0]);
          }
        }}
      >
        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Drop files here or click to browse
        </p>
        <input
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          onChange={(e) => onChange && onChange(multiple ? Array.from(e.target.files) : e.target.files[0])}
          disabled={disabled}
          className="hidden"
        />
        <label
          htmlFor={id}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          Choose Files
        </label>
      </div>
    </div>
  );
};

// Email Input
export const EmailInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder = "email@example.com" }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="email"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// Phone Input
export const PhoneInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder = "+1 (555) 000-0000" }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="tel"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// Search Input
export const SearchInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder = "Search..." }) => (
  <div>
    <div className="flex items-center mb-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <div className="ml-2 group relative">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -top-2 left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  </div>
);