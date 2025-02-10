import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export function Settings() {
  const [keywords, setKeywords] = useState<Array<{ keyword: string; response: string }>>([]);

  const addKeyword = () => {
    setKeywords([...keywords, { keyword: '', response: '' }]);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Keyword Settings
          </h3>
          <button
            onClick={addKeyword}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Keyword
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {keywords.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keyword
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter keyword"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Auto-Reply Message
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter response message"
                />
              </div>
            </div>
          ))}

          {keywords.length === 0 && (
            <p className="text-gray-500 text-sm">No keywords configured</p>
          )}
        </div>
      </div>
    </div>
  );
}