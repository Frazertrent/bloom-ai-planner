import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Flower, 
  DollarSign, 
  Package, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Plus,
  X,
  Loader2,
  ImageIcon,
  Calendar,
  Sparkles
} from 'lucide-react';

// Mock data for demonstration
const MOCK_RECIPES = [
  {
    id: '1',
    name: 'Classic Bridal Bouquet',
    category: 'bridal_bouquet',
    estimated_cost: 85,
    typical_client_price: 250,
    estimated_labor_hours: 1.5,
    ingredients: [
      { flower_name: 'Garden Roses', quantity: 12, catalog_price: 3.5 },
      { flower_name: 'Ranunculus', quantity: 8, catalog_price: 2.25 },
      { flower_name: 'Italian Ruscus', quantity: 6, catalog_price: 1.5 }
    ]
  },
  {
    id: '2',
    name: 'Romantic Centerpiece',
    category: 'centerpiece',
    estimated_cost: 65,
    typical_client_price: 180,
    estimated_labor_hours: 0.75,
    ingredients: [
      { flower_name: 'Peonies', quantity: 5, catalog_price: 4.5 },
      { flower_name: 'Spray Roses', quantity: 10, catalog_price: 1.75 },
      { flower_name: 'Eucalyptus', quantity: 8, catalog_price: 1.25 }
    ]
  }
];

const MOCK_CATALOG = [
  {
    id: '1',
    name: 'Garden Roses',
    variety: 'Cafe au Lait',
    color: 'Blush',
    catalog_price: 3.50,
    seasonal_availability: { june: true, july: true, august: true, september: true },
    processing_waste_factor: 0.15,
    preferred_vendor: 'California Flower Market',
    stock_status: 'in_season'
  },
  {
    id: '2',
    name: 'Peonies',
    variety: 'Sarah Bernhardt',
    color: 'Pink',
    catalog_price: 4.50,
    seasonal_availability: { may: true, june: true },
    processing_waste_factor: 0.10,
    preferred_vendor: 'Holland Imports',
    stock_status: 'limited'
  },
  {
    id: '3',
    name: 'Dahlias',
    variety: 'Cafe au Lait',
    color: 'Cream',
    catalog_price: 3.25,
    seasonal_availability: { august: true, september: true, october: true },
    processing_waste_factor: 0.12,
    preferred_vendor: 'Local Farm',
    stock_status: 'out_of_season'
  }
];

const PIECE_TYPES = [
  { key: 'bridal_bouquet', label: 'Bridal Bouquet', quantity: 1 },
  { key: 'bridesmaid_bouquets', label: 'Bridesmaid Bouquets', quantity: 4 },
  { key: 'centerpieces', label: 'Centerpieces', quantity: 12 },
  { key: 'ceremony_arrangements', label: 'Ceremony Arrangements', quantity: 2 }
];

interface Recipe {
  id: string;
  name: string;
  category: string;
  estimated_labor_hours: number;
  estimated_cost: number;
  typical_client_price: number;
  ingredients: Array<{
    flower_name: string;
    quantity: number;
    catalog_price: number;
  }>;
}

interface SelectedRecipe {
  recipe: Recipe;
  customized: boolean;
}

