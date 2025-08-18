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
            <label htmlFor={field.id} className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
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
                        accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: e.target.value} : i)
                        return {accKey, accCont};
                      }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                      return {tabKey, tabCont};
                    }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
                  }
                }))
              }
              className="xpo_block xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_bg-white"
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
            <label htmlFor={field.id} className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
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
                        accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: e.target.value} : i)
                        return {accKey, accCont};
                      }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                      return {tabKey, tabCont};
                    }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
                  }
                }))
              }
              className="xpo_block xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
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
                  accCont.fields = accCont.fields.map(i => i.id == field.id ? {...i, value: value} : i)
                  return {accKey, accCont};
                }).reduce((a, c) => {a[c.accKey] = c.accCont;return a;}, {});
                return {tabKey, tabCont};
              }).reduce((a, c) => {a[c.tabKey] = c.tabCont;return a;}, {})
            }
          }))
        } />;
        
      default:
        return null;
    }
  };

  return (
    <div className={`xpo_max-w-4xl xpo_mx-auto xpo_bg-white ${className}`}>
      <div className="xpo_space-y-4">
        {Object.entries(sidebar.element.data[sidebar.selectedTab]).map(([sectionKey, section]) => (
          <div key={sectionKey} className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_shadow-sm">
            <div onClick={() => setOpenAccordions(prev => ({...prev, [sectionKey]: !prev[sectionKey]}))} className="xpo_flex xpo_items-center xpo_justify-between xpo_p-2 xpo_bg-gray-50 xpo_cursor-pointer hover:xpo_bg-gray-100 xpo_transition-colors xpo_rounded-t-lg">
              <div className="xpo_flex xpo_items-center xpo_space-x-2">
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                  {section.title}
                </h3>
                <div className="xpo_relative">
                  <HelpCircle
                    size={16}
                    className="xpo_text-gray-500 xpo_cursor-help hover:xpo_text-gray-700 xpo_transition-colors"
                    onMouseEnter={() => setShowTooltip(sectionKey)}
                    onMouseLeave={() => setShowTooltip('')}
                  />
                  {showTooltip === sectionKey && (
                    <div className="xpo_absolute xpo_z-20 xpo_w-64 xpo_p-3 xpo_text-sm xpo_text-white xpo_bg-gray-800 xpo_rounded-md xpo_shadow-lg xpo_-top-2 xpo_left-6">
                      {section.description}
                      <div className="xpo_absolute xpo_w-2 xpo_h-2 xpo_bg-gray-800 xpo_transform xpo_rotate-45 xpo_-left-1 xpo_top-3"></div>
                    </div>
                  )}
                </div>
              </div>
              {!!openAccordions[sectionKey] ? <ChevronUp size={20} className="xpo_text-gray-600" /> : <ChevronDown size={20} className="xpo_text-gray-600" />}
            </div>

            {/* Accordion Content */}
            {openAccordions[sectionKey] && (
              <div className="xpo_p-6 xpo_space-y-6 xpo_bg-white xpo_rounded-b-lg">
                {section.fields
                  .filter(field => shouldShowField(field, sectionKey))
                  .map((field) => (
                    <div key={field.id} className="xpo_space-y-2">
                      {renderField(field, sectionKey)}
                      {field.description && (
                        <p className="xpo_text-xs xpo_text-gray-500 xpo_leading-relaxed">
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
  <div className="xpo_flex xpo_items-center xpo_justify-between">
    <div className="xpo_flex xpo_items-center">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-900">
        {label}
      </label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <input
        type="checkbox"
        id={id}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="xpo_sr-only"
      />
      <label
        htmlFor={id}
        className={`xpo_flex xpo_items-center xpo_cursor-pointer xpo_w-12 xpo_h-6 xpo_rounded-full xpo_transition-colors xpo_duration-200 ${
          disabled ? 'xpo_opacity-50 xpo_cursor-not-allowed' : ''
        } ${value ? 'xpo_bg-blue-600' : 'xpo_bg-gray-300'}`}
      >
        <span
          className={`xpo_block xpo_w-5 xpo_h-5 xpo_bg-white xpo_rounded-full xpo_shadow xpo_transform xpo_transition-transform xpo_duration-200 ${
            value ? 'xpo_translate-x-6' : 'xpo_translate-x-0.5'
          }`}
        />
      </label>
    </div>
  </div>
);

// Radio Component
export const Radio = ({ id, label, description, options = [], value, onChange, disabled = false }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-3">
      <label className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_space-y-2">
      {options.map((option) => (
        <div key={option.value} className="xpo_flex xpo_items-center">
          <input
            type="radio"
            id={`${id}_${option.value}`}
            name={id}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_border-gray-300 focus:xpo_ring-blue-500"
          />
          <label htmlFor={`${id}_${option.value}`} className="xpo_ml-2 xpo_text-sm xpo_text-gray-900">
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
    <div className="xpo_flex xpo_items-center xpo_mb-3">
      <label className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_grid xpo_grid-cols-3 xpo_gap-2 xpo_w-32">
      <div></div>
      <input
        type="text"
        placeholder="Top"
        value={value.top || ''}
        onChange={(e) => onChange({ ...value, top: e.target.value })}
        disabled={disabled}
        className="xpo_px-2 xpo_py-1 xpo_text-xs xpo_border xpo_border-gray-300 xpo_rounded xpo_text-center focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
      <div></div>
      <input
        type="text"
        placeholder="Left"
        value={value.left || ''}
        onChange={(e) => onChange({ ...value, left: e.target.value })}
        disabled={disabled}
        className="xpo_px-2 xpo_py-1 xpo_text-xs xpo_border xpo_border-gray-300 xpo_rounded xpo_text-center focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
      <div className="xpo_flex xpo_items-center xpo_justify-center">
        <Link2 size={16} className="xpo_text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Right"
        value={value.right || ''}
        onChange={(e) => onChange({ ...value, right: e.target.value })}
        disabled={disabled}
        className="xpo_px-2 xpo_py-1 xpo_text-xs xpo_border xpo_border-gray-300 xpo_rounded xpo_text-center focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
      <div></div>
      <input
        type="text"
        placeholder="Bottom"
        value={value.bottom || ''}
        onChange={(e) => onChange({ ...value, bottom: e.target.value })}
        disabled={disabled}
        className="xpo_px-2 xpo_py-1 xpo_text-xs xpo_border xpo_border-gray-300 xpo_rounded xpo_text-center focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
      <div></div>
    </div>
  </div>
);

// Color Picker
export const ColorPicker = ({ id, label, description, value = '#000000', onChange, disabled = false }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-2">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_flex xpo_items-center xpo_space-x-2">
      <div className="xpo_relative">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="xpo_w-10 xpo_h-10 xpo_rounded xpo_border-2 xpo_border-gray-300 xpo_cursor-pointer disabled:xpo_cursor-not-allowed"
        />
        <Palette size={16} className="xpo_absolute xpo_top-1/2 xpo_left-1/2 xpo_transform xpo_-translate-x-1/2 xpo_-translate-y-1/2 xpo_text-white xpo_pointer-events-none" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
        placeholder="#000000"
      />
    </div>
  </div>
);

// Range Slider
export const RangeSlider = ({ id, label, description, value = 0, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = true }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-2">
      <div className="xpo_flex xpo_items-center">
        <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
        {description && (
          <div className="xpo_ml-2 xpo_group xpo_relative">
            <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
            <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      {showValue && <span className="xpo_text-sm xpo_text-gray-500">{value}</span>}
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
      className="xpo_w-full xpo_h-2 xpo_bg-gray-200 xpo_rounded-lg xpo_appearance-none xpo_cursor-pointer slider"
    />
  </div>
);

// Number Input
export const NumberInput = ({ id, label, description, value = '', onChange, min, max, step = 1, disabled = false, placeholder }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Hash size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
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
        className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
    </div>
  </div>
);

// Textarea
export const Textarea = ({ id, label, description, value = '', onChange, rows = 3, disabled = false, placeholder }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
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
      className="xpo_block xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_resize-vertical"
    />
  </div>
);

// Password Input
export const PasswordInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div>
      <div className="xpo_flex xpo_items-center xpo_mb-1">
        <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
        {description && (
          <div className="xpo_ml-2 xpo_group xpo_relative">
            <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
            <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      <div className="xpo_relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="xpo_block xpo_w-full xpo_pr-10 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
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
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Calendar size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
      <input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
    </div>
  </div>
);

// Time Input
export const TimeInput = ({ id, label, description, value = '', onChange, disabled = false }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Clock size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
      <input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
    </div>
  </div>
);

// File Upload
export const FileUpload = ({ id, label, description, onChange, accept, disabled = false, multiple = false }) => {
  const [dragOver, setDragOver] = useState(false);
  
  return (
    <div>
      <div className="xpo_flex xpo_items-center xpo_mb-2">
        <label className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
        {description && (
          <div className="xpo_ml-2 xpo_group xpo_relative">
            <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
            <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
              {description}
            </div>
          </div>
        )}
      </div>
      <div
        className={`xpo_border-2 xpo_border-dashed xpo_rounded-lg xpo_p-6 xpo_text-center xpo_transition-colors ${
          dragOver ? 'xpo_border-blue-500 xpo_bg-blue-50' : 'xpo_border-gray-300'
        } ${disabled ? 'xpo_opacity-50 xpo_cursor-not-allowed' : 'xpo_cursor-pointer hover:xpo_border-gray-400'}`}
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
        <Upload size={24} className="xpo_mx-auto xpo_mb-2 xpo_text-gray-400" />
        <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-2">
          Drop files here or click to browse
        </p>
        <input
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          onChange={(e) => onChange && onChange(multiple ? Array.from(e.target.files) : e.target.files[0])}
          disabled={disabled}
          className="xpo_hidden"
        />
        <label
          htmlFor={id}
          className="xpo_inline-flex xpo_items-center xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white hover:xpo_bg-gray-50 xpo_cursor-pointer"
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
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Mail size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
      <input
        type="email"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
    </div>
  </div>
);

// Phone Input
export const PhoneInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder = "+1 (555) 000-0000" }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Phone size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
      <input
        type="tel"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
      />
    </div>
  </div>
);

// Search Input
export const SearchInput = ({ id, label, description, value = '', onChange, disabled = false, placeholder = "Search..." }) => (
  <div>
    <div className="xpo_flex xpo_items-center xpo_mb-1">
      <label htmlFor={id} className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{label}</label>
      {description && (
        <div className="xpo_ml-2 xpo_group xpo_relative">
          <HelpCircle size={14} className="xpo_text-gray-400 xpo_cursor-help" />
          <div className="xpo_invisible xpo_group-hover:xpo_visible xpo_absolute xpo_z-20 xpo_w-64 xpo_p-2 xpo_text-xs xpo_text-white xpo_bg-gray-800 xpo_rounded xpo_shadow-lg xpo_-top-2 xpo_left-6">
            {description}
          </div>
        </div>
      )}
    </div>
    <div className="xpo_relative">
      <Search size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
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