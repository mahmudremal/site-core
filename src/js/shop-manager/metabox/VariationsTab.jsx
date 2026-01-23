import { useState, useEffect, useCallback } from "react";
import { GripVertical, ChevronDown, Trash2 } from "lucide-react";
import { Popup } from "@js/utils";
import axios from "axios";
import { rest_url, notify } from "@functions";
import { __ } from "@js/utils";

const TextInput = ({ ...props }) => (
  <input
    type="text"
    className="w-full p-2 border border-gray-300 rounded-md"
    {...props}
  />
);

const Textarea = ({ value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (localValue === value) return;
    const delay = setTimeout(() => {
      onChange?.(localValue);
    }, 1500);
    return () => clearTimeout(delay);
  }, [localValue, onChange, value]);

  return (
    <textarea
      className="w-full p-2 border border-gray-300 rounded-md min-h-[200px]"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      {...props}
    />
  );
};

const Button = ({ children, onClick, variant = "primary", disabled = false }) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors";
  const variants = {
    primary:
      "bg-blue-600 text-scwhite hover:bg-blue-700 disabled:bg-blue-400",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    danger:
      "bg-red-600 text-scwhite hover:bg-red-700 disabled:bg-red-400",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
    >
      {children}
    </button>
  );
};

const VariationsTab = ({ meta, variations = [], onMetaChange, attributes = [], product_id }) => {
  const [openVariation, setOpenVariation] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      axios
        .get(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations`))
        .then((res) => res.data)
        // .then(res => setVariations(res));
        .catch(() => { });
    }, 1500);
    return () => clearTimeout(delay);
  }, [variations, product_id]);

  const addVariation = useCallback(
    (attribute_items) => {
      const newVariation = {
        sku: '',
        product_id,
        gallery: [],
        specifications: [],
        price: meta?.price || '',
        sale_price: meta?.sale_price || '',
        description: meta?.description || '',
        title: [meta?.seo_title ?? `Variation #${product_id}`, ...attribute_items.map(i => i.name)].join(' - '),
      };
      axios
        .post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/0`), {
          variation_data: newVariation,
          attributes: attribute_items,
        })
        .then((res) => res.data)
        .then((data) => data?.id && onMetaChange([...variations, data]))
        .catch((err) => notify.error(err));
    },
    [variations, onMetaChange, product_id]
  );

  const removeVariation = useCallback(
    (variation_id) => {
      const updatedVariations = variations.filter((v) => v.id !== variation_id);
      axios
        .delete(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/${variation_id}`))
        .then(() => {
          setPopup(null);
          onMetaChange(updatedVariations);
        })
        .catch((err) => notify.error(err));
    },
    [variations, onMetaChange, product_id]
  );

  const handleVariationChange = useCallback(
    (id, key, value) => {
      const updated = variations.map((v) => (v.id === id ? { ...v, [key]: value } : v));
      onMetaChange(updated);
    },
    [variations, onMetaChange]
  );

  const SingleVariation = ({ v }) => {
    const [variation, setVariation] = useState({ ...v });
    const [firstCall, setFirstCall] = useState(false);

    useEffect(() => {
      if (!firstCall) return setFirstCall(true);
      const delay = setTimeout(() => {
        const { id: variation_id, attributes, ...variation_data } = variation;
        axios.post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/${variation_id}`), {
          variation_data,
        })
          .catch((err) => notify.error(err));
      }, 1500);
      return () => clearTimeout(delay);
    }, [variation, firstCall, product_id]);

    const SpecificationsPopup = ({ items }) => {
      const [specifications, setSpecifications] = useState(items);

      useEffect(() => {
        const delay = setTimeout(() => {
          setVariation((prev) => ({ ...prev, specifications }));
        }, 1500);
        return () => clearTimeout(delay);
      }, [specifications]);

      return (
        <div>
          <div className="flex flex-col gap-3">
            {specifications.map((row, rowIndex) => (
              <div key={rowIndex} className="p-4 flex gap-3">
                <TextInput
                  value={row.label || ""}
                  placeholder={__("Label", "site-core")}
                  onChange={(e) =>
                    setSpecifications((prev) =>
                      prev.map((spec, specIndex) =>
                        specIndex === rowIndex ? { ...spec, label: e.target.value } : spec
                      )
                    )
                  }
                />
                <TextInput
                  value={row.value || ""}
                  placeholder={__("Value", "site-core")}
                  onChange={(e) =>
                    setSpecifications((prev) =>
                      prev.map((spec, specIndex) =>
                        specIndex === rowIndex ? { ...spec, value: e.target.value } : spec
                      )
                    )
                  }
                />
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setSpecifications((prev) => [...prev, { label: "", value: "" }])}
                className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors bg-gray-600 text-scwhite hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer"
              >
                {__("Add Item", "site-core")}
              </button>
            </div>
          </div>
        </div>
      );
    };

    const GalleryPopup = ({ items }) => {
      const [gallery, setGallery] = useState(items);
      const [isFirstDrop, setIsFirstDrop] = useState(false);

      useEffect(() => {
        if (!isFirstDrop) return setIsFirstDrop(true);
        const delay = setTimeout(() => {
          setVariation((prev) => ({ ...prev, gallery }));
        }, 1500);
        return () => clearTimeout(delay);
      }, [gallery, isFirstDrop]);

      return (
        <div>
          <div className="flex flex-col gap-3">
            {gallery.map((row, rowIndex) => (
              <div key={rowIndex} className="p-4 flex gap-3">
                <TextInput
                  value={row.url || ""}
                  placeholder={__("Full Image URL", "site-core")}
                  onChange={(e) =>
                    setGallery((prev) =>
                      prev.map((i, iIndex) => (iIndex === rowIndex ? { ...i, url: e.target.value } : i))
                    )
                  }
                />
                <TextInput
                  value={row.thumbnail || ""}
                  placeholder={__("Thumbnail URL", "site-core")}
                  onChange={(e) =>
                    setGallery((prev) =>
                      prev.map((i, iIndex) => (iIndex === rowIndex ? { ...i, thumbnail: e.target.value } : i))
                    )
                  }
                />
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setGallery((prev) => [...prev, { url: "", thumbnail: "" }])}
                className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors bg-gray-600 text-scwhite hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer"
              >
                {__("Add Item", "site-core")}
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="p-4 border-t border-gray-200 bg-scwhite">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            value={variation.title || ""}
            placeholder={__("Variation Name", "site-core")}
            onChange={(e) => setVariation((prev) => ({ ...prev, title: e.target.value }))}
          />
          <TextInput
            value={variation.sku || ""}
            placeholder={__("SKU", "site-core")}
            onChange={(e) => setVariation((prev) => ({ ...prev, sku: e.target.value }))}
          />
        </div>
        <div className="mt-4">
          <Textarea
            value={variation.description || ""}
            onChange={(data) => setVariation((prev) => ({ ...prev, description: data }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <TextInput
            type="number"
            value={variation.price || ""}
            placeholder={__("Regular Price", "site-core")}
            onChange={(e) => setVariation((prev) => ({ ...prev, price: e.target.value }))}
          />
          <TextInput
            type="number"
            value={variation.sale_price || ""}
            placeholder={__("Sale price", "site-core")}
            onChange={(e) => setVariation((prev) => ({ ...prev, sale_price: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={() => setPopup(<GalleryPopup items={variation.gallery} />)}
            className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors bg-gray-600 text-scwhite hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer"
          >
            {__("Gallery", "site-core")}
          </button>
          <button
            type="button"
            onClick={() => setPopup(<SpecificationsPopup items={variation.specifications} />)}
            className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors bg-gray-600 text-scwhite hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer"
          >
            {__("Specifications", "site-core")}
          </button>
        </div>
      </div>
    );
  };

  // 
  const SelectAttributes = () => {
    const [selected, setSelected] = useState({});

    const toggleSelect = (attId, item) => {
      setSelected((prev) => {
        if (prev[attId]?.id === item.id) {
          const newSelected = { ...prev };
          delete newSelected[attId];
          return newSelected;
        }
        return { ...prev, [attId]: item };
      });
    };

    const selectedItems = Object.values(selected);
    const allAttributesSelected = Object.keys(selected).length === attributes.length;

    const getFilteredItems = (att) => {
      if (selected[att.id]) {
        return att.items.filter(Boolean);
      }
      if (Object.keys(selected).length === 0) {
        return att.items.filter(Boolean);
      }
      const currentIds = Object.fromEntries(
        Object.entries(selected).map(([aid, item]) => [aid, item.id])
      );
      return att.items.filter((item) => {
        const tempIds = { ...currentIds, [att.id]: item.id };
        const isDuplicate = variations.some((variation) => {
          const varMap = Object.fromEntries(
            variation.attributes.map((a) => [a.attribute_id, a.attribute_item_id])
          );
          return Object.entries(tempIds).every(([key, val]) => varMap[key] === val);
        });
        return !isDuplicate;
      });
    };

    return (
      <div className="flex flex-col gap-3 p-4 w-80">
        <h2 className="text-lg font-semibold">{__("Select Attributes", "site-core")}</h2>
        <div className="mb-2">
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((s, sI) => (
                <span key={sI} className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="border border-gray-300 rounded max-h-48 overflow-y-auto">
          {attributes.map((att) => (
            <div key={att.id} className="p-3 border-b border-gray-200 last:border-b-0">
              <h4 className="font-medium mb-2 text-sm text-gray-700">{att.label}</h4>
              <div className="space-y-1">
                {getFilteredItems(att).map((item) => {
                  const isSelected = selected[att.id]?.id === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelect(att.id, item);
                      }}
                      className={`flex items-center p-2 cursor-pointer hover:bg-gray-50 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                        }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm">{item.name} #{item.id}</span>
                    </label>
                  );
                })}
                {getFilteredItems(att).length === 0 && !selected[att.id] && (
                  <p className="text-sm text-gray-500 italic">No available options for this attribute based on current selections.</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addVariation(selectedItems);
            setPopup(null);
          }}
          disabled={!allAttributesSelected}
        >
          {__("Create Variation", "site-core")}
        </Button>
      </div>
    );
  };



  const ConfirmDelete = ({ id, onConfirm, onCancel }) => (
    <div className="p-6">
      <h3 className="text-lg font-bold">{__("Confirm Deletion", "site-core")}</h3>
      <p className="my-4">
        {__("Are you sure you want to delete this variation? This action cannot be undone.", "site-core")}
      </p>
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          {__("Cancel", "site-core")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {__("Confirm", "site-core")}
        </Button>
      </div>
    </div>
  );

  // Helper: generate all combinations of attribute items
  const generateCombinations = (attrs) => {
    if (!attrs.length) return [];
    const attrItems = attrs.map((attr) => attr.items || []);
    const combine = (arr) => {
      if (arr.length === 0) return [[]];
      const rest = combine(arr.slice(1));
      const result = [];
      for (const item of arr[0]) {
        for (const r of rest) {
          result.push([item, ...r]);
        }
      }
      return result;
    };
    return combine(attrItems);
  };

  // Check if a variation with exact attribute items exists
  const variationExists = (combination) => {
    return variations.some((variation) => {
      if (!variation.attributes) return false;
      if (variation.attributes.length !== combination.length) return false;
      // Check if all attribute items match (by name or slug)
      return combination.every((item) =>
        variation.attributes.some(
          (vAttr) =>
            vAttr.label === item.label &&
            (vAttr.name === item.name || vAttr.slug === item.slug)
        )
      );
    });
  };

  const handleGenerateVariations = () => {
    if (!attributes.length) {
      notify.error(__('No attributes available to generate variations.', 'site-core'));
      return;
    }
    // Prepare attributes with items as objects {name, slug, label}
    const preparedAttrs = attributes.map((attr) => ({
      ...attr,
      items: (attr.items || []).map((item) =>
        typeof item === "string"
          ? { name: item, slug: item.toLowerCase().replaceAll(" ", "-"), label: attr.label }
          : { ...item, label: attr.label }
      ),
    }));

    const allCombinations = generateCombinations(preparedAttrs);

    // Filter combinations that do not exist yet
    const newCombinations = allCombinations.filter((combination) => !variationExists(combination));

    if (!newCombinations.length) {
      notify.error(__('All possible variations already exist.', 'site-core'));
      return;
    }

    // Create variations for each new combination
    newCombinations.forEach((combination) => {
      const variationAttributes = combination.map((item) => ({
        label: item.label,
        name: item.name,
        slug: item.slug,
      }));
      const newVariation = {
        sku: "",
        price: "",
        product_id,
        gallery: [],
        sale_price: "",
        description: "",
        specifications: [],
        title: combination.map((item) => item.name).join(" / "),
        attributes: variationAttributes,
      };
      axios.post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/0`), {
        variation_data: newVariation,
        attributes: variationAttributes,
      })
        .then((res) => res.data)
        .then((data) => {
          if (data?.id) {
            onMetaChange([...variations, { id: data.id, ...newVariation }]);
          }
        })
        .catch((err) => notify.error(err));
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {variations.map((v, index) => (
          <div key={v.id} className="bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center p-3">
              <GripVertical className="cursor-move text-gray-400" size={20} />
              <span className="font-semibold ml-2">{v.title || `Variation #${index + 1}`}</span>
              <div className="flex gap-2 items-center ml-4">
                {v.attributes.map((attr, attrIndex) => <span key={attrIndex} className="bg-gray-300 px-2 rounded">{attr.name}</span>)}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setOpenVariation(openVariation === v.id ? null : v.id)}
                  className="p-1 transition-transform"
                  aria-label={__("Toggle variation details", "site-core")}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${openVariation === v.id ? "rotate-180" : ""}`}
                  />
                </button>
                <button
                  onClick={() =>
                    setPopup(
                      <ConfirmDelete
                        id={v.id}
                        onConfirm={() => removeVariation(v.id)}
                        onCancel={() => setPopup(null)}
                      />
                    )
                  }
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  aria-label={__("Delete variation", "site-core")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {openVariation === v.id && <SingleVariation v={v} />}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <Button onClick={handleGenerateVariations} variant="secondary">
          {__("Generate Variations", "site-core")}
        </Button>
        <Button onClick={() => setPopup(<SelectAttributes />)}>{__("Add Variation", "site-core")}</Button>
      </div>
      {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
    </div>
  );
};

export default VariationsTab;
