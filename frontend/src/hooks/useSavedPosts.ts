import { useState } from 'react';

export function useSavedPosts() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('savedPosts') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSave = (postId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem('savedPosts', JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (postId: string) => savedIds.includes(postId);

  return { savedIds, toggleSave, isSaved };
}
