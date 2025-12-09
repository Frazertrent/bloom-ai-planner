import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  Clock,
  Flower,
  Package,
  Save,
  X,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// Props interface
interface RecipeSelectorProps {
  eventId?: string;
  pieceType?: string;
  quantity?: number;
  onRecipeSelect?: (recipe: Recipe, customizations?: Record<string, number>) => void;
  onApplyToBudget?: (recipe: Recipe, quantity: number, cost: CostBreakdown) => void;
}

// Type definitions
interface Recipe {
  id: string;
  organization_id?: string;
  name: string;
  category: string;
  estimated_labor_hours: number;
  estimated_cost: number;
  typical_client_price: number;
  description?: string;
  created_at?: string;
  ingredients: RecipeIngredient[];
}

interface RecipeIngredient {
  id?: string;
  recipe_id?: string;
  catalog_item_id: string;
  catalog_item_type: 'flower'; // Only flowers for now - no hardgood_catalog table
  quantity: number;
  notes?: string;
  // Joined data from flower_catalog
  item_name?: string;
  item_variety?: string;
  item_color?: string;
  unit_price?: number;
}

interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  clientPrice: number;
  markup: number;
  profit: number;
}

const RECIPE_CATEGORIES = [
  { value: 'bridal_bouquet', label: 'Bridal Bouquet' },
  { value: 'bridesmaid_bouquet', label: 'Bridesmaid Bouquet' },
  { value: 'centerpiece', label: 'Centerpiece' },
  { value: 'ceremony_arrangement', label: 'Ceremony Arrangement' },
  { value: 'arch', label: 'Arch/Installation' },
  { value: 'boutonniere', label: 'Boutonniere' },
  { value: 'corsage', label: 'Corsage' },
  { value: 'other', label: 'Other' }
];

const LABOR_RATE = 45; // $45/hour default

