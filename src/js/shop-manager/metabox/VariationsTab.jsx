import { useState, useEffect, useCallback } from "react";
import { GripVertical, ChevronDown, Trash2 } from "lucide-react";
import { Popup } from "@js/utils";
import axios from "axios";
import { rest_url, notify } from "@functions";
import { __ } from "@js/utils";

const TextInput = ({ ...props }) => (
  <input
    type="text"
    className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
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
      className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_min-h-[200px]"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      {...props}
    />
  );
};

const Button = ({ children, onClick, variant = "primary", disabled = false }) => {
  const baseClasses =
    "xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors";
  const variants = {
    primary:
      "xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700 disabled:xpo_bg-blue-400",
    secondary:
      "xpo_bg-gray-200 xpo_text-gray-800 hover:xpo_bg-gray-300 disabled:xpo_bg-gray-100",
    danger:
      "xpo_bg-red-600 xpo_text-scwhite hover:xpo_bg-red-700 disabled:xpo_bg-red-400",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${
        disabled ? "xpo_cursor-not-allowed" : "xpo_cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
};

const VariationsTab = ({ variations = [], onMetaChange, attributes = [], product_id }) => {
  const [openVariation, setOpenVariation] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      axios
        .get(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations`))
        .then((res) => res.data)
        // .then(res => setVariations(res));
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(delay);
  }, [variations, product_id]);

  const addVariation = useCallback(
    (attr) => {
      const newVariation = {
        sku: "",
        price: "",
        product_id,
        gallery: [],
        sale_price: "",
        description: "",
        specifications: [],
        title: `Variation #${variations.length + 1}`,
      };
      axios
        .post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/0`), {
          variation_data: newVariation,
          attributes: attr,
        })
        .then((res) => res.data)
        .then((data) => data?.id && onMetaChange([...variations, { id: data.id, ...newVariation }]))
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
        const { id: variation_id, ...variation_data } = variation;
        axios
          .post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations/${variation_id}`), {
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
          <div className="xpo_flex xpo_flex-col xpo_gap-3">
            {specifications.map((row, rowIndex) => (
              <div key={rowIndex} className="xpo_p-4 xpo_flex xpo_gap-3">
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
                className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors xpo_bg-gray-600 xpo_text-scwhite hover:xpo_bg-gray-700 disabled:xpo_bg-gray-400 xpo_cursor-pointer"
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
          <div className="xpo_flex xpo_flex-col xpo_gap-3">
            {gallery.map((row, rowIndex) => (
              <div key={rowIndex} className="xpo_p-4 xpo_flex xpo_gap-3">
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
                className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors xpo_bg-gray-600 xpo_text-scwhite hover:xpo_bg-gray-700 disabled:xpo_bg-gray-400 xpo_cursor-pointer"
              >
                {__("Add Item", "site-core")}
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="xpo_p-4 xpo_border-t xpo_border-gray-200 xpo_bg-scwhite">
        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
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
        <div className="xpo_mt-4">
          <Textarea
            value={variation.description || ""}
            onChange={(data) => setVariation((prev) => ({ ...prev, description: data }))}
          />
        </div>
        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_mt-4">
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
        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_mt-4">
          <button
            type="button"
            onClick={() => setPopup(<GalleryPopup items={variation.gallery} />)}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors xpo_bg-gray-600 xpo_text-scwhite hover:xpo_bg-gray-700 disabled:xpo_bg-gray-400 xpo_cursor-pointer"
          >
            {__("Gallery", "site-core")}
          </button>
          <button
            type="button"
            onClick={() => setPopup(<SpecificationsPopup items={variation.specifications} />)}
            className="xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors xpo_bg-gray-600 xpo_text-scwhite hover:xpo_bg-gray-700 disabled:xpo_bg-gray-400 xpo_cursor-pointer"
          >
            {__("Specifications", "site-core")}
          </button>
        </div>
      </div>
    );
  };

  const SelectAttributes = () => {
    const [selected, setSelected] = useState([]);

    const toggleSelect = (label) => {
      setSelected((prev) => {
        if (prev.find((s) => s.label === label)) {
          return prev.filter((s) => s.label !== label);
        }
        const found = attributes.find((att) => att.label === label);
        if (found) return [...prev, found];
        return prev;
      });
    };

    return (
      <div className="xpo_flex xpo_flex-col xpo_gap-3 xpo_p-4 xpo_w-80">
        <h2 className="xpo_text-lg xpo_font-semibold">{__("Select Attributes", "site-core")}</h2>
        <div className="xpo_mb-2">
          {selected.length > 0 && (
            <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
              {selected.map((s, sI) => (
                <span
                  key={sI}
                  className="xpo_bg-blue-100 xpo_text-blue-700 xpo_px-2 xpo_py-1 xpo_rounded"
                >
                  {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="xpo_border xpo_border-gray-300 xpo_rounded xpo_max-h-48 xpo_overflow-y-auto">
          {attributes.map((att, attI) => {
            const isSelected = selected.find((s) => s.label === att.label);
            return (
              <div
                key={attI}
                onClick={() => toggleSelect(att.label)}
                className={`xpo_p-2 xpo_cursor-pointer hover:xpo_bg-gray-100 ${
                  isSelected ? "xpo_bg-blue-200" : ""
                }`}
              >
                {att.label}
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addVariation(selected);
            setPopup(null);
          }}
          disabled={selected.length === 0}
        >
          {__("Create Variation", "site-core")}
        </Button>
      </div>
    );
  };

  const ConfirmDelete = ({ id, onConfirm, onCancel }) => (
    <div className="xpo_p-6">
      <h3 className="xpo_text-lg xpo_font-bold">{__("Confirm Deletion", "site-core")}</h3>
      <p className="xpo_my-4">
        {__("Are you sure you want to delete this variation? This action cannot be undone.", "site-core")}
      </p>
      <div className="xpo_flex xpo_justify-end xpo_gap-4 xpo_mt-6">
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
    <div className="xpo_space-y-4">
      <div className="xpo_space-y-2">
        {variations.map((v, index) => (
          <div key={v.id} className="xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded">
            <div className="xpo_flex xpo_items-center xpo_p-3">
              <GripVertical className="xpo_cursor-move xpo_text-gray-400" size={20} />
              <span className="xpo_font-semibold xpo_ml-2">{v.title || `Variation #${index + 1}`}</span>
              <div className="xpo_ml-auto xpo_flex xpo_items-center xpo_gap-2">
                <button
                  onClick={() => setOpenVariation(openVariation === v.id ? null : v.id)}
                  className="xpo_p-1 xpo_transition-transform"
                  aria-label={__("Toggle variation details", "site-core")}
                >
                  <ChevronDown
                    size={20}
                    className={`xpo_transition-transform ${openVariation === v.id ? "xpo_rotate-180" : ""}`}
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
                  className="xpo_p-1 xpo_text-red-500 hover:xpo_text-red-700 xpo_transition-colors"
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
      <div className="xpo_mt-4 xpo_flex xpo_flex-wrap xpo_gap-4 xpo_items-center">
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
