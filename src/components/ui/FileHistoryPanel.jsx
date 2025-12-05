//src\components\ui\FileHistoryPanel.jsx

"use client";

import React, { useState } from 'react';
import { 
  History, 
  Heart, 
  Trash2, 
  Download, 
  Upload, 
  // Clock, // Unused 
  FileText,
  Star,
  // MoreVertical, // Unused
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useFileHistory } from '@/lib/fileHistory';
import { formatFileSize } from '@/lib/utils';

const FileHistoryPanel = ({ className = '' }) => {
  const {
    history,
    favorites,
    removeFromHistory,
    removeFromFavorites,
    addToFavorites,
    clearHistory,
    clearFavorites,
    exportHistory,
    importHistory,
    getStats
  } = useFileHistory();

  const [filter, setFilter] = useState('all');
  // const [showActions, setShowActions] = useState({}); // Feature incomplete
  const stats = getStats();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.tool === filter);

  const uniqueTools = [...new Set(history.map(item => item.tool))];

  const handleAddToFavorites = async (item) => {
    try {
      await addToFavorites({
        name: item.fileName,
        size: item.fileSize,
        tool: item.tool,
        operation: item.operation
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const handleImportHistory = (event) => {
    const file = event.target.files[0];
    if (file) {
      importHistory(file).catch(error => {
        console.error('Import failed:', error);
      });
    }
  };

  const [currentTab, setCurrentTab] = useState('history');

  // const toggleActions = (itemId) => { // Feature incomplete
  //   setShowActions(prev => ({
  //     ...prev,
  //     [itemId]: !prev[itemId]
  //   }));
  // };

  const HistoryItem = ({ item, onRemove, onAddToFavorites, showFavoriteButton = true }) => (
  <div className="flex items-center justify-between p-3 bg-background/40 border border-border hover:border-border transition-colors">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <FileText className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.fileName}
          </p>
          <div className="flex items-center space-x-2 text-xs text-foreground">
            <span className="capitalize">{item.tool}</span>
            <span>•</span>
            <span>{formatFileSize(item.fileSize)}</span>
            <span>•</span>
            <span>{formatDate(item.timestamp)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {showFavoriteButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddToFavorites(item)}
            className="text-foreground hover:text-yellow-400"
          >
            <Heart className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-foreground hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
  <Card className={`bg-background border-border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">File History</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportHistory}
              className="text-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportHistory}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-foreground"
                as="span"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-background/10">
            <div className="text-lg font-semibold text-foreground">
              {stats.totalFiles}
            </div>
            <div className="text-xs text-foreground">Total Files</div>
          </div>
          <div className="text-center p-3 bg-background/10">
            <div className="text-lg font-semibold text-yellow-400">
              {stats.favoritesCount}
            </div>
            <div className="text-xs text-foreground">Favorites</div>
          </div>
          <div className="text-center p-3 bg-background/10">
            <div className="text-lg font-semibold text-green-400">
              {Object.keys(stats.toolUsage).length}
            </div>
            <div className="text-xs text-foreground">Tools Used</div>
          </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <div className="flex gap-2 mb-4">
            <Button variant={currentTab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setCurrentTab('history')}>
              <History className="w-4 h-4 mr-2" />
              History ({history.length})
            </Button>
            <Button variant={currentTab === 'favorites' ? 'default' : 'outline'} size="sm" onClick={() => setCurrentTab('favorites')}>
              <Star className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </Button>
          </div>

          <TabsContent value="history" className={`space-y-4 ${currentTab !== 'history' ? 'hidden' : ''}`}>
            {/* Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-background border border-border px-2 py-1 text-sm text-foreground"
                >
                  <option value="all">All Tools</option>
                  {uniqueTools.map(tool => (
                    <option key={tool} value={tool} className="capitalize">
                      {tool}
                    </option>
                  ))}
                </select>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-foreground hover:text-red-400"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No files in history</p>
                  <p className="text-xs">Process some files to see them here</p>
                </div>
              ) : (
                filteredHistory.map(item => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromHistory}
                    onAddToFavorites={handleAddToFavorites}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className={`space-y-4 ${currentTab !== 'favorites' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground">
                {favorites.length}/{20} favorites
              </div>
              {favorites.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFavorites}
                  className="text-foreground hover:text-red-400"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-foreground">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No favorite files</p>
                  <p className="text-xs">Add files to favorites from history</p>
                </div>
              ) : (
                favorites.map(item => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromFavorites}
                    onAddToFavorites={() => {}}
                    showFavoriteButton={false}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default FileHistoryPanel;