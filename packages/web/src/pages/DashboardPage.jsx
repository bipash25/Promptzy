import React, { useEffect, useState, useDeferredValue, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { promptService } from '@promptzy/shared';
import {
  Plus,
  Search,
  Star,
  FileText,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  SortAsc,
  SortDesc,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PromptCard from '../components/features/PromptCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import TemplateLibrary from '../components/features/TemplateLibrary';

// Custom hook for debounced search
function useDebouncedSearch(searchQuery, prompts, filterFavorites, sortBy, sortOrder) {
  const deferredQuery = useDeferredValue(searchQuery);
  const isSearching = searchQuery !== deferredQuery;

  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter((p) => {
      const query = deferredQuery.toLowerCase();
      const matchesSearch = !query ||
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)));
      const matchesFavorite = !filterFavorites || p.favorite;
      return matchesSearch && matchesFavorite;
    });

    // Sort the results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'updated_at':
        default:
          comparison = new Date(a.updated_at) - new Date(b.updated_at);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [prompts, deferredQuery, filterFavorites, sortBy, sortOrder]);

  return { filteredPrompts, isSearching };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    user,
    projects,
    prompts,
    selectedProject,
    loadProjects,
    loadPrompts,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Persist view mode preference
    return localStorage.getItem('promptzy_viewMode') || 'grid';
  });
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Use debounced search
  const { filteredPrompts, isSearching } = useDebouncedSearch(
    searchQuery,
    prompts,
    filterFavorites,
    sortBy,
    sortOrder
  );

  const handleToggleFavorite = useCallback(async (promptId) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      // Optimistic update
      const updatedPrompts = prompts.map(p =>
        p.id === promptId ? { ...p, favorite: !p.favorite } : p
      );
      // Update local state immediately for better UX
      useStore.setState({ prompts: updatedPrompts });

      // Update in backend
      await promptService.update(promptId, { favorite: !prompt.favorite });

      showToast(
        prompt.favorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('Failed to update favorite', 'error');
      // Revert on error
      loadPrompts({ projectId: selectedProject });
    }
  }, [prompts, selectedProject, loadPrompts, showToast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPrompts({ projectId: selectedProject });
      showToast('Prompts refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh prompts', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProject, loadPrompts, showToast]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('promptzy_viewMode', mode);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadProjects();
        await loadPrompts({ projectId: selectedProject });
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load prompts', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedProject, loadProjects, loadPrompts, showToast]);

  const currentProject = projects.find(p => p.id === selectedProject);

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your prompts...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedProject ? currentProject?.name : 'All Prompts'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSearching ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching...
                </span>
              ) : (
                `${filteredPrompts.length} prompt${filteredPrompts.length !== 1 ? 's' : ''} found`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh prompts"
              aria-label="Refresh prompts"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate('/editor/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </div>
        </header>

        {/* Filters & Search */}
        <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm"
          role="search"
          aria-label="Search and filter prompts"
        >
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              placeholder="Search prompts by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Search prompts"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-end">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Sort by"
            >
              <option value="updated_at">Last Modified</option>
              <option value="created_at">Created Date</option>
              <option value="title">Title</option>
            </select>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSortOrder}
              title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
              aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </Button>

            <div className="h-6 w-px bg-border mx-1" aria-hidden="true" />

            <Button
              variant={filterFavorites ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setFilterFavorites(!filterFavorites)}
              title={filterFavorites ? "Show all prompts" : "Show favorites only"}
              aria-label={filterFavorites ? "Show all prompts" : "Show favorites only"}
              aria-pressed={filterFavorites}
            >
              <Star className={filterFavorites ? "fill-yellow-500 text-yellow-500" : ""} size={18} />
            </Button>

            <div className="h-6 w-px bg-border mx-1" aria-hidden="true" />

            <div role="group" aria-label="View mode">
              <Button
                variant={viewMode === 'grid' ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleViewModeChange('grid')}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleViewModeChange('list')}
                title="List view"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <ListIcon size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <main>
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No prompts found</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {searchQuery
                  ? "Try adjusting your search terms or filters."
                  : filterFavorites
                    ? "You haven't favorited any prompts yet."
                    : "Get started by creating your first prompt."}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={clearSearch}>
                  Clear Search
                </Button>
              ) : filterFavorites ? (
                <Button variant="outline" onClick={() => setFilterFavorites(false)}>
                  Show All Prompts
                </Button>
              ) : (
                <Button onClick={() => navigate('/editor/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prompt
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3"
              }
              role="list"
              aria-label="Prompts list"
            >
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={handleToggleFavorite}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Template Library Modal */}
      <TemplateLibrary
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </MainLayout>
  );
}