import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import InventoryImportPreview from './InventoryImportPreview';

interface InventoryImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  onImportComplete: () => void;
}

interface ParsedItem {
  name?: string;
  brand_model?: string;
  property_number?: string;
  serial_number?: string;
  condition?: string;
  utilization_status?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  accountable_person?: string;
  current_location?: string;
  date_received?: string;
  remarks?: string;
  property_tag?: string;
  property_from?: string;
  category_id?: string;
  _error?: string;
  _selected?: boolean;
}

export default function InventoryImportDialog({
  open,
  onOpenChange,
  categories,
  onImportComplete,
}: InventoryImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const processExcelFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get raw data with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }

    // First row is headers
    const headers = jsonData[0].map((h: any) => String(h || '').trim());
    
    // Rest are data rows, filter out empty rows
    const rows = jsonData.slice(1)
      .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
      .map(row => {
        const rowObj: Record<string, any> = {};
        headers.forEach((header, index) => {
          rowObj[header] = row[index];
        });
        return rowObj;
      });

    if (rows.length === 0) {
      throw new Error('No data rows found in file');
    }

    console.log(`Extracted ${rows.length} rows from Excel`);
    return { headers, rows };
  };

  const processPdfFile = async (file: File): Promise<{ rawText: string }> => {
    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return { rawText: base64 };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    try {
      let result;
      
      if (isPdf) {
        // Process PDF file
        const { rawText } = await processPdfFile(file);
        
        const { data, error: fnError } = await supabase.functions.invoke('parse-inventory-pdf', {
          body: { pdfBase64: rawText, categories },
        });

        if (fnError) throw new Error(fnError.message || 'Failed to process PDF');
        if (data.error) throw new Error(data.error);
        result = data;
      } else {
        // Process Excel/CSV file
        const { headers, rows } = await processExcelFile(file);

        const { data, error: fnError } = await supabase.functions.invoke('parse-inventory-excel', {
          body: { headers, rows, categories },
        });

        if (fnError) throw new Error(fnError.message || 'Failed to process file');
        if (data.error) throw new Error(data.error);
        result = data;
      }

      if (!result.items || result.items.length === 0) {
        throw new Error('No items could be parsed from the file');
      }

      // Mark all items as selected by default
      const itemsWithSelection = result.items.map((item: ParsedItem) => ({
        ...item,
        _selected: !item._error,
      }));

      setParsedItems(itemsWithSelection);
      setStep('preview');
      
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file');
      toast.error(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [categories]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleClose = () => {
    setStep('upload');
    setParsedItems([]);
    setError(null);
    setFileName('');
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep('upload');
    setParsedItems([]);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Import Inventory Items' : `Review Import - ${fileName}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="py-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${isProcessing ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div>
                    <p className="text-lg font-medium">Processing file...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is analyzing and mapping your data
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {isDragActive ? (
                    <Upload className="h-12 w-12 text-primary" />
                  ) : (
                    <div className="flex gap-2">
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Excel (.xlsx, .xls, .csv) or PDF files
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error processing file</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First row should contain column headers</li>
                <li>Common columns: Name, Brand/Model, Serial No., Property Number, Condition, etc.</li>
                <li>AI will automatically map your columns to the correct fields</li>
              </ul>
            </div>
          </div>
        ) : (
          <InventoryImportPreview
            items={parsedItems}
            categories={categories}
            onItemsChange={setParsedItems}
            onBack={handleBack}
            onComplete={() => {
              handleClose();
              onImportComplete();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
