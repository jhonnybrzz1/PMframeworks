import { Button } from "@/components/ui/button";
import { FrameworkInfo } from "@/types/analysis";

interface FrameworkSuggestionsProps {
  frameworks: FrameworkInfo[];
  onSelect: (id: string) => void;
}

export function FrameworkSuggestions({ frameworks, onSelect }: FrameworkSuggestionsProps) {
  const recommendations = ['lean-canvas', 'swot-analysis', 'opportunity-assessment'];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Frameworks Recomendados:</h4>
      <div className="flex flex-wrap gap-2">
        {recommendations.map((id) => {
          const frameworkInfo = frameworks.find(f => f.id === id);
          return frameworkInfo ? (
            <Button
              key={id}
              variant="outline"
              size="sm"
              onClick={() => onSelect(id)}
              className="text-xs bg-white hover:bg-blue-100 border-blue-300"
            >
              {frameworkInfo.name}
            </Button>
          ) : null;
        })}
      </div>
    </div>
  );
}
