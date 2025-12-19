import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useCustomOptions,
  useAddCustomOption,
  useUpdateCustomOption,
  useDeleteCustomOption,
  PresetOption,
} from '@/hooks/useCustomOptions';
import { toast } from '@/hooks/use-toast';

interface CustomOptionsManagerProps {
  title: string;
  category: string;
  ownerType: 'organization' | 'florist';
  ownerId: string;
  presetOptions: PresetOption[];
}

export function CustomOptionsManager({
  title,
  category,
  ownerType,
  ownerId,
  presetOptions,
}: CustomOptionsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const { data: customOptions, isLoading } = useCustomOptions(category, ownerType, ownerId);
  const addOption = useAddCustomOption();
  const updateOption = useUpdateCustomOption();
  const deleteOption = useDeleteCustomOption();

  const handleAdd = async () => {
    if (!newLabel.trim()) return;

    const value = newLabel.toLowerCase().replace(/\s+/g, '_');

    // Check for duplicates
    const allValues = [
      ...presetOptions.map((o) => o.value),
      ...(customOptions || []).map((o) => o.option_value),
    ];
    if (allValues.includes(value)) {
      toast({
        title: 'Duplicate option',
        description: 'This option already exists.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addOption.mutateAsync({
        owner_type: ownerType,
        owner_id: ownerId,
        option_category: category,
        option_value: value,
        option_label: newLabel.trim(),
        display_order: (customOptions?.length || 0) + 1,
      });
      setNewLabel('');
      setIsAdding(false);
      toast({ title: 'Option added', description: `"${newLabel}" has been added.` });
    } catch (error) {
      toast({
        title: 'Error adding option',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editLabel.trim()) return;

    try {
      await updateOption.mutateAsync({
        id,
        updates: {
          option_label: editLabel.trim(),
          option_value: editLabel.toLowerCase().replace(/\s+/g, '_'),
        },
      });
      setEditingId(null);
      setEditLabel('');
      toast({ title: 'Option updated' });
    } catch (error) {
      toast({
        title: 'Error updating option',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, label: string) => {
    try {
      await deleteOption.mutateAsync(id);
      toast({ title: 'Option deleted', description: `"${label}" has been removed.` });
    } catch (error) {
      toast({
        title: 'Error deleting option',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditLabel(label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Preset options (read-only) */}
        {presetOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/50"
          >
            <span className="text-sm">{option.label}</span>
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          </div>
        ))}

        {/* Custom options (editable) */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-2">Loading...</div>
        ) : (
          customOptions?.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between py-1.5 px-3 rounded-md bg-background border"
            >
              {editingId === option.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(option.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdate(option.id)}
                    disabled={updateOption.isPending}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={cancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm">{option.option_label}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(option.id, option.option_label)}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(option.id, option.option_label)}
                      disabled={deleteOption.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* Add new option form */}
        {isAdding && (
          <div className="flex items-center gap-2 py-1.5 px-3 rounded-md border border-dashed">
            <Input
              placeholder="New option name..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="h-7 text-sm flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewLabel('');
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleAdd}
              disabled={addOption.isPending || !newLabel.trim()}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setIsAdding(false);
                setNewLabel('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
