import { useState, useEffect } from 'react';
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
      <div className="w-full">
        <div className="h-10 bg-gray-200 rounded-lg dark:bg-gray-700 w-full"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
