import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Camera,
  Upload,
  FolderPlus,
  Share2,
  Download,
  Search,
  Grid3X3,
  List,
  Star,
  Tag,
  Calendar,
  Users,
  Eye,
  Heart,
  Filter,
  MoreHorizontal,
  ZoomIn,
  Image as ImageIcon,
  Cloud,
  HardDrive,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Palette,
  Target,
  Bookmark,
  Award
} from 'lucide-react';

const PhotoGallery = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample photo collections data
  const eventCollections = [
    {
      id: 1,
      name: "Miller Wedding",
      date: "March 15, 2024",
      photoCount: 147,
      coverImage: "/api/placeholder/400/300",
      photographer: "Sarah Chen Photography",
      venue: "Sunset Gardens",
      tags: ["Wedding", "Spring", "Outdoor"],
      status: "completed"
    },
    {
      id: 2,
      name: "Corporate Spring Gala",
      date: "April 2, 2024",
      photoCount: 89,
      coverImage: "/api/placeholder/400/300",
      photographer: "Metro Events Photo",
      venue: "Downtown Event Center",
      tags: ["Corporate", "Formal", "Indoor"],
      status: "completed"
    },
    {
      id: 3,
      name: "Johnson Anniversary",
      date: "April 10, 2024",
      photoCount: 76,
      coverImage: "/api/placeholder/400/300",
      photographer: "Timeless Moments",
      venue: "Private Estate",
      tags: ["Anniversary", "Intimate", "Garden"],
      status: "completed"
    },
    {
      id: 4,
      name: "Martinez Quinceañera",
      date: "April 18, 2024",
      photoCount: 112,
      coverImage: "/api/placeholder/400/300",
      photographer: "Celebration Shots",
      venue: "Grand Ballroom",
      tags: ["Quinceañera", "Formal", "Pink Theme"],
      status: "in-progress"
    }
  ];

  // Sample portfolio collections
  const portfolioCollections = [
    {
      id: 1,
      name: "Best Bridal Bouquets",
      photoCount: 24,
      coverImage: "/api/placeholder/300/300",
      description: "Stunning bridal bouquets from recent weddings",
      isPublic: true,
      views: 1247
    },
    {
      id: 2,
      name: "Stunning Centerpieces",
      photoCount: 31,
      coverImage: "/api/placeholder/300/300",
      description: "Eye-catching centerpiece designs",
      isPublic: true,
      views: 892
    },
    {
      id: 3,
      name: "Ceremony Installations",
      photoCount: 18,
      coverImage: "/api/placeholder/300/300",
      description: "Dramatic ceremony backdrops and arches",
      isPublic: false,
      views: 0
    },
    {
      id: 4,
      name: "Behind the Scenes",
      photoCount: 42,
      coverImage: "/api/placeholder/300/300",
      description: "Process documentation and team at work",
      isPublic: false,
      views: 0
    }
  ];

  // Sample individual photos
  const samplePhotos = [
    {
      id: 1,
      src: "/api/placeholder/300/400",
      title: "Bridal Bouquet - Miller Wedding",
      event: "Miller Wedding",
      category: "Bouquet",
      photographer: "Sarah Chen Photography",
      rating: 5,
      tags: ["Portfolio", "Bridal", "White", "Roses"],
      uploadDate: "2024-03-16",
      isPortfolio: true
    },
    {
      id: 2,
      src: "/api/placeholder/400/300",
      title: "Reception Centerpiece",
      event: "Miller Wedding",
      category: "Centerpiece",
      photographer: "Sarah Chen Photography",
      rating: 4,
      tags: ["Centerpiece", "Spring", "Pastel"],
      uploadDate: "2024-03-16",
      isPortfolio: false
    },
    {
      id: 3,
      src: "/api/placeholder/300/300",
      title: "Ceremony Arch Setup",
      event: "Miller Wedding",
      category: "Installation",
      photographer: "Sarah Chen Photography",
      rating: 5,
      tags: ["Portfolio", "Ceremony", "Arch", "Outdoor"],
      uploadDate: "2024-03-16",
      isPortfolio: true
    },
    {
      id: 4,
      src: "/api/placeholder/350/300",
      title: "Corporate Table Display",
      event: "Corporate Spring Gala",
      category: "Centerpiece",
      photographer: "Metro Events Photo",
      rating: 3,
      tags: ["Corporate", "Formal", "Modern"],
      uploadDate: "2024-04-03",
      isPortfolio: false
    },
    {
      id: 5,
      src: "/api/placeholder/300/350",
      title: "Quinceañera Crown Display",
      event: "Martinez Quinceañera",
      category: "Detail",
      photographer: "Celebration Shots",
      rating: 4,
      tags: ["Quinceañera", "Pink", "Crown", "Detail"],
      uploadDate: "2024-04-19",
      isPortfolio: false
    },
    {
      id: 6,
      src: "/api/placeholder/400/350",
      title: "Anniversary Romantic Setup",
      event: "Johnson Anniversary",
      category: "Installation",
      photographer: "Timeless Moments",
      rating: 5,
      tags: ["Portfolio", "Anniversary", "Romantic", "Intimate"],
      uploadDate: "2024-04-11",
      isPortfolio: true
    }
  ];

  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Photo Gallery & Portfolio</h1>
            <p className="text-xl text-muted-foreground">Organize, curate, and showcase your floral artistry</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Portfolio
            </Button>
            <Button variant="outline" disabled={selectedPhotos.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download Selected ({selectedPhotos.length})
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+89</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Documented</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+4</span> this quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Pieces</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> curated this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3 GB</div>
              <p className="text-xs text-muted-foreground">of 10 GB available</p>
              <Progress value={23} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="collections">Event Collections</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="sharing">Client Sharing</TabsTrigger>
            <TabsTrigger value="marketing">Marketing Assets</TabsTrigger>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          {/* Event Photo Collections */}
          <TabsContent value="collections" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventCollections.map((collection) => (
                <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img 
                      src={collection.coverImage} 
                      alt={collection.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={collection.status === 'completed' ? 'default' : 'secondary'}>
                        {collection.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {collection.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                        {collection.photoCount} photos
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{collection.date} • {collection.venue}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        By {collection.photographer}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {collection.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Photos
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Upload Area */}
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload New Event Photos</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop photos here, or click to browse files
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Curation */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {portfolioCollections.map((collection) => (
                <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={collection.coverImage} 
                      alt={collection.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {collection.isPublic ? (
                        <Badge variant="default" className="bg-green-600">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{collection.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">{collection.photoCount} photos</span>
                      {collection.isPublic && (
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {collection.views} views
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Photo Selection Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Photos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select photos to add to your portfolio collections
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {samplePhotos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group cursor-pointer"
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <img 
                        src={photo.src} 
                        alt={photo.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      
                      {/* Selection Overlay */}
                      <div className={`absolute inset-0 rounded-lg border-2 transition-all ${
                        selectedPhotos.includes(photo.id) 
                          ? 'border-primary bg-primary/20' 
                          : 'border-transparent group-hover:border-primary/50'
                      }`}>
                        <Checkbox 
                          checked={selectedPhotos.includes(photo.id)}
                          className="absolute top-2 left-2"
                        />
                      </div>
                      
                      {/* Portfolio Badge */}
                      {photo.isPortfolio && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="bg-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Portfolio
                          </Badge>
                        </div>
                      )}
                      
                      {/* Rating */}
                      <div className="absolute bottom-2 left-2">
                        {renderStarRating(photo.rating)}
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary">
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedPhotos.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {selectedPhotos.length} photos selected
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Add to Collection
                        </Button>
                        <Button size="sm" variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          Bulk Tag
                        </Button>
                        <Button size="sm" variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          Mark as Portfolio
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Organization */}
          <TabsContent value="organization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tagging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Photo Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Ceremony', 'Reception', 'Setup', 'Detail', 'Behind-the-scenes'].map((category) => (
                        <Badge key={category} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Flower Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Bouquets', 'Centerpieces', 'Arches', 'Installations', 'Boutonnieres'].map((focus) => (
                        <Badge key={focus} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Quality Rating</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Portfolio-worthy', 'Social media', 'Reference only'].map((quality) => (
                        <Badge key={quality} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Tag className="h-4 w-4 mr-2" />
                    Apply Smart Tags
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Copy className="h-4 w-4 mr-2" />
                      Move to Collection
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Add to Portfolio
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Create Shared Gallery
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Color Palette Detection</h4>
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-pink-300"></div>
                      <div className="w-6 h-6 rounded-full bg-white border"></div>
                      <div className="w-6 h-6 rounded-full bg-green-400"></div>
                      <div className="w-6 h-6 rounded-full bg-gold-400"></div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Palette className="h-3 w-3 mr-1" />
                      Auto-detect Colors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Photo Sharing */}
          <TabsContent value="sharing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventCollections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{collection.date}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gallery Status</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Client Access</span>
                      <Badge variant="secondary">Password Protected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Downloads</span>
                      <span className="text-sm font-medium">23 of {collection.photoCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expires</span>
                      <span className="text-sm">30 days</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Gallery
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Create New Client Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Event</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Choose an event...</option>
                      {eventCollections.map((event) => (
                        <option key={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gallery Name</label>
                    <Input placeholder="Enter gallery name" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Access Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Password protection</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Download limits</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Watermarks on downloads</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Permissions</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <Checkbox defaultChecked />
                        <span className="text-sm">View only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Download original</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Social media sharing</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Gallery
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Assets */}
          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Instagram Posts</span>
                      <Badge variant="outline">42 ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Instagram Stories</span>
                      <Badge variant="outline">28 ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Facebook Posts</span>
                      <Badge variant="outline">35 ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pinterest Pins</span>
                      <Badge variant="outline">67 ready</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Optimize for Platforms
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Spring Weddings</span>
                      <Badge variant="outline">24 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Summer Events</span>
                      <Badge variant="outline">31 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fall Arrangements</span>
                      <Badge variant="outline">18 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Winter Weddings</span>
                      <Badge variant="outline">12 photos</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Seasonal Posts
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Behind the Scenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Setup Process</span>
                      <Badge variant="outline">15 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team at Work</span>
                      <Badge variant="outline">22 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Design Process</span>
                      <Badge variant="outline">8 photos</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client Moments</span>
                      <Badge variant="outline">19 photos</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Create Story Series
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Photographer Collaboration */}
          <TabsContent value="photographers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah Chen Photography",
                  events: 8,
                  rating: 4.9,
                  deliveryTime: "2.1 days avg",
                  status: "preferred",
                  lastEvent: "Miller Wedding"
                },
                {
                  name: "Metro Events Photo",
                  events: 3,
                  rating: 4.6,
                  deliveryTime: "1.8 days avg",
                  status: "active",
                  lastEvent: "Corporate Gala"
                },
                {
                  name: "Timeless Moments",
                  events: 5,
                  rating: 4.8,
                  deliveryTime: "2.5 days avg",
                  status: "preferred",
                  lastEvent: "Johnson Anniversary"
                }
              ].map((photographer, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>{photographer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{photographer.name}</h3>
                          <p className="text-sm text-muted-foreground">{photographer.events} events</p>
                        </div>
                      </div>
                      <Badge variant={photographer.status === 'preferred' ? 'default' : 'secondary'}>
                        {photographer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rating</span>
                      <div className="flex items-center">
                        {renderStarRating(Math.floor(photographer.rating))}
                        <span className="text-sm ml-1">{photographer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Delivery</span>
                      <span className="text-sm font-medium">{photographer.deliveryTime}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Event</span>
                      <span className="text-sm">{photographer.lastEvent}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Portfolio
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Storage & Backup */}
          <TabsContent value="storage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Used Storage</span>
                      <span className="text-sm font-medium">2.3 GB / 10 GB</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Raw Images</span>
                      <span>1.8 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimized</span>
                      <span>0.4 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Thumbnails</span>
                      <span>0.1 GB</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Manage Storage
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Backup Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cloud Backup</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Backup</span>
                    <span className="text-sm">In 22 hours</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Size</span>
                    <span className="text-sm">2.1 GB</span>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Cloud className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Duplicates Found</span>
                    <Badge variant="outline" className="text-amber-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      23 files
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Space Recoverable</span>
                    <span className="text-sm font-medium">147 MB</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compression Rate</span>
                    <span className="text-sm">78%</span>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Optimize Storage
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotoGallery;