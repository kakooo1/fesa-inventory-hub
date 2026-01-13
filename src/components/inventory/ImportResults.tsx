import { CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ImportResultsProps {
  results: {
    imported: number;
    total: number;
    errors: number;
    errorList: string[];
  } | null;
  onClear: () => void;
}

export function ImportResults({ results, onClear }: ImportResultsProps) {
  if (!results) return null;

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-900">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <p className="font-semibold mb-2">
              ✓ {results.imported}/{results.total} registros importados
            </p>
            {results.errors > 0 && (
              <div className="text-sm">
                <p className="font-semibold text-orange-600 mb-2">⚠ {results.errors} errores:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {results.errorList.map((error: string, i: number) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-green-600 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
