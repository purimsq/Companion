import { useState } from "react";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/upload-modal";
import { Plus } from "lucide-react";

export default function FloatingAddButton() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsUploadModalOpen(true)}
        className="floating-add fixed bottom-8 right-8 w-16 h-16 rounded-full text-white shadow-warm p-0 z-40"
        size="lg"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </>
  );
}