const RecipeSelector = ({ 
  eventId, 
  pieceType, 
  quantity = 1,
  onRecipeSelect,
  onApplyToBudget 
}: RecipeSelectorProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});
  const [isCustomized, setIsCustomized] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>(pieceType || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  // New recipe form state
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    category: pieceType || 'bridal_bouquet',
    estimated_labor_hours: 1,
    estimated_cost: 0,
    typical_client_price: 0,
    description: '',
    ingredients: []
  });

  // Mock data - replace with Supabase query
  useEffect(() => {
    fetchRecipes();
  }, [filterCategory]);

  const fetchRecipes = async () => {
    // Mock data - will be replaced with design_recipes Supabase query
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Classic Rose Bridal Bouquet',
        category: 'bridal_bouquet',
        estimated_labor_hours: 1.5,
        estimated_cost: 85,
        typical_client_price: 250,
        description: 'Traditional hand-tied bridal bouquet with garden roses and greenery',
        ingredients: [
          { 
            catalog_item_id: '1', 
            catalog_item_type: 'flower', 
            quantity: 12,
            item_name: 'Garden Rose',
            item_variety: 'Cafe au Lait',
            item_color: 'Blush',
            unit_price: 3.50
          },
          { 
            catalog_item_id: '2', 
            catalog_item_type: 'flower', 
            quantity: 8,
            item_name: 'Ranunculus',
            item_variety: 'Italian',
            item_color: 'White',
            unit_price: 2.25
          },
          { 
            catalog_item_id: '3', 
            catalog_item_type: 'flower', 
            quantity: 6,
            item_name: 'Italian Ruscus',
            item_variety: 'Standard',
            item_color: 'Green',
            unit_price: 1.50
          },
          // NOTE: No hardgood_catalog table exists yet - only flowers supported
        ]
      },
      {
        id: '2',
        name: 'Romantic Garden Centerpiece',
        category: 'centerpiece',
        estimated_labor_hours: 0.75,
        estimated_cost: 65,
        typical_client_price: 180,
        description: 'Low and lush centerpiece with seasonal blooms',
        ingredients: [
          { 
            catalog_item_id: '5', 
            catalog_item_type: 'flower', 
            quantity: 5,
            item_name: 'Peony',
            item_variety: 'Sarah Bernhardt',
            item_color: 'Pink',
            unit_price: 4.50
          },
          { 
            catalog_item_id: '6', 
            catalog_item_type: 'flower', 
            quantity: 10,
            item_name: 'Spray Rose',
            item_variety: 'Majolica',
            item_color: 'White',
            unit_price: 1.75
          },
          { 
            catalog_item_id: '7', 
            catalog_item_type: 'flower', 
            quantity: 8,
            item_name: 'Eucalyptus',
            item_variety: 'Silver Dollar',
            item_color: 'Green',
            unit_price: 1.25
          },
        {
          catalog_item_id: '7', 
          catalog_item_type: 'flower', 
          quantity: 8,
          item_name: 'Eucalyptus',
          item_variety: 'Silver Dollar',
          item_color: 'Green',
          unit_price: 1.25
        }
        ]
      },
      {
        id: '3',
        name: 'Deluxe Peony & Garden Rose Bouquet',
        category: 'bridal_bouquet',
        estimated_labor_hours: 2,
        estimated_cost: 145,
        typical_client_price: 425,
        description: 'Luxury bridal bouquet featuring premium peonies and garden roses',
        ingredients: [
          { 
            catalog_item_id: '5', 
            catalog_item_type: 'flower', 
            quantity: 8,
            item_name: 'Peony',
            item_variety: 'Sarah Bernhardt',
            item_color: 'Pink',
            unit_price: 4.50
          },
          { 
            catalog_item_id: '1', 
            catalog_item_type: 'flower', 
            quantity: 15,
            item_name: 'Garden Rose',
            item_variety: 'Cafe au Lait',
            item_color: 'Blush',
            unit_price: 3.50
          },
          { 
            catalog_item_id: '3', 
            catalog_item_type: 'flower', 
            quantity: 10,
            item_name: 'Italian Ruscus',
            item_variety: 'Standard',
            item_color: 'Green',
            unit_price: 1.50
          }
        ]
      }
    ];

    // Filter by category
    let filtered = mockRecipes;
    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setRecipes(filtered);
  };

  const calculateCost = (recipe: Recipe, qty: number = quantity): CostBreakdown => {
    // Use custom quantities if available, otherwise use recipe defaults
    const materialCost = recipe.ingredients.reduce((sum, ing) => {
      const adjustedQty = isCustomized && customQuantities[ing.catalog_item_id] 
        ? customQuantities[ing.catalog_item_id] 
        : ing.quantity;
      return sum + (adjustedQty * (ing.unit_price || 0));
    }, 0);

    const laborCost = recipe.estimated_labor_hours * LABOR_RATE;
    const totalCostPerUnit = materialCost + laborCost;
    const totalCost = totalCostPerUnit * qty;
    const clientPrice = recipe.typical_client_price * qty;
    const profit = clientPrice - totalCost;
    const markup = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

    return {
      materialCost: materialCost * qty,
      laborCost: laborCost * qty,
      totalCost,
      clientPrice,
      markup,
      profit
    };
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsCustomized(false);
    setCustomQuantities({});
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
    }
  };

  const handleIngredientQuantityChange = (itemId: string, newQuantity: number) => {
    setCustomQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
    setIsCustomized(true);
  };

  const handleApplyToBudget = () => {
    if (!selectedRecipe) return;
    
    const cost = calculateCost(selectedRecipe, quantity);
    
    if (onApplyToBudget) {
      onApplyToBudget(selectedRecipe, quantity, cost);
    }
  };

  const handleCreateRecipe = () => {
    // Recipe creation placeholder
    setIsCreateDialogOpen(false);
    // Reset form
    setNewRecipe({
      name: '',
      category: pieceType || 'bridal_bouquet',
      estimated_labor_hours: 1,
      estimated_cost: 0,
      typical_client_price: 0,
      description: '',
      ingredients: []
    });
  };

  const handleDuplicateRecipe = (recipe: Recipe) => {
    setNewRecipe({
      ...recipe,
      name: `${recipe.name} (Copy)`,
      id: undefined
    });
    setIsCreateDialogOpen(true);
  };

  const cost = selectedRecipe ? calculateCost(selectedRecipe, quantity) : null;
  const originalCost = selectedRecipe && isCustomized 
    ? calculateCost({ ...selectedRecipe }, quantity) 
    : null;

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {RECIPE_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Recipe</DialogTitle>
              <DialogDescription>
                Build a reusable recipe template for your floral designs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipe Name</Label>
                  <Input
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                    placeholder="e.g., Classic Rose Bouquet"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newRecipe.category} 
                    onValueChange={(val) => setNewRecipe({ ...newRecipe, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  placeholder="Describe this recipe..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Labor Hours</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={newRecipe.estimated_labor_hours}
                    onChange={(e) => setNewRecipe({ ...newRecipe, estimated_labor_hours: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Est. Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecipe.estimated_cost}
                    onChange={(e) => setNewRecipe({ ...newRecipe, estimated_cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Client Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecipe.typical_client_price}
                    onChange={(e) => setNewRecipe({ ...newRecipe, typical_client_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateRecipe}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Recipe
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipe List */}
      <div className="grid grid-cols-1 gap-3">
        {recipes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No recipes found. Create your first recipe to get started.
            </CardContent>
          </Card>
        ) : (
          recipes.map(recipe => {
            const recipeCost = calculateCost(recipe, 1);
            const isSelected = selectedRecipe?.id === recipe.id;

            return (
              <Card 
                key={recipe.id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 border-2 shadow-md' : 'hover:border-gray-300'}`}
                onClick={() => handleRecipeSelect(recipe)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{recipe.name}</h4>
                        <Badge variant="outline">
                          {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                        </Badge>
                      </div>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                      )}
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Materials</p>
                          <p className="font-medium">${recipeCost.materialCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Labor</p>
                          <p className="font-medium">{recipe.estimated_labor_hours}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Cost</p>
                          <p className="font-medium">${recipeCost.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Client Price</p>
                          <p className="font-bold text-green-700">${recipeCost.clientPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateRecipe(recipe);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewRecipe(recipe);
                          setIsEditMode(true);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Selected Recipe Details */}
      {selectedRecipe && cost && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected: {selectedRecipe.name}</span>
              {quantity > 1 && (
                <Badge variant="secondary">Quantity: {quantity}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cost Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Material Cost</p>
                <p className="text-xl font-bold">${cost.materialCost.toFixed(2)}</p>
                {isCustomized && originalCost && (
                  <p className="text-xs text-muted-foreground">
                    Original: ${originalCost.materialCost.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Labor Cost</p>
                <p className="text-xl font-bold">${cost.laborCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRecipe.estimated_labor_hours * quantity}h @ ${LABOR_RATE}/h
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                <p className="text-xl font-bold">${cost.totalCost.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Client Price</p>
                <p className="text-xl font-bold text-green-700">${cost.clientPrice.toFixed(2)}</p>
                <p className="text-xs text-green-600">
                  {cost.markup.toFixed(0)}% markup
                </p>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Ingredients</h4>
                {isCustomized && (
                  <Badge variant="outline" className="bg-orange-50">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Customized
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {selectedRecipe.ingredients.map((ing, idx) => {
                  const currentQty = customQuantities[ing.catalog_item_id] || ing.quantity;
                  const originalQty = ing.quantity;
                  const isModified = currentQty !== originalQty;

                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {ing.item_name}
                          {ing.item_variety && ` - ${ing.item_variety}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Flower className="w-3 h-3 inline mr-1" />
                          ${ing.unit_price?.toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={currentQty}
                            onChange={(e) => handleIngredientQuantityChange(ing.catalog_item_id, parseInt(e.target.value) || 0)}
                            className={`w-20 ${isModified ? 'border-orange-400' : ''}`}
                          />
                          {isModified && (
                            <span className="text-xs text-muted-foreground">
                              (was {originalQty})
                            </span>
                          )}
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold">
                            ${((ing.unit_price || 0) * currentQty * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleApplyToBudget} className="flex-1">
                <DollarSign className="w-4 h-4 mr-2" />
                Apply to Budget
              </Button>
              {isCustomized && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCustomQuantities({});
                    setIsCustomized(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecipeSelector;