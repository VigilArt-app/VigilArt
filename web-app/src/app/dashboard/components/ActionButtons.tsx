"use client";

import { Button } from "../../../components/ui/button";
import { Image as ImageIcon, Upload } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="space-y-4 w-full">
      <Button variant="outline" className="w-full h-20 flex items-center justify-between px-6">
        <span className="font-bold text-lg">See Gallery</span>
        <ImageIcon className="w-6 h-6" />
      </Button>
      <Button variant="outline" className="w-full h-20 flex items-center justify-between px-6">
        <span className="font-bold text-lg">Upload Pictures</span>
        <Upload className="w-6 h-6" />
      </Button>
    </div>
  );
}
