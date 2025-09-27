import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Upload, Play, Pause, X } from "lucide-react";

interface VoiceNoteUploadProps {
  voiceNote: File | null;
  onVoiceNoteChange: (file: File | null) => void;
}

const VoiceNoteUpload = ({ voiceNote, onVoiceNoteChange }: VoiceNoteUploadProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onVoiceNoteChange(file);
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const removeVoiceNote = () => {
    onVoiceNoteChange(null);
    setIsPlaying(false);
  };

  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <Mic className="w-5 h-5" />
          Voice Message 🎶
        </CardTitle>
        <CardDescription>
          Record or upload a personal voice message (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!voiceNote ? (
          <div className="space-y-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-white/20 bg-white/10 text-foreground hover:bg-white/20"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Audio File
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Supported formats: MP3, WAV, M4A (max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/20 bg-white/5">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayback}
                  className="text-primary"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div>
                  <p className="text-sm font-medium">{voiceNote.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(voiceNote.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removeVoiceNote}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {voiceNote && (
              <audio
                ref={audioRef}
                src={URL.createObjectURL(voiceNote)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceNoteUpload;