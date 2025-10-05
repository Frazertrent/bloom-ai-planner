import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flower,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  ArrowRight,
  Save,
  DollarSign,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';

interface SubstitutionPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  flower: FlowerItem;
  eventDate?: Date;
  onSaveSubstitution?: (flower: FlowerItem, substitution: SubstitutionOption) => void;
}

interface FlowerItem {
  id: string;
  name: string;
  variety: string;
  color: string;
  base_price: number;
  quantity: number;
  seasonal_availability?: Record<string, boolean>;
}

interface SubstitutionOption {
  type: 'same_flower_different_color' | 'similar_type' | 'budget_alternative';
  substitute_flower: FlowerItem;
  price_difference: number;
  price_difference_percent: number;
  availability_status: 'better' | 'same' | 'worse';
  notes: string;
  confidence_score: number;
}

const SubstitutionPlanner = ({
  isOpen,
  onClose,
  flower,
  eventDate = new Date(),
  onSaveSubstitution
}: SubstitutionPlannerProps) => {
  const [substitutions, setSubstitutions] = useState<{
    sameFlowerDifferentColor: SubstitutionOption[];
    similarType: SubstitutionOption[];
    budgetAlternative: SubstitutionOption[];
  }>({
    sameFlowerDifferentColor: [],
    similarType: [],
    budgetAlternative: []
  });
  const [selectedSubstitution, setSelectedSubstitution] = useState<SubstitutionOption | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && flower) {
      generateSubstitutions();
    }
  }, [isOpen, flower]);

  const generateSubstitutions = async () => {
    setLoading(true);

    // TODO: Replace with actual Supabase queries and AI recommendations
    // Query 1: Same flower, different colors from flower_catalog WHERE name = flower.name AND color != flower.color
    // Query 2: Similar types from flower_catalog WHERE category = flower.category AND name != flower.name
    // Query 3: Budget alternatives from flower_catalog WHERE catalog_price < flower.catalog_price ORDER BY catalog_price DESC

    // Mock substitution data
    const mockSameFlower: SubstitutionOption[] = [
      {
        type: 'same_flower_different_color',
        substitute_flower: {
          id: 'sub1',
          name: flower.name,
          variety: flower.variety,
          color: 'White',
          base_price: flower.base_price - 0.25,
          quantity: flower.quantity
        },
        price_difference: -0.25 * flower.quantity,
        price_difference_percent: -7,
        availability_status: 'better',
        notes: 'White variety typically more available and slightly less expensive',
        confidence_score: 95
      },
      {
        type: 'same_flower_different_color',
        substitute_flower: {
          id: 'sub2',
          name: flower.name,
          variety: flower.variety,
          color: 'Ivory',
          base_price: flower.base_price,
          quantity: flower.quantity
        },
        price_difference: 0,
        price_difference_percent: 0,
        availability_status: 'same',
        notes: 'Similar aesthetic, same price point and availability',
        confidence_score: 90
      },
      {
        type: 'same_flower_different_color',
        substitute_flower: {
          id: 'sub3',
          name: flower.name,
          variety: flower.variety,
          color: 'Champagne',
          base_price: flower.base_price + 0.50,
          quantity: flower.quantity
        },
        price_difference: 0.50 * flower.quantity,
        price_difference_percent: 14,
        availability_status: 'worse',
        notes: 'Premium color, limited availability, higher cost',
        confidence_score: 75
      }
    ];

    const mockSimilarType: SubstitutionOption[] = [
      {
        type: 'similar_type',
        substitute_flower: {
          id: 'sim1',
          name: 'Spray Rose',
          variety: 'Majolica',
          color: flower.color,
          base_price: flower.base_price - 1.75,
          quantity: Math.ceil(flower.quantity * 1.5) // Need more stems for similar visual impact
        },
        price_difference:         ((flower.base_price - 1.75) * Math.ceil(flower.quantity * 1.5)) - (flower.base_price * flower.quantity),
        price_difference_percent: -35,
        availability_status: 'better',
        notes: 'Similar aesthetic with smaller blooms. Need ~50% more stems for comparable fullness',
        confidence_score: 85
      },
      {
        type: 'similar_type',
        substitute_flower: {
          id: 'sim2',
          name: 'Ranunculus',
          variety: 'Italian',
          color: flower.color,
          base_price: flower.base_price - 1.25,
          quantity: flower.quantity
        },
        price_difference: -1.25 * flower.quantity,
        price_difference_percent: -36,
        availability_status: 'same',
        notes: 'Similar texture and size, good seasonal alternative in winter/spring',
        confidence_score: 88
      },
      {
        type: 'similar_type',
        substitute_flower: {
          id: 'sim3',
          name: 'Garden Rose',
          variety: 'Cafe au Lait',
          color: 'Blush',
          base_price: flower.base_price,
          quantity: flower.quantity
        },
        price_difference: 0,
        price_difference_percent: 0,
        availability_status: 'better',
        notes: 'Premium alternative with longer vase life and similar romantic aesthetic',
        confidence_score: 92
      }
    ];

    const mockBudgetAlternative: SubstitutionOption[] = [
      {
        type: 'budget_alternative',
        substitute_flower: {
          id: 'bud1',
          name: 'Carnation',
          variety: 'Standard',
          color: flower.color,
          base_price: 0.75,
          quantity: Math.ceil(flower.quantity * 1.8)
        },
        price_difference:         (0.75 * Math.ceil(flower.quantity * 1.8)) - (flower.base_price * flower.quantity),
        price_difference_percent: -70,
        availability_status: 'better',
        notes: 'Budget-friendly option. Need 80% more stems. Year-round availability',
        confidence_score: 70
      },
      {
        type: 'budget_alternative',
        substitute_flower: {
          id: 'bud2',
          name: 'Alstroemeria',
          variety: 'Peruvian Lily',
          color: flower.color,
          base_price: 1.25,
          quantity: Math.ceil(flower.quantity * 1.3)
        },
        price_difference: (1.25 * Math.ceil(flower.quantity * 1.3)) - (flower.base_price * flower.quantity),
        price_difference_percent: -55,
        availability_status: 'better',
        notes: 'Good value with long vase life. Need ~30% more stems for volume',
        confidence_score: 78
      },
      {
        type: 'budget_alternative',
        substitute_flower: {
          id: 'bud3',
          name: 'Stock',
          variety: 'Column',
          color: flower.color,
          base_price: 1.50,
          quantity: flower.quantity
        },
        price_difference: (1.50 * flower.quantity) - (flower.base_price * flower.quantity),
        price_difference_percent: -58,
        availability_status: 'same',
        notes: 'Fragrant alternative with good visual impact. Similar stem count',
        confidence_score: 82
      }
    ];

    setSubstitutions({
      sameFlowerDifferentColor: mockSameFlower,
      similarType: mockSimilarType,
      budgetAlternative: mockBudgetAlternative
    });
    setLoading(false);
  };

  const handleSaveSubstitution = () => {
    if (!selectedSubstitution) return;
    
    if (onSaveSubstitution) {
      onSaveSubstitution(flower, selectedSubstitution);
    }
    
    onClose();
  };

  const renderSubstitutionCard = (sub: SubstitutionOption) => {
    const isSelected = selectedSubstitution?.substitute_flower.id === sub.substitute_flower.id;
    const PriceIcon = sub.price_difference < 0 ? TrendingDown : sub.price_difference > 0 ? TrendingUp : Minus;
    const priceColor = sub.price_difference < 0 ? 'text-green-600' : sub.price_difference > 0 ? 'text-red-600' : 'text-gray-600';

    return (
      <Card 
        key={sub.substitute_flower.id}
        className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 border-2 shadow-md' : 'hover:border-gray-300'}`}
        onClick={() => setSelectedSubstitution(sub)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Flower className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold">
                  {sub.substitute_flower.name} - {sub.substitute_flower.variety}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">{sub.substitute_flower.color}</p>
            </div>
            <Badge variant={sub.confidence_score >= 90 ? 'default' : 'secondary'}>
              {sub.confidence_score}% match
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Price/Stem</p>
              <p className="font-bold">${sub.substitute_flower.base_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-bold">{sub.substitute_flower.quantity} stems</p>
            </div>
            <div>
              <p className="text-muted-foreground">Availability</p>
              <Badge variant={
                sub.availability_status === 'better' ? 'default' :
                sub.availability_status === 'worse' ? 'destructive' : 'secondary'
              }>
                {sub.availability_status}
              </Badge>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-2 rounded ${priceColor} bg-gray-50`}>
            <PriceIcon className="w-4 h-4" />
            <span className="font-semibold">
              {sub.price_difference < 0 ? 'Save' : 'Add'} ${Math.abs(sub.price_difference).toFixed(2)}
              <span className="text-sm ml-1">({Math.abs(sub.price_difference_percent)}%)</span>
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <p className="text-blue-900">{sub.notes}</p>
            </div>
          </div>

          {isSelected && (
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Selected as substitute
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Plan Substitutions for {flower.name}
          </DialogTitle>
          <DialogDescription>
            Find alternative flowers that match your design while considering price, availability, and aesthetic
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Flower Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Original Selection</p>
                  <h3 className="font-semibold text-lg">
                    {flower.name} - {flower.variety} ({flower.color})
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {flower.quantity} stems × ${flower.base_price.toFixed(2)} = ${(flower.quantity * flower.base_price).toFixed(2)}
                  </p>
                </div>
                <ArrowRight className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Substitution Tabs */}
          <Tabs defaultValue="same" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="same">
                Same Flower, Different Color
              </TabsTrigger>
              <TabsTrigger value="similar">
                Similar Flower Type
              </TabsTrigger>
              <TabsTrigger value="budget">
                Budget Alternative
              </TabsTrigger>
            </TabsList>

            <TabsContent value="same" className="space-y-3 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg text-sm mb-4">
                <p className="font-medium text-blue-900 mb-1">Strategy: Same flower, different color</p>
                <p className="text-blue-700">
                  Keep the same variety and size, but change the color. Usually maintains similar pricing and availability.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading substitutions...</div>
              ) : substitutions.sameFlowerDifferentColor.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No color alternatives found for this flower
                  </CardContent>
                </Card>
              ) : (
                substitutions.sameFlowerDifferentColor.map(renderSubstitutionCard)
              )}
            </TabsContent>

            <TabsContent value="similar" className="space-y-3 mt-4">
              <div className="p-3 bg-purple-50 rounded-lg text-sm mb-4">
                <p className="font-medium text-purple-900 mb-1">Strategy: Similar flower type</p>
                <p className="text-purple-700">
                  Different flower with similar size, texture, or aesthetic. May require quantity adjustments for comparable visual impact.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading substitutions...</div>
              ) : substitutions.similarType.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No similar flower types found
                  </CardContent>
                </Card>
              ) : (
                substitutions.similarType.map(renderSubstitutionCard)
              )}
            </TabsContent>

            <TabsContent value="budget" className="space-y-3 mt-4">
              <div className="p-3 bg-green-50 rounded-lg text-sm mb-4">
                <p className="font-medium text-green-900 mb-1">Strategy: Budget alternative</p>
                <p className="text-green-700">
                  More affordable options that can achieve similar visual impact. Often requires more stems but significantly reduces cost.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading substitutions...</div>
              ) : substitutions.budgetAlternative.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No budget alternatives found
                  </CardContent>
                </Card>
              ) : (
                substitutions.budgetAlternative.map(renderSubstitutionCard)
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleSaveSubstitution}
              disabled={!selectedSubstitution}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Substitution Plan
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {selectedSubstitution && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-900">Substitution Selected</p>
                </div>
                <p className="text-sm text-green-800">
                  This substitution plan will be saved with your design. You can activate it if the original flower becomes unavailable.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionPlanner;