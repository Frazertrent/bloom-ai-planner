import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Filter,
  Flower,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';

interface FlowerPickerProps {
  eventDate?: Date;
  colorPalette?: string[];
  mustHaveFlowers?: string[];
  flowersToAvoid?: string[];
  onFlowerSelect?: (flower: FlowerCatalogItem, quantity: number, options: FlowerSelectionOptions) => void;
  onBulkAdd?: (flowers: FlowerSelection[]) => void;
}

interface FlowerCatalogItem {
  id: string;
  name: string;
  variety: string;
  color: string;
  base_price: number;
  seasonal_availability: Record<string, boolean>;
  processing_waste_factor: number;
  processing_notes?: string;
  preferred_vendor?: string;
  stem_length?: string;
  vase_life_days?: number;
  care_notes?: string;
  is_active: boolean;
  // Computed fields
  stock_status?: 'in_season' | 'limited' | 'out_of_season';
  price_surge?: number;
}

interface FlowerSelectionOptions {
  useWasteFactor: boolean;
  useCatalogPrice: boolean;
  customPrice?: number;
  notes?: string;
}

interface FlowerSelection {
  flower: FlowerCatalogItem;
  quantity: number;
  options: FlowerSelectionOptions;
  adjustedQuantity: number;
  totalCost: number;
}

const FlowerPicker = ({
  eventDate = new Date(),
  colorPalette = [],
  mustHaveFlowers = [],
  flowersToAvoid = [],
  onFlowerSelect,
  onBulkAdd
}: FlowerPickerProps) => {
  const [catalog, setCatalog] = useState<FlowerCatalogItem[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<FlowerCatalogItem[]>([]);
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerSelection[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [seasonalFilter, setSeasonalFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'seasonal'>('name');
  const [showOnlyMustHave, setShowOnlyMustHave] = useState(false);
  const [hideToAvoid, setHideToAvoid] = useState(true);

  // Selection state
  const [activeFlower, setActiveFlower] = useState<FlowerCatalogItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [useWasteFactor, setUseWasteFactor] = useState(true);
  const [useCatalogPrice, setUseCatalogPrice] = useState(true);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // Mock catalog data
  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [catalog, searchTerm, colorFilter, seasonalFilter, priceRange, sortBy, showOnlyMustHave, hideToAvoid]);

  const fetchCatalog = async () => {
    // Mock data - will be replaced with flower_catalog Supabase query
    const mockCatalog: FlowerCatalogItem[] = [
      {
        id: '1',
        name: 'Garden Rose',
        variety: 'Cafe au Lait',
        color: 'Blush',
        base_price: 3.50,
        seasonal_availability: { may: true, june: true, july: true, august: true, september: true, october: true },
        processing_waste_factor: 0.15,
        processing_notes: 'Remove guard petals, cut stems at 45° angle',
        preferred_vendor: 'California Flower Market',
        stem_length: '50-60cm',
        vase_life_days: 7,
        care_notes: 'Keep cool, change water daily',
        is_active: true
      },
      {
        id: '2',
        name: 'Peony',
        variety: 'Sarah Bernhardt',
        color: 'Pink',
        base_price: 4.50,
        seasonal_availability: { april: true, may: true, june: true },
        processing_waste_factor: 0.10,
        processing_notes: 'Cut when buds are soft, allow to open naturally',
        preferred_vendor: 'Holland Imports',
        stem_length: '60-70cm',
        vase_life_days: 5,
        care_notes: 'Very temperature sensitive, keep cool',
        is_active: true
      },
      {
        id: '3',
        name: 'Dahlia',
        variety: 'Cafe au Lait',
        color: 'Cream',
        base_price: 3.25,
        seasonal_availability: { july: true, august: true, september: true, october: true, november: true },
        processing_waste_factor: 0.12,
        processing_notes: 'Sear stems before arranging',
        preferred_vendor: 'Local Farm',
        stem_length: '40-50cm',
        vase_life_days: 6,
        care_notes: 'Recut and sear stems every 2 days',
        is_active: true
      },
      {
        id: '4',
        name: 'Ranunculus',
        variety: 'Italian',
        color: 'White',
        base_price: 2.25,
        seasonal_availability: { january: true, february: true, march: true, april: true, may: true },
        processing_waste_factor: 0.10,
        processing_notes: 'Remove lower leaves, trim stems',
        preferred_vendor: 'California Flower Market',
        stem_length: '30-40cm',
        vase_life_days: 7,
        is_active: true
      },
      {
        id: '5',
        name: 'Spray Rose',
        variety: 'Majolica',
        color: 'White',
        base_price: 1.75,
        seasonal_availability: { january: true, february: true, march: true, april: true, may: true, june: true, july: true, august: true, september: true, october: true, november: true, december: true },
        processing_waste_factor: 0.08,
        processing_notes: 'Remove thorns and lower leaves',
        preferred_vendor: 'Ecuador Direct',
        stem_length: '50-60cm',
        vase_life_days: 10,
        is_active: true
      },
      {
        id: '6',
        name: 'Eucalyptus',
        variety: 'Silver Dollar',
        color: 'Green',
        base_price: 1.25,
        seasonal_availability: { january: true, february: true, march: true, april: true, may: true, june: true, july: true, august: true, september: true, october: true, november: true, december: true },
        processing_waste_factor: 0.05,
        processing_notes: 'Strip lower leaves, woody stems',
        preferred_vendor: 'California Greens',
        stem_length: '60-80cm',
        vase_life_days: 14,
        is_active: true
      },
      {
        id: '7',
        name: 'Italian Ruscus',
        variety: 'Standard',
        color: 'Green',
        base_price: 1.50,
        seasonal_availability: { january: true, february: true, march: true, april: true, may: true, june: true, july: true, august: true, september: true, october: true, november: true, december: true },
        processing_waste_factor: 0.10,
        processing_notes: 'Trim woody stems at angle',
        preferred_vendor: 'Local Greens Supply',
        stem_length: '50-70cm',
        vase_life_days: 21,
        is_active: true
      }
    ];

    // Add computed fields
    const enrichedCatalog = mockCatalog.map(flower => ({
      ...flower,
      stock_status: getSeasonalStatus(flower, eventDate).status
    }));

    setCatalog(enrichedCatalog);
  };

  const getSeasonalStatus = (flower: FlowerCatalogItem, date: Date): {
    status: 'in_season' | 'limited' | 'out_of_season',
    icon: React.ComponentType,
    color: string,
    message: string,
    priceSurge: number
  } => {
    const eventMonth = date.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    
    if (flower.seasonal_availability[eventMonth]) {
      return { 
        status: 'in_season', 
        icon: CheckCircle, 
        color: 'text-green-600 bg-green-50', 
        message: `✓ In season for ${eventMonth}`,
        priceSurge: 0
      };
    }
    
    const availableMonths = Object.keys(flower.seasonal_availability).filter(m => flower.seasonal_availability[m]);
    if (availableMonths.length > 0) {
      return { 
        status: 'limited', 
        icon: AlertTriangle, 
        color: 'text-orange-600 bg-orange-50', 
        message: `⚠️ Limited (${availableMonths.join(', ')})`,
        priceSurge: 25
      };
    }
    
    return { 
      status: 'out_of_season', 
      icon: XCircle, 
      color: 'text-red-600 bg-red-50', 
      message: '❌ Out of season',
      priceSurge: 50
    };
  };

  const applyFilters = () => {
    let filtered = [...catalog];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Color filter
    if (colorFilter.length > 0) {
      filtered = filtered.filter(f => colorFilter.includes(f.color.toLowerCase()));
    }

    // Seasonal filter
    if (seasonalFilter !== 'all') {
      filtered = filtered.filter(f => f.stock_status === seasonalFilter);
    }

    // Price range filter
    filtered = filtered.filter(f => f.base_price >= priceRange[0] && f.base_price <= priceRange[1]);

    // Must have filter
    if (showOnlyMustHave && mustHaveFlowers.length > 0) {
      filtered = filtered.filter(f => mustHaveFlowers.includes(f.id));
    }

    // Hide to avoid
    if (hideToAvoid && flowersToAvoid.length > 0) {
      filtered = filtered.filter(f => !flowersToAvoid.includes(f.id));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.base_price - b.base_price;
      if (sortBy === 'seasonal') {
        const statusOrder = { in_season: 0, limited: 1, out_of_season: 2 };
        return statusOrder[a.stock_status!] - statusOrder[b.stock_status!];
      }
      return 0;
    });

    setFilteredCatalog(filtered);
  };

  const handleAddFlower = (flower: FlowerCatalogItem) => {
    const options: FlowerSelectionOptions = {
      useWasteFactor,
      useCatalogPrice,
      customPrice: useCatalogPrice ? undefined : customPrice
    };

    const adjustedQty = useWasteFactor 
      ? Math.ceil(quantity * (1 + flower.processing_waste_factor))
      : quantity;

    const price = useCatalogPrice ? flower.base_price : customPrice;
    const totalCost = adjustedQty * price;

    const selection: FlowerSelection = {
      flower,
      quantity,
      options,
      adjustedQuantity: adjustedQty,
      totalCost
    };

    setSelectedFlowers(prev => [...prev, selection]);

    if (onFlowerSelect) {
      onFlowerSelect(flower, quantity, options);
    }

    // Reset selection
    setQuantity(1);
    setActiveFlower(null);
  };

  const handleRemoveSelection = (index: number) => {
    setSelectedFlowers(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkAdd = () => {
    if (onBulkAdd && selectedFlowers.length > 0) {
      onBulkAdd(selectedFlowers);
      setSelectedFlowers([]);
    }
  };

  const uniqueColors = Array.from(new Set(catalog.map(f => f.color.toLowerCase())));
  const totalCost = selectedFlowers.reduce((sum, sel) => sum + sel.totalCost, 0);
  const totalStems = selectedFlowers.reduce((sum, sel) => sum + sel.adjustedQuantity, 0);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Catalog</TabsTrigger>
          <TabsTrigger value="selected">
            Selected ({selectedFlowers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search flowers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Seasonal Status</Label>
                  <Select value={seasonalFilter} onValueChange={setSeasonalFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Flowers</SelectItem>
                      <SelectItem value="in_season">In Season Only</SelectItem>
                      <SelectItem value="limited">Limited Availability</SelectItem>
                      <SelectItem value="out_of_season">Out of Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(val: 'name' | 'price' | 'seasonal') => setSortBy(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="seasonal">Seasonal Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mustHave"
                    checked={showOnlyMustHave}
                    onCheckedChange={(checked) => setShowOnlyMustHave(checked as boolean)}
                  />
                  <label htmlFor="mustHave" className="text-sm">
                    Show only must-have flowers ({mustHaveFlowers.length})
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideAvoid"
                    checked={hideToAvoid}
                    onCheckedChange={(checked) => setHideToAvoid(checked as boolean)}
                  />
                  <label htmlFor="hideAvoid" className="text-sm">
                    Hide flowers to avoid ({flowersToAvoid.length})
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catalog Grid */}
          <div className="text-sm text-muted-foreground mb-2">
            Showing {filteredCatalog.length} of {catalog.length} flowers
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map(flower => {
              const seasonalInfo = getSeasonalStatus(flower, eventDate);
              const StatusIcon = seasonalInfo.icon as React.ComponentType<{ className?: string }>;
              const isMustHave = mustHaveFlowers.includes(flower.id);
              const isToAvoid = flowersToAvoid.includes(flower.id);
              const adjustedPrice = flower.base_price * (1 + seasonalInfo.priceSurge / 100);

              return (
                <Card 
                  key={flower.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isMustHave ? 'border-green-300 bg-green-50' : 
                    isToAvoid ? 'border-red-300 bg-red-50' : ''
                  }`}
                  onClick={() => setActiveFlower(flower)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Flower className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-semibold">{flower.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {flower.variety} • {flower.color}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {isMustHave && (
                          <Badge variant="default" className="text-xs">Must Have</Badge>
                        )}
                        {isToAvoid && (
                          <Badge variant="destructive" className="text-xs">Avoid</Badge>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 p-2 rounded text-sm ${seasonalInfo.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="flex-1">{seasonalInfo.message}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Catalog Price</p>
                        <p className="font-bold">${flower.base_price.toFixed(2)}/stem</p>
                      </div>
                      {seasonalInfo.priceSurge > 0 && (
                        <div>
                          <p className="text-muted-foreground">Adjusted Price</p>
                          <p className="font-bold text-orange-600">
                            ${adjustedPrice.toFixed(2)}/stem
                            <span className="text-xs ml-1">+{seasonalInfo.priceSurge}%</span>
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Waste Factor</p>
                        <p className="font-medium">{(flower.processing_waste_factor * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vase Life</p>
                        <p className="font-medium">{flower.vase_life_days} days</p>
                      </div>
                    </div>

                    {flower.preferred_vendor && (
                      <div className="text-xs text-muted-foreground">
                        Vendor: {flower.preferred_vendor}
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFlower(flower);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          {selectedFlowers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No flowers selected yet. Browse the catalog to add flowers.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Flowers</p>
                      <p className="text-2xl font-bold">{selectedFlowers.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Stems</p>
                      <p className="text-2xl font-bold">{totalStems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-green-700">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Items */}
              <div className="space-y-3">
                {selectedFlowers.map((sel, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {sel.flower.name} - {sel.flower.variety}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {sel.flower.color}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">
                                {sel.quantity} stems
                                {sel.options.useWasteFactor && (
                                  <span className="text-muted-foreground ml-1">
                                    + {sel.adjustedQuantity - sel.quantity} waste = {sel.adjustedQuantity} total
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">
                                ${sel.options.useCatalogPrice ? sel.flower.base_price.toFixed(2) : sel.options.customPrice?.toFixed(2)}/stem
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">${sel.totalCost.toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSelection(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" size="lg" onClick={handleBulkAdd}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Design ({selectedFlowers.length} flowers)
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Add Panel */}
      {activeFlower && (
        <Card className="border-blue-500 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add: {activeFlower.name} - {activeFlower.variety}</span>
              <Button variant="ghost" size="sm" onClick={() => setActiveFlower(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity (stems)</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Adjusted Quantity</Label>
                <Input
                  type="number"
                  disabled
                  value={useWasteFactor ? Math.ceil(quantity * (1 + activeFlower.processing_waste_factor)) : quantity}
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waste"
                  checked={useWasteFactor}
                  onCheckedChange={(checked) => setUseWasteFactor(checked as boolean)}
                />
                <label htmlFor="waste" className="text-sm">
                  Add {(activeFlower.processing_waste_factor * 100).toFixed(0)}% for processing waste
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pricing</Label>
              <RadioGroup value={useCatalogPrice ? 'catalog' : 'custom'} onValueChange={(val) => setUseCatalogPrice(val === 'catalog')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="catalog" id="catalog" />
                  <label htmlFor="catalog" className="text-sm">
                    Use catalog price (${activeFlower.base_price.toFixed(2)}/stem)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <label htmlFor="custom" className="text-sm">
                    Enter custom price
                  </label>
                </div>
              </RadioGroup>

              {!useCatalogPrice && (
                <Input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Custom price per stem"
                />
              )}
            </div>

            {activeFlower.processing_notes && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Processing Notes</p>
                    <p className="text-blue-700">{activeFlower.processing_notes}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${((useWasteFactor ? Math.ceil(quantity * (1 + activeFlower.processing_waste_factor)) : quantity) * 
                       (useCatalogPrice ? activeFlower.base_price : customPrice)).toFixed(2)}
                  </p>
                </div>
                <Button onClick={() => handleAddFlower(activeFlower)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Flower
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlowerPicker;