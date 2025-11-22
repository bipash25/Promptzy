import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { projectService, promptService } from '@promptzy/shared';
import {
  Plus,
  Search,
  Star,
  FileText,
  Filter,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PromptCard from '../components/features/PromptCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function DashboardPage() {
  const navigate = useNavigate();
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleToggleFavorite = async (promptId) => {
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
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      loadPrompts({ projectId: selectedProject });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadProjects();
        await loadPrompts({ projectId: selectedProject });
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [selectedProject]);

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !filterFavorites || p.favorite;
    return matchesSearch && matchesFavorite;
  });

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedProject ? currentProject?.name : 'All Prompts'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/editor/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={filterFavorites ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setFilterFavorites(!filterFavorites)}
              title="Toggle Favorites"
            >
              <Star className={filterFavorites ? "fill-yellow-500 text-yellow-500" : ""} size={18} />
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button
              variant={viewMode === 'grid' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </Button>
            <Button
              variant={viewMode === 'list' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={18} />
            </Button>
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {searchQuery
                ? "Try adjusting your search terms or filters."
                : "Get started by creating your first prompt."}
            </p>
            <Button onClick={() => navigate('/editor/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Prompt
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-3"
          }>
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}