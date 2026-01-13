import { CheckCircle2, X, AlertTriangle } from 'lucide-react';
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

  const successRate = results.total > 0 
    ? Math.round((results.imported / results.total) * 100) 
    : 0;

  return (
    <Alert className={results.errors > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
      <div className="flex items-start gap-3">
        {results.errors > 0 ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
        )}
        <AlertDescription className={results.errors > 0 ? "text-yellow-900" : "text-green-900"}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-3">
                {results.imported}/{results.total} registros importados ({successRate}%)
              </p>
              
              {results.errors > 0 && (
                <div className="text-sm bg-white bg-opacity-50 rounded p-3 mt-2">
                  <p className="font-semibold text-yellow-700 mb-2">⚠️ {results.errors} errores encontrados:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.errorList.map((error: string, i: number) => (
                      <li key={i} className="text-yellow-800 text-xs break-words">
                        {error}
                      </li>
                    ))}
                  </ul>
                  {results.errorList.length < results.errors && (
                    <p className="text-yellow-700 text-xs mt-2 italic">
                      ... y {results.errors - results.errorList.length} errores más
                    </p>
                  )}
                </div>
              )}
              
              {results.imported > 0 && (
                <p className="text-sm mt-2 font-semibold text-green-700">
                  ✓ {results.imported} registros guardados correctamente en la base de datos
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className={results.errors > 0 ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
