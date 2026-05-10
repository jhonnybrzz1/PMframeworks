import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { FrameworkInfo } from "@/types/analysis";

interface FavoriteFrameworksProps {
  favorites: string[];
  frameworks: FrameworkInfo[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function FavoriteFrameworks({ favorites, frameworks, onSelect, onToggle }: FavoriteFrameworksProps) {
  if (favorites.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Favoritos</h3>
        <div className="flex flex-wrap gap-2">
          {favorites.map(id => {
            const f = frameworks.find(fr => fr.id === id);
            if (!f) return null;
            return (
              <div key={id} className="flex items-center space-x-2 bg-white border px-3 py-1 rounded">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onSelect(id)}
                  className="h-auto p-1 text-xs"
                >
                  {f.name}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onToggle(id)}
                  className="h-auto p-1"
                >
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
