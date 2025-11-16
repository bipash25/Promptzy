import React, { useState, useEffect } from 'react';
import { promptService } from '@promptzy/shared';
import { History, X, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function VersionHistory({ promptId, onClose, onRevert }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [promptId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await promptService.getVersions(promptId);
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (versionNumber) => {
    if (confirm(`Revert to version ${versionNumber}? This will create a new version with the old content.`)) {
      try {
        await promptService.revertToVersion(promptId, versionNumber);
        onRevert && onRevert();
        onClose();
      } catch (error) {
        console.error('Failed to revert:', error);
        alert('Failed to revert to version');
      }
    }
  };

  const getDiff = (oldText, newText) => {
    // Simple word-based diff
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    const added = newWords.filter(w => !oldWords.includes(w)).length;
    const removed = oldWords.filter(w => !newWords.includes(w)).length;
    return { added, removed };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="text-blue-500" size={24} />
            <div>
              <h2 className="text-2xl font-bold">Version History</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {versions.length} version{versions.length !== 1 ? 's' : ''} saved
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Versions List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading versions...</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center">
                <History className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">No version history yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Versions are created automatically when you edit the prompt
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {versions.map((version, index) => {
                  const isLatest = index === 0;
                  const diff = index < versions.length - 1
                    ? getDiff(versions[index + 1].content, version.content)
                    : null;

                  return (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedVersion?.id === version.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Version {version.version_number}</span>
                        {isLatest && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </p>
                      {diff && (
                        <div className="flex gap-2 text-xs">
                          {diff.added > 0 && (
                            <span className="text-green-600 dark:text-green-400">
                              +{diff.added} words
                            </span>
                          )}
                          {diff.removed > 0 && (
                            <span className="text-red-600 dark:text-red-400">
                              -{diff.removed} words
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Version Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedVersion.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Version {selectedVersion.version_number} •{' '}
                      {new Date(selectedVersion.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevert(selectedVersion.version_number)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                  >
                    <RotateCcw size={18} />
                    Revert to This
                  </button>
                </div>

                <div className="card bg-gray-50 dark:bg-gray-900">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {selectedVersion.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Eye className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a version to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}