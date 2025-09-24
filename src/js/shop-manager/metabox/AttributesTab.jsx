import { useState, useEffect, useCallback } from "react";
import { Trash2, ChevronDown, GripVertical, X } from "lucide-react";
import { Popup } from "@js/utils";
import axios from "axios";
import { rest_url, notify } from "@functions";
import { __ } from "@js/utils";

const AttributesTab = ({ attributes, setAttributes, product_id }) => {
  const [popup, setPopup] = useState(null);
  const [openAttribute, setOpenAttribute] = useState(null);
  const [allAttributes, setAllAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAttributes, setFilteredAttributes] = useState([]);

  useEffect(() => {
    if (attributes?.length) return;
    const delay = setTimeout(() => {
      axios
        .get(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes`))
        .then((res) => res.data)
        .then((res) => setAttributes(res));
    }, 1500);
    return () => clearTimeout(delay);
  }, [attributes, product_id, setAttributes]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAttributes([]);
      return;
    }
    const delay = setTimeout(() => {
      axios
        .get(rest_url(`/sitecore/v1/ecommerce/attributes`), { params: { q: searchTerm } })
        .then((res) => res.data)
        .then((res) => setFilteredAttributes(res.data || []))
        .catch(() => setFilteredAttributes([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const addAttribute = useCallback(
    (attr) => {
      if (!attr) return;
      const exists = attributes.find((a) => a.label === attr.label);
      if (exists) {
        notify.error(__('Attribute already added', 'site-core'));
        return;
      }
      const newAttribute = {
        type: attr.type || "select",
        label: attr.label,
        // items: attr.items || [],
      };
      axios.post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/0`), { attribute_data: newAttribute })
      .then((res) => res.data)
      .then((data) => {
        if (data?.id) setAttributes([...attributes, { id: data.id, items: attr.items || [], ...newAttribute }]);
        setPopup(null);
      })
      .catch((err) => notify.error(err));
    },
    [attributes, product_id, setAttributes]
  );

  const removeAttribute = useCallback(
    (attribute_id) => {
      const updatedAttributes = attributes.filter((a) => a.id !== attribute_id);
      axios
        .delete(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/${attribute_id}`))
        .then(() => {
          setPopup(null);
          setAttributes(updatedAttributes);
        })
        .catch((err) => notify.error(err));
    },
    [attributes, product_id, setAttributes]
  );

  const handleAttributeChange = useCallback(
    (id, key, value) => {
      const updated = attributes.map((a) => (a.id === id ? { ...a, [key]: value } : a));
      setAttributes(updated);
    },
    [attributes, setAttributes]
  );

  const SingleAttribute = ({ attribute }) => {
    const [attr, setAttr] = useState({ ...attribute });
    const [firstCall, setFirstCall] = useState(false);
    const [items, setItems] = useState(attr.items || []);

    useEffect(() => {
      if (!firstCall) return setFirstCall(true);
      const delay = setTimeout(() => {
        const { id: attribute_id, items: _, ...attribute_data } = attr;
        axios
          .post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/${attribute_id}`), { attribute_data })
          .catch((err) => notify.error(err));
      }, 1500);
      return () => clearTimeout(delay);
    }, [attr, firstCall, product_id]);

    useEffect(() => {
      setAttr((prev) => ({ ...prev, items }));
    }, [items]);

    const addItem = useCallback(async () => {
      setPopup(
        <AddAttributeItemPopup
          onAdd={(newItem) => {
            if (!newItem?.name) return;
            const exists = items.find((i) => i.name === newItem.name);
            if (exists) {
              notify.error(__('Item already exists', 'site-core'));
              return;
            }
            const newItemData = {
              name: newItem.name,
              slug: newItem.name.toLowerCase().replaceAll(" ", "-"),
            };
            axios
              .post(
                rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/${attr.id}/items/0`),
                { item_data: newItemData }
              )
              .then((res) => res.data)
              .then((data) => {
                if (data?.id) setItems((prev) => [...prev, { ...newItemData, id: data.id }]);
                setPopup(null);
              })
              .catch((err) => notify.error(err));
          }}
          onCancel={() => setPopup(null)}
        />
      );
    }, [attr.id, items, product_id]);

    const AttributeItem = ({ item }) => {
      const [localItem, setLocalItem] = useState({ ...item });
      const [firstCallItem, setFirstCallItem] = useState(false);

      useEffect(() => {
        if (!firstCallItem) return setFirstCallItem(true);
        const delay = setTimeout(() => {
          const { id: item_id, ...item_data } = localItem;
          axios
            .post(
              rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/${attr.id}/items/${item_id}`),
              { item_data }
            )
            .catch((err) => notify.error(err));
        }, 1500);
        return () => clearTimeout(delay);
      }, [localItem, firstCallItem, attr.id, product_id]);

      const removeItem = () => {
        axios
          .delete(
            rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/attributes/${attr.id}/items/${localItem.id}`)
          )
          .then(() => {
            setItems((prev) => prev.filter((i) => i.id !== localItem.id));
          })
          .catch((err) => notify.error(err));
      };

      return (
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_border xpo_border-gray-300 xpo_p-2 xpo_rounded-md">
          <input
            type="text"
            className="xpo_flex-1 xpo_p-1 xpo_border xpo_border-gray-300 xpo_rounded-md"
            value={localItem.name}
            onChange={(e) => setLocalItem((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={__('Item Name', 'site-core')}
          />
          <button
            type="button"
            onClick={removeItem}
            className="xpo_text-red-600 hover:xpo_text-red-800"
            aria-label={__('Remove item', 'site-core')}
          >
            <X size={16} />
          </button>
        </div>
      );
    };

    return (
      <div className="xpo_p-4 xpo_border-t xpo_border-gray-200 xpo_bg-scwhite xpo_flex xpo_flex-col xpo_gap-4">
        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
          <input
            type="text"
            className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
            value={attr.label || ""}
            placeholder={__('Attribute Label', 'site-core')}
            onChange={(e) => setAttr((prev) => ({ ...prev, label: e.target.value }))}
          />
          <select
            className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
            value={attr.type || ""}
            onChange={(e) => setAttr((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="select">{__('Select', 'site-core')}</option>
            <option value="color">{__('Color', 'site-core')}</option>
            <option value="checkbox">{__('Checkbox', 'site-core')}</option>
          </select>
        </div>
        <div className="xpo_w-full xpo_min-h-24">
          <h2 className="xpo_font-semibold xpo_mb-2">{__('Attribute Items', 'site-core')}</h2>
          <div className="xpo_flex xpo_flex-col xpo_gap-2 xpo_mb-2">
            {items.map((item, i) => (
              <AttributeItem key={item.id || i} item={item} />
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700"
          >
            {__('Add new', 'site-core')}
          </button>
        </div>
      </div>
    );
  };

  const AddAttributePopup = () => {
    const [label, setLabel] = useState("");
    const [type, setType] = useState("select");

    const handleAdd = () => {
      if (!label.trim()) {
        notify.error(__('Attribute label is required', 'site-core'));
        return;
      }
      addAttribute({ label: label.trim(), type });
    };

    return (
      <div className="">
        <h3 className="xpo_text-lg xpo_font-bold xpo_mb-4">{__('Add New Attribute', 'site-core')}</h3>
        <label className="xpo_block xpo_font-semibold xpo_mb-1">{__('Label', 'site-core')}</label>
        <input
          type="text"
          className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_mb-4"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={__('Attribute Label', 'site-core')}
        />
        <label className="xpo_block xpo_font-semibold xpo_mb-1">{__('Type', 'site-core')}</label>
        <select
          className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_mb-4"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="select">{__('Select', 'site-core')}</option>
          <option value="color">{__('Color', 'site-core')}</option>
          <option value="checkbox">{__('Checkbox', 'site-core')}</option>
        </select>
        <div className="xpo_flex xpo_justify-end xpo_gap-4">
          <button
            type="button"
            onClick={() => setPopup(null)}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_bg-gray-200 xpo_text-gray-800 hover:xpo_bg-gray-300"
          >
            {__('Cancel', 'site-core')}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700"
          >
            {__('Add Attribute', 'site-core')}
          </button>
        </div>
      </div>
    );
  };

  const AddAttributeItemPopup = ({ onAdd, onCancel }) => {
    const [name, setName] = useState("");

    const handleAdd = () => {
      if (!name.trim()) {
        notify.error(__('Item name is required', 'site-core'));
        return;
      }
      onAdd({ name: name.trim() });
    };

    return (
      <div className="">
        <h3 className="xpo_text-lg xpo_font-bold xpo_mb-4">{__('Add New Item', 'site-core')}</h3>
        <input
          type="text"
          className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={__('Item Name', 'site-core')}
        />
        <div className="xpo_flex xpo_justify-end xpo_gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_bg-gray-200 xpo_text-gray-800 hover:xpo_bg-gray-300"
          >
            {__('Cancel', 'site-core')}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700"
          >
            {__('Add Item', 'site-core')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="xpo_space-y-4">
      <div className="xpo_space-y-2">
        {attributes.map((attr, index) => (
          <div key={attr.id} className="xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded">
            <div className="xpo_flex xpo_items-center xpo_p-3">
              <GripVertical className="xpo_cursor-move xpo_text-gray-400" size={20} />
              <span className="xpo_font-semibold xpo_ml-2">{attr.label || `Attribute #${index + 1}`}</span>
              <div className="xpo_ml-auto xpo_flex xpo_items-center xpo_gap-2">
                <button
                  onClick={() => setOpenAttribute((prev) => (prev === attr.id ? null : attr.id))}
                  className="xpo_p-1 xpo_transition-transform"
                  aria-label={__('Toggle attribute details', 'site-core')}
                >
                  <ChevronDown
                    size={20}
                    className={`xpo_transition-transform ${openAttribute === attr.id ? "xpo_rotate-180" : ""}`}
                  />
                </button>
                <button
                  onClick={() =>
                    setPopup(
                      <div className="xpo_p-6">
                        <h3 className="xpo_text-lg xpo_font-bold">{__('Confirm Deletion', 'site-core')}</h3>
                        <p className="xpo_my-4">
                          {__('Are you sure you want to delete this attribute? This action cannot be undone.', 'site-core')}
                        </p>
                        <div className="xpo_flex xpo_justify-end xpo_gap-4 xpo_mt-6">
                          <button
                            className="xpo_bg-gray-200 xpo_text-gray-800 xpo_px-4 xpo_py-2 xpo_rounded-md"
                            onClick={() => setPopup(null)}
                          >
                            {__('Cancel', 'site-core')}
                          </button>
                          <button
                            className="xpo_bg-red-600 xpo_text-scwhite xpo_px-4 xpo_py-2 xpo_rounded-md"
                            onClick={() => removeAttribute(attr.id)}
                          >
                            {__('Confirm', 'site-core')}
                          </button>
                        </div>
                      </div>
                    )
                  }
                  className="xpo_p-1 xpo_text-red-500 hover:xpo_text-red-700 xpo_transition-colors"
                  aria-label={__('Delete attribute', 'site-core')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {openAttribute === attr.id && <SingleAttribute attribute={attr} />}
          </div>
        ))}
      </div>
      <div className="xpo_mt-4">
        <button
          type="button"
          onClick={() => setPopup(<AddAttributePopup />)}
          className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700"
        >
          {__('Add Attribute', 'site-core')}
        </button>
      </div>
      {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
    </div>
  );
};

export default AttributesTab;
