import { Pencil, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useChatStore from '@/stores/useChatStore'
import type { Prompt } from '@/types/settings.types'

type PromptDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: Prompt
  onSave: (title: string, content: string) => void
}

function PromptDialog({ open, onOpenChange, prompt, onSave }: PromptDialogProps) {
  const [title, setTitle] = useState(prompt?.title || '')
  const [content, setContent] = useState(prompt?.content || '')

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim())
      setTitle('')
      setContent('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'Add New Prompt'}</DialogTitle>
          <DialogDescription>
            {prompt ? 'Update your prompt template' : 'Create a new prompt template'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Summarize page"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Prompt</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter your prompt template..."
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
            {prompt ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PromptLibrary() {
  const prompts = useChatStore(state => state.settings.data?.prompts || [])
  const addPrompt = useChatStore(state => state.addPrompt)
  const updatePrompt = useChatStore(state => state.updatePrompt)
  const deletePrompt = useChatStore(state => state.deletePrompt)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>()

  const handleAddPrompt = () => {
    setEditingPrompt(undefined)
    setDialogOpen(true)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  const handleSave = (title: string, content: string) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, title, content)
    } else {
      addPrompt(title, content)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt Library</CardTitle>
            <CardDescription>Create and manage reusable prompt templates</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddPrompt} size="sm">
                <Plus className="size-4 mr-2" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <PromptDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              prompt={editingPrompt}
              onSave={handleSave}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No prompts yet. Click "Add Prompt" to create your first template.
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{prompt.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {prompt.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPrompt(prompt)}
                    className="size-8"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePrompt(prompt.id)}
                    className="size-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
