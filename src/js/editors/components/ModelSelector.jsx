import React, { useState, useEffect } from 'react';
import { get_models } from '../ai';
import { __ } from '../utils';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const availableModels = await get_models();
        setModels(availableModels);
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="xpo_w-full">
        <div className="xpo_h-10 xpo_bg-gray-200 xpo_rounded-lg dark:xpo_bg-gray-700 xpo_w-full"></div>
      </div>
    );
  }

  return (
    <div className="xpo_relative xpo_w-full">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
      >
        <option value="">{__('Select a model')}</option>
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