const EnhancedDesignTab = () => {
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, SelectedRecipe>>({});
  const [customFlowers, setCustomFlowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mockups, setMockups] = useState([]);
  const [substitutionPlans, setSubstitutionPlans] = useState({});
  const [eventDate] = useState(new Date('2025-07-15')); // Mock event date

  const getSeasonalStatus = (flower) => {
    const eventMonth = eventDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    if (flower.seasonal_availability[eventMonth]) {
      return { status: 'in_season', icon: CheckCircle, color: 'text-green-600', message: `✓ In season for your ${eventMonth} event` };
    }
    const availableMonths = Object.keys(flower.seasonal_availability).filter(m => flower.seasonal_availability[m]);
    if (availableMonths.length > 0) {
      return { status: 'limited', icon: AlertTriangle, color: 'text-orange-600', message: `⚠️ Limited availability (${availableMonths.join(', ')})` };
    }
    return { status: 'out_of_season', icon: XCircle, color: 'text-red-600', message: '❌ Out of season, expect +50% cost' };
  };

  const calculateRecipeCost = (recipe, quantity = 1) => {
    const materialCost = recipe.ingredients.reduce((sum, ing) => 
      sum + (ing.quantity * ing.catalog_price), 0
    );
    const totalCost = materialCost * quantity;
    const clientPrice = recipe.typical_client_price * quantity;
    const markup = ((clientPrice - totalCost) / totalCost * 100).toFixed(0);
    
    return {
      materialCost: totalCost,
      laborCost: recipe.estimated_labor_hours * 45 * quantity,
      totalCost: totalCost + (recipe.estimated_labor_hours * 45 * quantity),
      clientPrice,
      markup
    };
  };

  const handleRecipeSelect = (pieceType, recipeId) => {
    const recipe = MOCK_RECIPES.find(r => r.id === recipeId);
    setSelectedRecipes(prev => ({
      ...prev,
      [pieceType]: { recipe, customized: false }
    }));
  };

  const addCustomFlower = (flower, quantity, useWasteFactor) => {
    setCustomFlowers(prev => [...prev, {
      ...flower,
      quantity,
      useWasteFactor,
      adjustedQuantity: useWasteFactor ? Math.ceil(quantity * (1 + flower.processing_waste_factor)) : quantity
    }]);
  };

  const uploadMockup = (file) => {
    setMockups(prev => [...prev, {
      id: Date.now().toString(),
      name: file.name,
      status: 'pending',
      feedback: '',
      uploadedAt: new Date()
    }]);
  };

  const updateMockupStatus = (mockupId, status, feedback = '') => {
    setMockups(prev => prev.map(m => 
      m.id === mockupId ? { ...m, status, feedback, updatedAt: new Date() } : m
    ));
  };

  const filteredCatalog = MOCK_CATALOG.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.variety.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="flowers">Flowers</TabsTrigger>
          <TabsTrigger value="mockups">Mockups</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Recipe Application Tab */}
        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Recipe Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {PIECE_TYPES.map(piece => {
                const selected = selectedRecipes[piece.key];
                const cost = selected ? calculateRecipeCost(selected.recipe, piece.quantity) : null;

                return (
                  <div key={piece.key} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{piece.label}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {piece.quantity}</p>
                      </div>
                      <Select onValueChange={(value) => handleRecipeSelect(piece.key, value)}>
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Select recipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_RECIPES.filter(r => r.category === piece.key || r.category === 'centerpiece').map(recipe => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              {recipe.name} (${recipe.typical_client_price})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selected && (
                      <div className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-blue-50 rounded">
                            <p className="text-muted-foreground">Materials</p>
                            <p className="text-lg font-bold">${cost.materialCost.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded">
                            <p className="text-muted-foreground">Labor ({selected.recipe.estimated_labor_hours * piece.quantity}h)</p>
                            <p className="text-lg font-bold">${cost.laborCost.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded">
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="text-lg font-bold">${cost.totalCost.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded">
                            <p className="text-muted-foreground">Client Price ({cost.markup}% markup)</p>
                            <p className="text-lg font-bold text-green-700">${cost.clientPrice.toFixed(2)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Ingredients:</p>
                          <div className="space-y-1">
                            {selected.recipe.ingredients.map((ing, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                <span>{ing.flower_name}</span>
                                <span className="text-muted-foreground">
                                  {ing.quantity * piece.quantity} stems × ${ing.catalog_price} = ${(ing.quantity * piece.quantity * ing.catalog_price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Package className="w-4 h-4 mr-2" />
                            Customize Recipe
                          </Button>
                          <Button size="sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Apply to Budget
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Flower Selection Tab */}
        <TabsContent value="flowers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower className="w-5 h-5" />
                Smart Flower Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search flowers by name or variety..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCatalog.map(flower => {
                  const seasonalInfo = getSeasonalStatus(flower);
                  const StatusIcon = seasonalInfo.icon;

                  return (
                    <Card key={flower.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{flower.name}</h4>
                            <p className="text-sm text-muted-foreground">{flower.variety} • {flower.color}</p>
                          </div>
                          <Badge variant={
                            seasonalInfo.status === 'in_season' ? 'default' :
                            seasonalInfo.status === 'limited' ? 'secondary' : 'destructive'
                          }>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {seasonalInfo.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className={`text-sm ${seasonalInfo.color}`}>
                          {seasonalInfo.message}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Catalog Price</p>
                            <p className="font-bold">${flower.catalog_price}/stem</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Waste Factor</p>
                            <p className="font-bold">{(flower.processing_waste_factor * 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-muted-foreground">Preferred Vendor</p>
                          <p className="font-medium">{flower.preferred_vendor}</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-20"
                            id={`qty-${flower.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const qtyInput = document.getElementById(`qty-${flower.id}`) as HTMLInputElement;
                              const qty = qtyInput?.value;
                              if (qty) addCustomFlower(flower, parseInt(qty), true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add (+15% waste)
                          </Button>
                        </div>

                        <Button size="sm" variant="ghost" className="w-full">
                          Plan Substitutes
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {customFlowers.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Added Flowers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customFlowers.map((flower, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{flower.name} - {flower.variety}</p>
                            <p className="text-sm text-muted-foreground">
                              {flower.quantity} stems 
                              {flower.useWasteFactor && ` + ${Math.ceil(flower.quantity * flower.processing_waste_factor)} waste = ${flower.adjustedQuantity} total`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${(flower.adjustedQuantity * flower.catalog_price).toFixed(2)}</p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setCustomFlowers(prev => prev.filter((_, i) => i !== idx))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Mockups Tab */}
        <TabsContent value="mockups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Design Mockups & Client Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload mockup images (bouquet, centerpiece, arch, etc.)
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => uploadMockup(file));
                  }}
                  className="max-w-xs mx-auto"
                />
              </div>

              {mockups.length > 0 && (
                <div className="space-y-4 mt-6">
                  {mockups.map(mockup => (
                    <Card key={mockup.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{mockup.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {mockup.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            mockup.status === 'approved' ? 'default' :
                            mockup.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {mockup.status === 'approved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                             mockup.status === 'rejected' ? <XCircle className="w-3 h-3 mr-1" /> :
                             <Clock className="w-3 h-3 mr-1" />}
                            {mockup.status}
                          </Badge>
                        </div>

                        {mockup.feedback && (
                          <Alert className="mb-3">
                            <AlertDescription>{mockup.feedback}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMockupStatus(mockup.id, 'approved', 'Approved by client')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMockupStatus(mockup.id, 'rejected', 'Client requested changes')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button className="w-full" disabled={mockups.length === 0 || mockups.every(m => m.status !== 'approved')}>
                Request Client Approval (Email)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Flower Count</p>
                  <p className="text-2xl font-bold">
                    {Object.values(selectedRecipes).reduce((sum, sr) => 
                      sum + (sr.recipe?.ingredients.reduce((s, i) => s + i.quantity, 0) || 0), 0
                    ) + customFlowers.reduce((sum, f) => sum + f.adjustedQuantity, 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Material Cost</p>
                  <p className="text-2xl font-bold">
                    ${(
                      Object.entries(selectedRecipes).reduce((sum, [key, sr]) => {
                        const piece = PIECE_TYPES.find(p => p.key === key);
                        const cost = calculateRecipeCost(sr.recipe, piece?.quantity || 1);
                        return sum + cost.materialCost;
                      }, 0) +
                      customFlowers.reduce((sum, f) => sum + (f.adjustedQuantity * f.catalog_price), 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Labor Hours</p>
                  <p className="text-2xl font-bold">
                    {Object.entries(selectedRecipes).reduce((sum, [key, sr]) => {
                      const piece = PIECE_TYPES.find(p => p.key === key);
                      return sum + (sr.recipe?.estimated_labor_hours * (piece?.quantity || 1) || 0);
                    }, 0).toFixed(1)}h
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Client Price</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${Object.entries(selectedRecipes).reduce((sum, [key, sr]) => {
                      const piece = PIECE_TYPES.find(p => p.key === key);
                      const cost = calculateRecipeCost(sr.recipe, piece?.quantity || 1);
                      return sum + cost.clientPrice;
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Approval Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Design Mockups</span>
                    <Badge variant={mockups.some(m => m.status === 'approved') ? 'default' : 'secondary'}>
                      {mockups.filter(m => m.status === 'approved').length} / {mockups.length} Approved
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Recipe Selection</span>
                    <Badge variant={Object.keys(selectedRecipes).length > 0 ? 'default' : 'secondary'}>
                      {Object.keys(selectedRecipes).length} / {PIECE_TYPES.length} Selected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDesignTab;