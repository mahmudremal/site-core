import React from 'react';
import { ShoppingCart, Tag, Flame } from 'lucide-react';

const allCategories = {
  electronics: { id: 1, name: 'Electronics', icon: <ShoppingCart size={24} /> },
  fashion: { id: 2, name: 'Fashion', icon: <Tag size={24} /> },
  home: { id: 3, name: 'Home', icon: <Flame size={24} /> },
  toys: { id: 4, name: 'Toys', icon: <ShoppingCart size={24} /> },
};

const CategoryGrid = ({ categories }) => {
  // In a real application, you might fetch category data
  const displayCategories = categories.map(cat => allCategories[cat]).filter(Boolean);

  return (
    <section className="xpo_mb-12">
      <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-6">Shop by Category</h2>
      <div className="xpo_grid xpo_grid-cols-2 sm:xpo_grid-cols-4 xpo_gap-6">
        {displayCategories.map(({ id, name, icon }) => (
          <div
            key={id}
            className="xpo_flex xpo_flex-col xpo_items-center xpo_p-4 xpo_bg-scwhite/70  xpo_rounded-lg xpo_shadow-md hover:xpo_shadow-xl xpo_cursor-pointer xpo_transition-shadow"
          >
            <div className="xpo_text-indigo-600">{icon}</div>
            <span className="xpo_mt-2 xpo_text-lg xpo_font-medium">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
