### **Product Edit Metabox Design Overview**

You will build a React component with **multiple tabs** that cover different logical sections of product data, similar to WooCommerce's meta box but tailored for your system and features.

---

### **Tabs and Their Fields**

1. **General Tab**
   - Product Type (Simple / Variable) — Dropdown
   - SKU (if applicable)
   - Price
   - Sale Price (optional, with schedule dates)
   - Description (Editor)
   - Short Description (Editor or textarea)
   - Product Images (Primary thumbnail, Gallery images uploader)
   - Product Status (Published, Draft, Archived etc)
   
2. **Variations Tab**
   - Listing of Variations with ability to add/remove each variation (static, no attributes/auto-generation)
   - For each variation:
     - Variation Name (text)
     - Variation SKU
     - Variation Description (textarea/editor)
     - Price Override (optional, decimal)
     - Quantity/Stock (managed here per variation)
     - Gallery Images — image picker/uploader for variation-specific gallery
     - Custom Title (text) — overrides variation display name if needed
   - Ability to reorder variations
   
3. **Stock Management Tab**
   - Global Stock Quantity (for simple products or aggregate for variable)
   - Stock Status (In stock, Out of stock, On backorder)
   - Allow backorders? (Yes/No)
   - Stock thresholds/notifications (min stock alert levels)
   - Stock Location(s) (Vendor + Warehouse linking UI)
     - Search and select Vendors (autocomplete dropdown)
     - For each selected vendor, select Warehouses (optional, multi-select)
     - Display current quantities for each warehouse (editable)
   - Penalty score alerts/warnings (optional display-only from your tables)

4. **Shipping Tab**
   - Weight (decimal, unit kg or lb)
   - Dimensions (Length, Width, Height with unit selector)
   - Select one or multiple Vendors (searchable)
   - For each vendor:
     - Select one or multiple Warehouses (optional)
     - Shipping classes or categories (optional)
     - Shipping restrictions or notes (textarea)
   - Shipping Cost (per vendor/warehouse, or flat rate)
   - Delivery Time Estimate (text or select options)
   
5. **SEO Tab**
   - SEO Title (text, with character count)
   - Meta Description (textarea)
   - Focus Keyword (text)
   - Canonical URL (text)
   - Social Share Preview (optional preview pane)
   - Robots Meta Tag (index, noindex, follow/nofollow toggles)
   - Additional SEO metadata (if needed, e.g. rich snippet schema JSON editor)
   
6. **Linked Products Tab** (optional but useful)
   - Cross-sells: Select related products
   - Upsells: select upsell products
   - Grouped Products: select grouped products
   
7. **Advanced Tab** (optional)
   - Purchase notes (textarea)
   - Custom CSS/JS (code editors)
   - Product visibility (search result, catalog only, hidden)
   - Enable product reviews? (toggle)
   - Custom flags or tags (extra metadata)
   
---

### **UI/UX Considerations**

- **Tabs Navigation** on the left side or top bar.
- Clear, contextual help tooltips like WooCommerce for each field.
- Validation and warnings (e.g., when stock quantity is 0, show "Out of stock").
- Save and preview buttons that reflect current product updates.
- Async autosave for fields when possible for better UX.
- Vendor / Warehouse selectors with multi-level search and dependent selects.
- Gallery/media uploaders supporting drag & drop and multiple selection.
- Variation UI should allow expand/collapse each variation to keep UI clean.
- Variation image gallery: Could be a small carousel or thumbnail list.

---

### **Simplified Variation System**

- Avoid too many attribute dependencies.
- Variation fields are complete standalone mini-products:
  - Name
  - SKU
  - Description
  - Price
  - Images
  - Stock
  - Custom Titles
- Variations managed independently within the product edit screen without attributes.

---

### **Data Flow Considerations**

- Save variations as separate posts (`sc_variation`), linked by `product_id`.
- Use your `products_meta` table for custom meta data storage.
- Vendor and Warehouse selection connect to your custom tables.
- Stock quantities can be synced with `productat` table.
- Notifications can be triggered after order placed, using your `notifications` table, based on linked vendor data.

---

### **Example Tab Field Breakdown**

#### 1. General Tab Example Fields:
```jsx
<ProductTypeDropdown options={['Simple', 'Variable']} />
<TextField label="SKU" />
<NumberField label="Price" />
<DateRangePicker label="Sale Price Schedule" />
<RichTextEditor label="Description" />
<ImageUploader label="Primary Image" multiple={false} />
<GalleryUploader label="Product Gallery" multiple={true} />
```

#### 2. Variations Tab Example:

```jsx
<VariationList>
  {variations.map((v, index) => (
    <VariationItem key={v.id}>
      <TextField label="Variation Name" value={v.name} />
      <TextField label="SKU" value={v.sku} />
      <RichTextEditor label="Description" value={v.description} />
      <NumberField label="Price Override" value={v.priceOverride} />
      <NumberField label="Stock Quantity" value={v.stock} />
      <ImageUploader label="Variation Gallery" multiple={true} />
      <TextField label="Custom Title" value={v.customTitle} />
      <Button onClick={() => removeVariation(index)}>Remove</Button>
    </VariationItem>
  ))}
  <Button onClick={addNewVariation}>Add Variation</Button>
</VariationList>
```

---

### Final Notes

- This design maintains maximum flexibility and control yet keeps your simpler variation approach.
- Use React component state management to handle dynamic data.
- Persist meta with REST API endpoints hooked into WordPress custom table structures.
- Ensure all selected vendors and warehouses data integrity is enforced on backend.
- Provide extensible hooks so you can add fields in the future if needed.


your component ProductMetabox.jsx