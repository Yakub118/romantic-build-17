import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool } from "lucide-react";

interface LoveLetterEditorProps {
  loveLetter: string;
  onLoveLetterChange: (letter: string) => void;
}

const LoveLetterEditor = ({ loveLetter, onLoveLetterChange }: LoveLetterEditorProps) => {
  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <PenTool className="w-5 h-5" />
          Love Letter ✍️
        </CardTitle>
        <CardDescription>
          Write a heartfelt letter that will be displayed in beautiful handwritten style
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="love-letter" className="text-sm font-medium">
            Your Love Letter (Optional)
          </Label>
          <Textarea
            id="love-letter"
            placeholder="My dearest love, from the moment I met you..."
            value={loveLetter}
            onChange={(e) => onLoveLetterChange(e.target.value)}
            className="glass border-white/30 min-h-[150px] resize-none font-serif"
            maxLength={2000}
          />
          <p className="text-sm text-muted-foreground text-right">
            {loveLetter.length}/2000 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoveLetterEditor;