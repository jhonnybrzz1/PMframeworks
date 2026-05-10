import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileDown } from "lucide-react";

interface ExportButtonsProps {
  onCopy: () => void;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
  isCopied: boolean;
}

export function ExportButtons({ onCopy, onExportMarkdown, onExportPDF, isCopied }: ExportButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
      >
        <Copy className="mr-1 h-4 w-4" />
        {isCopied ? 'Copiado!' : 'Copiar'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportMarkdown}
      >
        <Download className="mr-1 h-4 w-4" />
        MD
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
      >
        <FileDown className="mr-1 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
