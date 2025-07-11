import React from 'react';

const PrintElement = ({ data, onChange }) => {
  const { id, label, description, type, default: defaultValue, options, repeatable } = data;

  const renderInputField = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'number':
      case 'color':
      case 'date':
      case 'time':
        return (
          <input
            type={type}
            className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_shadow-sm xpo_focus:ring-2 xpo_focus:ring-blue-400 xpo_focus:border-transparent xpo_p-2 xpo_transition duration-200 ease-in-out"
            id={id}
            onChange={e => onChange({ ...data, value: e.target.value })}
            placeholder={description}
            defaultValue={defaultValue}
          />
        );
      case 'button':
        return (
          <button
            id={id}
            type="button"
            className="xpo_mt-2 xpo_bg-blue-500 xpo_text-white xpo_font-semibold xpo_px-4 xpo_py-1 xpo_rounded-lg hover:xpo_bg-blue-600 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-400"
            onClick={() => onChange({ ...data, value: 'clicked' })}
          >
            {label}
          </button>
        );
      case 'textarea':
        return (
          <textarea
            className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_shadow-sm xpo_focus:ring-2 xpo_focus:ring-blue-400 xpo_focus:border-transparent xpo_p-2 xpo_transition duration-200 ease-in-out"
            id={id}
            onChange={e => onChange({ ...data, value: e.target.value })}
            placeholder={description}
            defaultValue={defaultValue}
          />
        );
      case 'select':
        return (
          <select
            className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_shadow-sm xpo_focus:ring-2 xpo_focus:ring-blue-400 xpo_focus:border-transparent xpo_p-2 xpo_transition duration-200 ease-in-out"
            id={id}
            onChange={e => onChange({ ...data, value: e.target.value })}
            defaultValue={defaultValue}
          >
            {Object.keys(options).map(key => (
              <option key={key} value={key}>
                {options[key]}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="xpo_flex xpo_items-center xpo_my-2">
            <input
              type="checkbox"
              id={id}
              checked={defaultValue}
              onChange={e => onChange({ ...data, value: e.target.checked })}
              className="xpo_mr-2 xpo_h-4 xpo_w-4 xpo_text-blue-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-blue-500"
            />
            <label htmlFor={id} className="xpo_text-sm xpo_text-gray-700">{label}</label>
          </div>
        );
      case 'json':
        return (
          <textarea
            className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_shadow-sm xpo_focus:ring-2 xpo_focus:ring-blue-400 xpo_focus:border-transparent xpo_p-2 xpo_transition duration-200 ease-in-out"
            id={id}
            onChange={e => onChange({ ...data, value: e.target.value })}
            placeholder={description}
            defaultValue={JSON.stringify(defaultValue, null, 2)}
          />
        );
      default:
        return null;
    }
  };

  const renderRepeatableFields = () => {
    if (!repeatable || repeatable.length === 0) return null;

    return (
      <div className="xpo_space-y-4 xpo_mt-4">
        {repeatable.map((group, groupIndex) => (
          <div key={groupIndex} className="xpo_p-4 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_bg-white">
            <h3 className="xpo_font-semibold xpo_text-lg">{`Group ${groupIndex + 1}`}</h3>
            <div className="xpo_space-y-2">
              {group.map((field, fieldIndex) => (
                <PrintElement
                  key={fieldIndex}
                  data={field}
                  onChange={updatedField => {
                    const updatedGroups = [...repeatable];
                    updatedGroups[groupIndex][fieldIndex] = updatedField;
                    onChange({ ...data, value: updatedGroups });
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className="xpo_bg-red-500 xpo_text-white xpo_px-2 xpo_py-1 xpo_rounded-md hover:xpo_bg-red-600"
              onClick={() => {
                const updatedGroups = repeatable.filter((_, index) => index !== groupIndex);
                onChange({ ...data, value: updatedGroups });
              }}
            >
              Remove Group
            </button>
          </div>
        ))}
        <button
          type="button"
          className="xpo_mt-2 xpo_bg-green-500 xpo_text-white xpo_px-3 xpo_py-2 xpo_rounded-md hover:xpo_bg-green-600"
          onClick={() => {
            const newGroup = repeatable[0].map(field => ({
              ...field,
              default: field.default || ""
            }));
            onChange({
              ...data,
              value: [...repeatable, newGroup]
            });
          }}
        >
          Add Another Group
        </button>
      </div>
    );
  };

  return (
    <div className="xpo_mb-6">
      <label htmlFor={id} className={`xpo_block xpo_text-base xpo_font-semibold xpo_text-gray-800`}>
        {label}
      </label>
      <p className="xpo_text-xs xpo_text-gray-500 xpo_mb-1">{description}</p>
      {renderInputField()}
      {renderRepeatableFields()}
    </div>
  );
};

export default PrintElement;