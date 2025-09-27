import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface CustomEndingMessageProps {
  message: string;
  onMessageChange: (message: string) => void;
}

const CustomEndingMessage = ({ message, onMessageChange }: CustomEndingMessageProps) => {
  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <MessageCircle className="w-5 h-5" />
          Final Message 💌
        </CardTitle>
        <CardDescription>
          A special message to show after they say "Yes" (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="ending-message" className="text-sm font-medium">
            Your Final Message (Optional)
          </Label>
          <Textarea
            id="ending-message"
            placeholder="Thank you for making me the happiest person alive! Let's start planning our future together... 💕"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="glass border-white/30 min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground text-right">
            {message.length}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomEndingMessage;