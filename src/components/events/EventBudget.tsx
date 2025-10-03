// src/components/events/EventBudget.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus,
  Edit,
  Save,
  Loader2,
  Trash2,
  Copy,
  AlertTriangle,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventBudgetProps {
  eventId: string;
}

interface Budget {
  id: string;
  event_id: string;
  organization_id: string;
  version: number;
  total_budget: number;
  total_estimated_cost: number;
  total_actual_cost: number;
  profit_margin_target: number;
  status: string;
  created_at: string;
  updated_at: string;
  budget_items?: BudgetItem[];
}

interface BudgetItem {
  id?: string;
  budget_id: string;
  organization_id: string;
  category: string;
  item_name: string;
  description: string;
  quantity: number;
  estimated_unit_cost: number;
  actual_unit_cost: number;
  estimated_total: number;
  actual_total: number;
  markup_percentage: number;
  client_price: number;
  vendor?: string;
  notes?: string;
  cost_price?: number;
  catalog_item_id?: string;
  catalog_item_type?: string;
}

interface CatalogItem {
  id: string;
  name: string;
  variety?: string;
  color?: string;
  base_price: number;
  unit?: string;
  category?: string;
  type: 'flower' | 'hardgood' | 'labor';
}

const CATEGORY_OPTIONS = [
  { value: 'flowers', label: 'Flowers', color: 'bg-pink-100 text-pink-800' },
  { value: 'labor', label: 'Labor', color: 'bg-blue-100 text-blue-800' },
  { value: 'rentals', label: 'Rentals', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivery', label: 'Delivery', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'setup', label: 'Setup', color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const EventBudget = ({ eventId }: EventBudgetProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  
  // Catalog data
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  
  // Price checking state
  const [priceWarning, setPriceWarning] = useState<{
    show: boolean;
    catalogPrice: number;
    enteredPrice: number;
    catalogItemId: string;
    catalogItemType: string;
  } | null>(null);

  const [editingItem, setEditingItem] = useState<Partial<BudgetItem>>({
    category: 'flowers',
    item_name: '',
    description: '',
    quantity: 1,
    estimated_unit_cost: 0,
    markup_percentage: 0,
    vendor: '',
    notes: '',
    cost_price: 0
  });

  useEffect(() => {
    fetchBudgetData();
    fetchCatalogData();
  }, [eventId]);

  const fetchCatalogData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Fetch all catalog items
      const [flowersRes, hardGoodsRes, laborRes] = await Promise.all([
        supabase
          .from('flower_catalog')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true),
        supabase
          .from('hard_goods_catalog')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true),
        supabase
          .from('labor_rates_catalog')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
      ]);

      const allItems: CatalogItem[] = [
        ...(flowersRes.data || []).map(f => ({
          id: f.id,
          name: `${f.name}${f.variety ? ' - ' + f.variety : ''}${f.color ? ' - ' + f.color : ''}`,
          variety: f.variety,
          color: f.color,
          base_price: f.base_price,
          unit: f.unit,
          type: 'flower' as const
        })),
        ...(hardGoodsRes.data || []).map(h => ({
          id: h.id,
          name: h.name,
          base_price: h.purchase_price || h.rental_price,
          unit: h.unit,
          category: h.category,
          type: 'hardgood' as const
        })),
        ...(laborRes.data || []).map(l => ({
          id: l.id,
          name: l.name,
          base_price: l.hourly_rate,
          unit: 'hour',
          category: l.category,
          type: 'labor' as const
        }))
      ];

      setCatalogItems(allItems);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    }
  };

  const fetchBudgetData = async () => {
    try {
      setLoading(true);

      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_items (*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (budgetsError && budgetsError.code !== 'PGRST116') {
        console.error('Error fetching budgets:', budgetsError);
        return;
      }

      setBudgets(budgetsData || []);
      
      if (budgetsData && budgetsData.length > 0) {
        setSelectedBudget(budgetsData[0]);
      }

    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const nextVersion = budgets.length + 1;

      let itemsToCopy: BudgetItem[] = [];
      
      if (selectedBudget?.budget_items) {
        itemsToCopy = selectedBudget.budget_items.map((item: BudgetItem) => ({
          budget_id: item.budget_id,
          organization_id: item.organization_id,
          category: item.category || 'flowers',
          item_name: item.item_name || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          estimated_unit_cost: item.estimated_unit_cost || 0,
          actual_unit_cost: item.actual_unit_cost || 0,
          estimated_total: (item.quantity || 1) * (item.estimated_unit_cost || 0),
          actual_total: (item.quantity || 1) * (item.actual_unit_cost || 0),
          markup_percentage: item.markup_percentage || 0,
          client_price: (item.quantity || 1) * (item.estimated_unit_cost || 0) * (1 + (item.markup_percentage || 0) / 100),
          vendor: item.vendor || '',
          notes: item.notes || '',
          cost_price: item.cost_price || 0,
          catalog_item_id: item.catalog_item_id,
          catalog_item_type: item.catalog_item_type
        }));
      }

      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          event_id: eventId,
          organization_id: profile.organization_id,
          version: nextVersion,
          total_budget: 0,
          total_estimated_cost: 0,
          total_actual_cost: 0,
          profit_margin_target: 20,
          status: 'draft',
        })
        .select()
        .single();

      if (budgetError) throw budgetError;

      if (itemsToCopy.length > 0 && newBudget) {
        const itemsToInsert = itemsToCopy.map(item => ({
          budget_id: newBudget.id,
          organization_id: profile.organization_id,
          ...item
        }));
        
        const { error: itemsError } = await supabase
          .from('budget_items')
          .insert(itemsToInsert);

        if (itemsError) console.error('Error copying items:', itemsError);
      }

      await fetchBudgetData();
      setIsCreatingBudget(false);
      
      toast({
        title: 'Success',
        description: `Budget version ${nextVersion} created`
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new budget',
        variant: 'destructive'
      });
    }
  };

  const handleCatalogItemSelect = (catalogId: string) => {
    const item = catalogItems.find(c => c.id === catalogId);
    if (!item) return;

    setSelectedCatalogItem(item);
    setEditingItem({
      ...editingItem,
      item_name: item.name,
      estimated_unit_cost: item.base_price,
      cost_price: item.base_price,
      catalog_item_id: item.id,
      catalog_item_type: item.type
    });
  };

  const handlePriceChange = (newPrice: number) => {
    setEditingItem({
      ...editingItem,
      estimated_unit_cost: newPrice
    });

    // Check if price differs from catalog
    if (editingItem.catalog_item_id && selectedCatalogItem) {
      const catalogPrice = selectedCatalogItem.base_price;
      if (Math.abs(newPrice - catalogPrice) > 0.01) {
        setPriceWarning({
          show: true,
          catalogPrice,
          enteredPrice: newPrice,
          catalogItemId: editingItem.catalog_item_id,
          catalogItemType: editingItem.catalog_item_type || 'flower'
        });
      } else {
        setPriceWarning(null);
      }
    }
  };

  const updateCatalogPrice = async () => {
    if (!priceWarning) return;

    try {
      const table = priceWarning.catalogItemType === 'flower' 
        ? 'flower_catalog' 
        : priceWarning.catalogItemType === 'hardgood'
        ? 'hard_goods_catalog'
        : 'labor_rates_catalog';

      const priceField = priceWarning.catalogItemType === 'labor'
        ? 'hourly_rate'
        : 'base_price';

      const { error } = await supabase
        .from(table)
        .update({ 
          [priceField]: priceWarning.enteredPrice,
          last_price_update: new Date().toISOString()
        })
        .eq('id', priceWarning.catalogItemId);

      if (error) throw error;

      toast({
        title: 'Catalog Updated',
        description: `Price updated to $${priceWarning.enteredPrice.toFixed(2)}`
      });

      setPriceWarning(null);
      await fetchCatalogData();
    } catch (error) {
      console.error('Error updating catalog:', error);
      toast({
        title: 'Error',
        description: 'Failed to update catalog price',
        variant: 'destructive'
      });
    }
  };

  const addBudgetItem = async () => {
    if (!selectedBudget || !editingItem.item_name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const estimatedTotal = (editingItem.quantity || 1) * (editingItem.estimated_unit_cost || 0);
      const clientPrice = estimatedTotal * (1 + (editingItem.markup_percentage || 0) / 100);

      const { error } = await supabase
        .from('budget_items')
        .insert({
          budget_id: selectedBudget.id,
          organization_id: profile.organization_id,
          category: editingItem.category || 'flowers',
          item_name: editingItem.item_name,
          description: editingItem.description || '',
          quantity: editingItem.quantity || 1,
          estimated_unit_cost: editingItem.estimated_unit_cost || 0,
          actual_unit_cost: editingItem.actual_unit_cost || editingItem.estimated_unit_cost || 0,
          estimated_total: estimatedTotal,
          actual_total: estimatedTotal,
          markup_percentage: editingItem.markup_percentage || 0,
          client_price: clientPrice,
          vendor: editingItem.vendor || '',
          notes: editingItem.notes || '',
          cost_price: editingItem.cost_price || editingItem.estimated_unit_cost || 0,
          catalog_item_id: editingItem.catalog_item_id,
          catalog_item_type: editingItem.catalog_item_type
        });

      if (error) throw error;

      await fetchBudgetData();
      setIsEditingItem(false);
      setSelectedCatalogItem(null);
      setPriceWarning(null);
      setEditingItem({
        category: 'flowers',
        item_name: '',
        description: '',
        quantity: 1,
        estimated_unit_cost: 0,
        markup_percentage: 0,
        vendor: '',
        notes: '',
        cost_price: 0
      });

      toast({
        title: 'Success',
        description: 'Budget item added'
      });
    } catch (error) {
      console.error('Error adding budget item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add budget item',
        variant: 'destructive'
      });
    }
  };

  const deleteBudgetItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchBudgetData();
      
      toast({
        title: 'Success',
        description: 'Budget item removed'
      });
    } catch (error) {
      console.error('Error deleting budget item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove budget item',
        variant: 'destructive'
      });
    }
  };

  const calculateTotalsByCategory = () => {
    if (!selectedBudget?.budget_items) return {};
    
    return selectedBudget.budget_items.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.client_price || 0;
      return acc;
    }, {} as Record<string, number>);
  };

  const calculateTotal = () => {
    if (!selectedBudget?.budget_items) return 0;
    
    return selectedBudget.budget_items.reduce((sum, item) => {
      return sum + (item.client_price || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Budget History & Versions
            </span>
            <Button
              size="sm"
              onClick={() => setIsCreatingBudget(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Budget Version
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Track iterative budgets as client requirements change. Each version maintains a complete history.
          </p>
          
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No budgets created yet. Start by creating your first budget.
            </div>
          ) : (
            <div className="space-y-2">
              {budgets.map((budget, index) => (
                <div
                  key={budget.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedBudget?.id === budget.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBudget(budget)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        Version {budget.version || index + 1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(budget.created_at).toLocaleDateString()} - 
                        ${budget.total_budget?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Badge>{budget.status || 'draft'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isCreatingBudget && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Create New Budget Version</p>
              <p className="text-sm text-muted-foreground mb-3">
                This will create version {budgets.length + 1} and copy all items from the current version.
              </p>
              <div className="flex gap-2">
                <Button onClick={createNewBudget}>
                  <Copy className="w-4 h-4 mr-2" />
                  Create Version {budgets.length + 1}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingBudget(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBudget && (
        <>
          {/* Budget Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Budget Items - Version {selectedBudget.version || budgets.indexOf(selectedBudget) + 1}</span>
                <Button
                  size="sm"
                  onClick={() => setIsEditingItem(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedBudget.budget_items?.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            CATEGORY_OPTIONS.find(c => c.value === item.category)?.color || 
                            'bg-gray-100 text-gray-800'
                          }>
                            {CATEGORY_OPTIONS.find(c => c.value === item.category)?.label || 'Other'}
                          </Badge>
                          <p className="font-medium">{item.item_name || 'Unnamed Item'}</p>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qty:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Unit Price:</span> ${item.estimated_unit_cost?.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Markup:</span> {item.markup_percentage}%
                          </div>
                          <div className="font-semibold">
                            Total: ${item.client_price?.toFixed(2)}
                          </div>
                        </div>
                        
                        {item.vendor && (
                          <p className="text-xs text-muted-foreground mt-2">Vendor: {item.vendor}</p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => item.id && deleteBudgetItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!selectedBudget.budget_items || selectedBudget.budget_items.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items yet. Add your first budget item.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Item Dialog */}
          <Dialog open={isEditingItem} onOpenChange={setIsEditingItem}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Budget Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select from Catalog (Optional)</Label>
                  <Select onValueChange={handleCatalogItemSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type custom name OR select from catalog..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - ${item.base_price?.toFixed(2)}/{item.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({
                      ...editingItem,
                      category: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={editingItem.item_name || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item_name: e.target.value
                    })}
                    placeholder="e.g., White Roses or Custom Item Name"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      description: e.target.value
                    })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={editingItem.quantity || 1}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingItem.estimated_unit_cost || 0}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Markup %</Label>
                    <Input
                      type="number"
                      value={editingItem.markup_percentage || 0}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        markup_percentage: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                {/* Price Warning Badge */}
                {priceWarning?.show && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        Price differs from catalog (${priceWarning.catalogPrice.toFixed(2)})
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Update catalog to ${priceWarning.enteredPrice.toFixed(2)}?
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 hover:bg-amber-100"
                      onClick={updateCatalogPrice}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save to Catalog
                    </Button>
                  </div>
                )}

                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={editingItem.vendor || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      vendor: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      notes: e.target.value
                    })}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditingItem(false);
                  setSelectedCatalogItem(null);
                  setPriceWarning(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={addBudgetItem}>
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(calculateTotalsByCategory()).map(([category, total]) => {
                    const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === category);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={categoryInfo?.color || 'bg-gray-100 text-gray-800'}>
                            {categoryInfo?.label || 'Other'}
                          </Badge>
                        </div>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Total Budget</p>
                      <p className="text-xl font-bold">
                        ${calculateTotal().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-semibold">
                      {selectedBudget.budget_items?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Markup</span>
                    <span className="font-semibold">
                      {selectedBudget.budget_items && selectedBudget.budget_items.length > 0
                        ? (selectedBudget.budget_items.reduce((sum, item) => 
                            sum + (item.markup_percentage || 0), 0) / 
                            selectedBudget.budget_items.length).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Status</span>
                      <Badge>{selectedBudget.status || 'draft'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default EventBudget;