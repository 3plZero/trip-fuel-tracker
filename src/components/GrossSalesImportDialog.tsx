import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MonthlyDetail, emptyMonthlyDetail } from './GrossSalesMonthlyDetails';

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface ImportedGrossSalesData {
  email?: string;
  mobile_number?: string;
  year?: number;
  monthlySales: Record<string, number>;
  monthlyDetails: Record<string, MonthlyDetail>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportedGrossSalesData) => void;
}

interface SheetData {
  sheetName: string;
  data: ImportedGrossSalesData;
}

export default function GrossSalesImportDialog({ open, onOpenChange, onImport }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  function parseSheet(worksheet: XLSX.WorkSheet): ImportedGrossSalesData | null {
    const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    let email = '';
    let mobile = '';
    let year: number | undefined;
    const monthlySales: Record<string, number> = {};
    const monthlyDetails: Record<string, MonthlyDetail> = {};
    MONTH_KEYS.forEach(k => { monthlySales[k] = 0; monthlyDetails[k] = { ...emptyMonthlyDetail }; });

    for (const row of raw) {
      const firstCell = String(row[0] || '').trim();
      
      // Extract email
      if (firstCell.toLowerCase().includes('email')) {
        const emailVal = String(row[1] || row[0] || '').replace(/email\s*address:?\s*/i, '').trim();
        if (emailVal && emailVal.includes('@')) email = emailVal;
      }
      
      // Extract mobile
      if (firstCell.toLowerCase().includes('mobile')) {
        const mobVal = String(row[1] || '').trim();
        if (mobVal) mobile = mobVal;
      }
      
      // Extract year (standalone number like 2025, 2026)
      if (/^\d{4}$/.test(firstCell) && !year) {
        year = parseInt(firstCell);
      }
      
      // Extract monthly data
      const monthIdx = MONTH_NAMES.findIndex(m => firstCell.toLowerCase() === m.toLowerCase());
      if (monthIdx >= 0) {
        const key = MONTH_KEYS[monthIdx];
        const grossSales = parseFloat(String(row[1] || '0').replace(/,/g, '')) || 0;
        monthlySales[key] = grossSales;
        
        const products = String(row[2] || '').trim();
        const prodVolume = String(row[3] || '').trim();
        const ewM = parseInt(String(row[4] || '0')) || 0;
        const ewF = parseInt(String(row[5] || '0')) || 0;
        const nwM = parseInt(String(row[6] || '0')) || 0;
        const nwF = parseInt(String(row[7] || '0')) || 0;
        const moM = parseInt(String(row[8] || '0')) || 0;
        const moF = parseInt(String(row[9] || '0')) || 0;
        const rsM = parseInt(String(row[10] || '0')) || 0;
        const rsF = parseInt(String(row[11] || '0')) || 0;
        const status = String(row[12] || '').trim();
        
        monthlyDetails[key] = {
          products,
          production_volume: prodVolume,
          existing_workers_male: ewM,
          existing_workers_female: ewF,
          new_workers_male: nwM,
          new_workers_female: nwF,
          market_outlets_male: moM,
          market_outlets_female: moF,
          raw_material_suppliers_male: rsM,
          raw_material_suppliers_female: rsF,
          business_status: status,
        };
      }
    }

    const hasAnyData = Object.values(monthlySales).some(v => v > 0);
    if (!hasAnyData) return null;

    return { email, mobile_number: mobile, year, monthlySales, monthlyDetails };
  }

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSheets([]);
    setSelectedSheet('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const parsed: SheetData[] = [];
      for (const name of workbook.SheetNames) {
        const result = parseSheet(workbook.Sheets[name]);
        if (result) {
          parsed.push({ sheetName: name, data: result });
        }
      }

      if (parsed.length === 0) {
        throw new Error('No valid gross sales data found in any sheet. Expected monthly rows (January-December) with gross sales in column B.');
      }

      setSheets(parsed);
      if (parsed.length === 1) {
        setSelectedSheet(parsed[0].sheetName);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) processFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleImport = () => {
    const sheet = sheets.find(s => s.sheetName === selectedSheet);
    if (sheet) {
      onImport(sheet.data);
      handleClose();
    }
  };

  const handleClose = () => {
    setSheets([]);
    setSelectedSheet('');
    setError(null);
    onOpenChange(false);
  };

  const selected = sheets.find(s => s.sheetName === selectedSheet);
  const totalSales = selected ? Object.values(selected.data.monthlySales).reduce((a, b) => a + b, 0) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import from Excel</DialogTitle>
        </DialogHeader>

        {sheets.length === 0 ? (
          <div className="py-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm">Processing file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{isDragActive ? 'Drop here' : 'Drag & drop Excel file'}</p>
                    <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, or .csv</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Expected format:</p>
              <p>• Monthly rows: January–December in column A</p>
              <p>• Gross Sales in column B</p>
              <p>• Products, Production Volume, Workers, Outlets, Suppliers in subsequent columns</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sheets.length > 1 && (
              <div className="space-y-2">
                <Label>Select Sheet ({sheets.length} sheets with data)</Label>
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger><SelectValue placeholder="Choose a sheet" /></SelectTrigger>
                  <SelectContent>
                    {sheets.map(s => (
                      <SelectItem key={s.sheetName} value={s.sheetName}>{s.sheetName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selected && (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {selected.data.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">Email</Badge> {selected.data.email}
                    </div>
                  )}
                  {selected.data.mobile_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">Mobile</Badge> {selected.data.mobile_number}
                    </div>
                  )}
                  {selected.data.year && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">Year</Badge> {selected.data.year}
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Sales</th>
                          <th className="text-left p-2">Products</th>
                          <th className="text-center p-2">Workers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTH_KEYS.map((k, i) => {
                          const sales = selected.data.monthlySales[k];
                          const d = selected.data.monthlyDetails[k];
                          const totalWorkers = (d.existing_workers_male + d.existing_workers_female);
                          return (
                            <tr key={k} className="border-t">
                              <td className="p-2">{MONTH_NAMES[i]}</td>
                              <td className="p-2 text-right">{sales ? `₱${sales.toLocaleString()}` : '-'}</td>
                              <td className="p-2 text-xs truncate max-w-[120px]">{d.products || '-'}</td>
                              <td className="p-2 text-center">{totalWorkers > 0 ? totalWorkers : '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted font-semibold">
                        <tr>
                          <td className="p-2">Total</td>
                          <td className="p-2 text-right">₱{totalSales.toLocaleString()}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleImport} disabled={!selectedSheet} className="gap-2">
                <Check className="h-4 w-4" /> Import Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
