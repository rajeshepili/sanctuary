import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { categoriesQueryOptions } from '../categories.options'
import { useCategoryMutations } from '../categories.mutations'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export function CategoryManager() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations()
  const [newCatName, setNewCatName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    createCategory.mutate({ name: newCatName.trim() })
    setNewCatName('')
  }

  const handleStartEdit = (id: number, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveEdit = (id: number) => {
    if (!editingName.trim()) {
      setEditingId(null)
      return
    }
    updateCategory.mutate({ id, name: editingName.trim() })
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category? Habits using it will become uncategorized.')) {
      deleteCategory.mutate(id)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          placeholder="New category name..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 bg-background/60"
        />
        <Button type="submit" size="sm" disabled={!newCatName.trim() || createCategory.isPending}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No categories created yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-background/40 border border-border/50">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(cat.id)
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(cat.id)} className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-sm">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleStartEdit(cat.id, cat.name)} className="h-7 w-7">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)} className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
