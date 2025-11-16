import React, { useState, useEffect } from 'react';
import { promptService } from '@promptzy/shared';
import { Link as LinkIcon, Plus, X, ArrowRight, Play } from 'lucide-react';

export default function PromptChainEditor({ promptId, onClose }) {
  const [prompt, setPrompt] = useState(null);
  const [linkedPrompts, setLinkedPrompts] = useState([]);
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [executionResult, setExecutionResult] = useState('');

  useEffect(() => {
    loadPromptData();
  }, [promptId]);

  const loadPromptData = async () => {
    try {
      const data = await promptService.getById(promptId);
      setPrompt(data);
      setLinkedPrompts(data.prompt_links || []);
      
      // Load all available prompts for linking
      const all = await promptService.getAll();
      setAvailablePrompts(all.filter(p => p.id !== promptId));
    } catch (error) {
      console.error('Failed to load prompt data:', error);
    }
  };

  const handleAddLink = async (targetPromptId) => {
    try {
      await promptService.linkPrompts(promptId, targetPromptId, linkedPrompts.length);
      await loadPromptData();
      setShowAddModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add link:', error);
      alert('Failed to link prompt');
    }
  };

  const handleRemoveLink = async (targetPromptId) => {
    try {
      await promptService.unlinkPrompts(promptId, targetPromptId);
      await loadPromptData();
    } catch (error) {
      console.error('Failed to remove link:', error);
      alert('Failed to unlink prompt');
    }
  };

  const handleExecuteChain = async () => {
    let result = prompt.content;
    
    for (const link of linkedPrompts.sort((a, b) => a.order_index - b.order_index)) {
      const targetPrompt = await promptService.getById(link.target_prompt_id);
      result += '\n\n---\n\n' + targetPrompt.content;
    }
    
    setExecutionResult(result);
  };

  const filteredPrompts = availablePrompts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LinkIcon className="text-blue-500" size={24} />
            <div>
              <h2 className="text-2xl font-bold">Prompt Chain</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Link prompts together for complex workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Chain Visualization */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Source Prompt */}
            <div className="card border-2 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{prompt?.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prompt?.word_count} words • Source prompt
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            {linkedPrompts.length > 0 && (
              <div className="flex justify-center">
                <ArrowRight className="text-gray-400" size={32} />
              </div>
            )}

            {/* Linked Prompts */}
            {linkedPrompts
              .sort((a, b) => a.order_index - b.order_index)
              .map((link, index) => (
                <div key={link.id}>
                  <div className="card border-2 border-green-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 2}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{link.target?.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Linked prompt
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveLink(link.target_prompt_id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  {index < linkedPrompts.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowRight className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
              ))}

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span>Add Prompt to Chain</span>
            </button>
          </div>

          {/* Execution Result */}
          {executionResult && (
            <div className="mt-6 card border-2 border-purple-500">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Play size={18} className="text-purple-500" />
                Chain Execution Result
              </h3>
              <pre className="text-sm whitespace-pre-wrap font-mono max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {executionResult}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {linkedPrompts.length} prompt{linkedPrompts.length !== 1 ? 's' : ''} in chain
          </p>
          <div className="flex gap-3">
            <button onClick={handleExecuteChain} className="btn-primary">
              <Play size={18} className="inline mr-2" />
              Execute Chain
            </button>
          </div>
        </div>
      </div>

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add Prompt to Chain</h3>
            
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input mb-4"
              autoFocus
            />

            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {filteredPrompts.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No prompts available
                </p>
              ) : (
                filteredPrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAddLink(p.id)}
                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {p.word_count} words
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}