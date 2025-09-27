import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export type ConfettiStyle = "hearts" | "stars" | "rose-petals" | "champagne-bubbles";

interface ConfettiOption {
  id: ConfettiStyle;
  name: string;
  emoji: string;
  description: string;
}

const confettiOptions: ConfettiOption[] = [
  {
    id: "hearts",
    name: "Hearts",
    emoji: "💖",
    description: "Classic romantic hearts"
  },
  {
    id: "stars",
    name: "Stars",
    emoji: "✨",
    description: "Magical twinkling stars"
  },
  {
    id: "rose-petals",
    name: "Rose Petals",
    emoji: "🌹",
    description: "Elegant falling rose petals"
  },
  {
    id: "champagne-bubbles",
    name: "Champagne Bubbles",
    emoji: "🥂",
    description: "Celebratory champagne bubbles"
  }
];

interface ConfettiSelectorProps {
  selectedStyle: ConfettiStyle;
  onStyleChange: (style: ConfettiStyle) => void;
}

const ConfettiSelector = ({ selectedStyle, onStyleChange }: ConfettiSelectorProps) => {
  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <Sparkles className="w-5 h-5" />
          Celebration Style 🎉
        </CardTitle>
        <CardDescription>
          Choose how to celebrate when they say "Yes!"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {confettiOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedStyle === option.id ? "romantic" : "outline"}
              onClick={() => onStyleChange(option.id)}
              className={`h-auto flex-col space-y-2 p-4 ${
                selectedStyle === option.id 
                  ? "border-primary shadow-glow-romantic" 
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-sm font-medium">{option.name}</span>
              <span className="text-xs text-muted-foreground text-center">
                {option.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfettiSelector;