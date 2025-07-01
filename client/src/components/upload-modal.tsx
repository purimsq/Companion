import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, FileText, X, CheckCircle } from "lucide-react";

interface Unit {
  id: number;
  name: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, unitId }: { file: File; unitId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`/api/units/${unitId}/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and processed successfully.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedUnitId("");
    setIsDragOver(false);
    onClose();
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedUnitId) {
      toast({
        title: "Missing information",
        description: "Please select both a file and a unit.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      unitId: parseInt(selectedUnitId),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-soft-golden" />
            <span>Add Study Material</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Select Unit
            </label>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger className="focus-warm">
                <SelectValue placeholder="Choose a unit..." />
              </SelectTrigger>
              <SelectContent>
                {units?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? "border-soft-golden bg-soft-golden/5"
                  : "border-warm-beige hover:border-soft-golden"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-12 h-12 text-soft-black/40 mx-auto mb-4" />
              <p className="text-soft-black/70 mb-2">Click to browse or drag files here</p>
              <p className="text-xs text-soft-black/50">Supports PDF and DOCX files (max 10MB)</p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <Card className="bg-warm-beige/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-soft-golden" />
                    <div>
                      <p className="font-medium text-charcoal text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-soft-black/60">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              className="flex-1 bg-soft-golden hover:bg-warning-soft text-white"
              disabled={!selectedFile || !selectedUnitId || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Upload</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
