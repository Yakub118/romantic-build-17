import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plus, X, Upload } from "lucide-react";

export interface TimelineMemory {
  id: string;
  date: string;
  title: string;
  description: string;
  photo?: File;
  photoUrl?: string;
}

interface TimelineEditorProps {
  memories: TimelineMemory[];
  onMemoriesChange: (memories: TimelineMemory[]) => void;
  maxMemories?: number;
}

const TimelineEditor = ({ memories, onMemoriesChange, maxMemories = 5 }: TimelineEditorProps) => {
  const [newMemory, setNewMemory] = useState<Partial<TimelineMemory>>({
    date: "",
    title: "",
    description: "",
  });

  const addMemory = () => {
    if (memories.length >= maxMemories) return;
    
    const memory: TimelineMemory = {
      id: Date.now().toString(),
      date: newMemory.date || "",
      title: newMemory.title || "",
      description: newMemory.description || "",
      photo: newMemory.photo,
      photoUrl: newMemory.photoUrl,
    };

    onMemoriesChange([...memories, memory]);
    setNewMemory({ date: "", title: "", description: "" });
  };

  const removeMemory = (id: string) => {
    onMemoriesChange(memories.filter(memory => memory.id !== id));
  };

  const handlePhotoUpload = (file: File, index?: number) => {
    const photoUrl = URL.createObjectURL(file);
    
    if (index !== undefined) {
      // Update existing memory
      const updatedMemories = [...memories];
      updatedMemories[index] = { ...updatedMemories[index], photo: file, photoUrl };
      onMemoriesChange(updatedMemories);
    } else {
      // Update new memory
      setNewMemory({ ...newMemory, photo: file, photoUrl });
    }
  };

  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <Clock className="w-5 h-5" />
          Love Timeline 🕰️
        </CardTitle>
        <CardDescription>
          Create a beautiful journey of your relationship milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Memories */}
        {memories.map((memory, index) => (
          <div key={memory.id} className="p-4 rounded-lg border border-white/20 bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-primary">{memory.title || `Memory ${index + 1}`}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMemory(memory.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <p className="text-sm">{memory.date}</p>
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <p className="text-sm">{memory.title}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Description</Label>
              <p className="text-sm text-muted-foreground">{memory.description}</p>
            </div>

            {memory.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={memory.photoUrl}
                  alt={memory.title}
                  className="w-20 h-20 object-cover rounded-lg border border-white/20"
                />
              </div>
            )}
          </div>
        ))}

        {/* Add New Memory */}
        {memories.length < maxMemories && (
          <div className="p-4 rounded-lg border border-dashed border-white/30 space-y-4">
            <h4 className="font-medium text-primary">Add New Memory</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memory-date" className="text-sm">Date</Label>
                <Input
                  id="memory-date"
                  placeholder="e.g., June 2023"
                  value={newMemory.date}
                  onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                  className="glass border-white/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memory-title" className="text-sm">Title</Label>
                <Input
                  id="memory-title"
                  placeholder="e.g., Our First Date"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  className="glass border-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory-description" className="text-sm">Description</Label>
              <Textarea
                id="memory-description"
                placeholder="Tell the story of this special moment..."
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                className="glass border-white/30 min-h-[80px] resize-none"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Photo (Optional)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                  className="hidden"
                  id="new-memory-photo"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('new-memory-photo')?.click()}
                  className="border-white/20 bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                
                {newMemory.photoUrl && (
                  <img
                    src={newMemory.photoUrl}
                    alt="New memory"
                    className="w-12 h-12 object-cover rounded border border-white/20"
                  />
                )}
              </div>
            </div>

            <Button
              onClick={addMemory}
              disabled={!newMemory.title || !newMemory.description}
              className="w-full"
              variant="romantic"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        )}

        {memories.length >= maxMemories && (
          <p className="text-sm text-muted-foreground text-center">
            Maximum {maxMemories} memories reached
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineEditor;
