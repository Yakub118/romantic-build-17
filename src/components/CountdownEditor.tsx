import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface CountdownEditorProps {
  countdownDate: Date | null;
  onCountdownChange: (date: Date | null) => void;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const CountdownEditor = ({ 
  countdownDate, 
  onCountdownChange, 
  isEnabled, 
  onEnabledChange 
}: CountdownEditorProps) => {
  const [dateInput, setDateInput] = useState(
    countdownDate ? formatDateForInput(countdownDate) : ""
  );
  const [timeInput, setTimeInput] = useState(
    countdownDate ? formatTimeForInput(countdownDate) : "12:00"
  );

  function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  const handleDateTimeChange = (newDate: string, newTime: string) => {
    if (newDate && newTime && isEnabled) {
      const combinedDateTime = new Date(`${newDate}T${newTime}`);
      onCountdownChange(combinedDateTime);
    }
  };

  const handleDateChange = (value: string) => {
    setDateInput(value);
    handleDateTimeChange(value, timeInput);
  };

  const handleTimeChange = (value: string) => {
    setTimeInput(value);
    handleDateTimeChange(dateInput, value);
  };

  const handleEnabledChange = (enabled: boolean) => {
    onEnabledChange(enabled);
    if (enabled && dateInput && timeInput) {
      const combinedDateTime = new Date(`${dateInput}T${timeInput}`);
      onCountdownChange(combinedDateTime);
    } else if (!enabled) {
      onCountdownChange(null);
    }
  };

  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <Clock className="w-5 h-5" />
          Countdown Reveal ⏳
        </CardTitle>
        <CardDescription>
          Schedule when your proposal becomes visible (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="countdown-enabled"
            checked={isEnabled}
            onCheckedChange={handleEnabledChange}
          />
          <Label htmlFor="countdown-enabled" className="text-sm font-medium">
            Enable countdown mode
          </Label>
        </div>

        {isEnabled && (
          <div className="space-y-4 p-4 rounded-lg border border-white/20 bg-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countdown-date" className="text-sm">
                  Reveal Date
                </Label>
                <Input
                  id="countdown-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="glass border-white/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="countdown-time" className="text-sm">
                  Reveal Time
                </Label>
                <Input
                  id="countdown-time"
                  type="time"
                  value={timeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="glass border-white/30"
                />
              </div>
            </div>

            {countdownDate && (
              <div className="p-3 rounded-lg bg-romantic/20 border border-romantic/30">
                <p className="text-sm text-center">
                  <span className="font-medium">Proposal will be revealed on:</span>
                  <br />
                  <span className="text-primary font-romantic">
                    {countdownDate.toLocaleDateString()} at {countdownDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Visitors will see a countdown screen until the scheduled time</p>
              <p>• The proposal will automatically unlock at the specified time</p>
              <p>• You can disable this feature anytime</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownEditor;