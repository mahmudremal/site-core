import React from 'react';

const ContentBlock = ({ contentId }) => {
  // In a real application, you would fetch content based on contentId
  const content = {
    'how-to-shop': {
      title: 'How to Shop',
      body: 'Welcome to our store! Here you can find a wide variety of products. Use the search bar to find what you are looking for, or browse through the categories. Add items to your cart and proceed to checkout when you are ready.',
    },
  };

  const block = content[contentId] || {
    title: 'Content Block',
    body: 'This is a generic content block. Replace this with your own content.',
  };

  return (
    <section className="xpo_mb-12 xpo_p-6 xpo_bg-gray-100 xpo_rounded-lg">
      <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-4">{block.title}</h2>
      <p>{block.body}</p>
    </section>
  );
};

export default ContentBlock;
