import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Globe, 
  Check, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  Eye,
  Edit,
  Download
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";
import { cn } from "@/lib/utils";

const API_BASE = 'http://localhost:3001/api';

type Step = 'origen' | 'cargar' | 'detectar' | 'mapear' | 'preview' | 'confirmar' | 'resultado';

interface FieldMapping {
  [key: string]: string;
}

interface ImportResult {
  total: number;
  imported: number;
  errors: number;
  errorDetails: Array<{ row: number; error: string }>;
}

export function ImportarWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('origen');
  const [importType, setImportType] = useState<'archivo' | 'url'>('archivo');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Datos del archivo procesado
  const [fileData, setFileData] = useState<any>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const steps = [
    { id: 'origen', label: 'Origen' },
    { id: 'cargar', label: 'Cargar' },
    { id: 'detectar', label: 'Detectar' },
    { id: 'mapear', label: 'Mapear' },
    { id: 'preview', label: 'Vista previa' },
    { id: 'confirmar', label: 'Confirmar' },
    { id: 'resultado', label: 'Resultado' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const ext = '.' + selectedFile.name.split('.').pop();
      
      if (!validTypes.includes(ext)) {
        setUploadError('Solo se permiten archivos .xlsx, .xls y .csv');
        return;
      }
      
      setFile(selectedFile);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (importType === 'archivo' && !file) {
      setUploadError('Por favor seleccione un archivo');
      return;
    }

    if (importType === 'url' && !url) {
      setUploadError('Por favor ingrese una URL');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      let endpoint = '';
      let body = {};

      if (importType === 'archivo') {
        const formData = new FormData();
        formData.append('file', file!);
        endpoint = `${API_BASE}/import/upload`;
        body = formData;
      } else {
        endpoint = `${API_BASE}/import/url`;
        body = JSON.stringify({ url });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: importType === 'archivo' ? formData as any : body,
        headers: importType === 'url' ? { 'Content-Type': 'application/json' } : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar archivo');
      }

      const data = await response.json();
      setFileData(data);
      setFieldMapping(data.fieldMapping);
      setPreviewData(data.preview);
      setCurrentStep('detectar');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al procesar archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleMappingChange = (field: string, excelColumn: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: excelColumn
    }));
  };

  const handleConfirmImport = async () => {
    setUploading(true);
    try {
      const response = await fetch(`${API_BASE}/import/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: fileData.preview, // Enviar todos los datos, no solo preview
          fieldMapping,
          fuente: importType === 'archivo' ? 'EXCEL' : 'URL',
          archivoOriginal: file?.name,
          urlOriginal: importType === 'url' ? url : undefined,
          createdBy: 'Usuario'
        })
      });

      if (!response.ok) throw new Error('Error al confirmar importación');

      const result = await response.json();
      setImportResult(result);
      setCurrentStep('resultado');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al confirmar importación');
    } finally {
      setUploading(false);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as Step);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as Step);
    }
  };

  const resetWizard = () => {
    setCurrentStep('origen');
    setFile(null);
    setUrl('');
    setFileData(null);
    setFieldMapping({});
    setPreviewData([]);
    setImportResult(null);
    setUploadError('');
  };

  return (
    <MonitoreoShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/monitoreo/nuevo")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Importar Eventos</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Importe eventos desde Excel, CSV o URL con mapeo automático de campos
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center flex-1">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        isCompleted ? "bg-[#00A94F] text-white" : 
                        isCurrent ? "bg-[#00A94F] text-white" : 
                        "bg-surface text-ink-quiet"
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span 
                      className={cn(
                        "ml-2 text-xs font-medium",
                        isCurrent ? "text-ink" : "text-ink-quiet"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={cn(
                        "w-16 h-0.5 mx-2",
                        isCompleted ? "bg-[#00A94F]" : "bg-line"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 'origen' && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">Seleccione el origen de la importación</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className={cn(
                    "p-6 cursor-pointer border-2 transition-all",
                    importType === 'archivo' ? "border-[#00A94F] bg-[#00A94F]/5" : "border-line hover:border-[#00A94F]/50"
                  )}
                  onClick={() => setImportType('archivo')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">Archivo Excel/CSV</h3>
                      <p className="text-sm text-ink-quiet mt-1">Suba un archivo desde su computadora</p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className={cn(
                    "p-6 cursor-pointer border-2 transition-all",
                    importType === 'url' ? "border-[#00A94F] bg-[#00A94F]/5" : "border-line hover:border-[#00A94F]/50"
                  )}
                  onClick={() => setImportType('url')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">URL</h3>
                      <p className="text-sm text-ink-quiet mt-1">Importe desde una URL pública</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setCurrentStep('cargar')} className="bg-[#00A94F] hover:bg-[#008F42]">
                  Continuar <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'cargar' && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">
                {importType === 'archivo' ? 'Cargar archivo' : 'Ingresar URL'}
              </h2>

              {importType === 'archivo' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-line rounded-lg p-8 text-center hover:border-[#00A94F] transition-colors">
                    <Upload className="w-12 h-12 text-ink-quiet mx-auto mb-4" />
                    <p className="text-ink mb-2">Arrastra tu archivo aquí o</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer text-[#00A94F] font-medium hover:underline">
                      haz clic para seleccionar
                    </label>
                    <p className="text-xs text-ink-quiet mt-2">Formatos aceptados: .xlsx, .xls, .csv (máx. 10MB)</p>
                  </div>

                  {file && (
                    <Card className="p-4 bg-surface">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-ink">{file.name}</p>
                            <p className="text-xs text-ink-quiet">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="URL del archivo">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/archivo.xlsx"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </Field>
                  <p className="text-xs text-ink-quiet">
                    La URL debe ser accesible públicamente. Si requiere autenticación, el sistema no podrá acceder al archivo.
                  </p>
                </div>
              )}

              {uploadError && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{uploadError}</p>
                  </div>
                </Card>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button 
                  onClick={handleUpload} 
                  className="bg-[#00A94F] hover:bg-[#008F42]"
                  disabled={uploading || (importType === 'archivo' && !file) || (importType === 'url' && !url)}
                >
                  {uploading ? 'Procesando...' : 'Procesar archivo'}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'detectar' && fileData && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">Columnas detectadas</h2>

              <div className="space-y-4">
                <Card className="p-4 bg-surface">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{fileData.fileName}</p>
                      <p className="text-xs text-ink-quiet">{fileData.totalRecords} registros detectados</p>
                    </div>
                    <Check className="w-5 h-5 text-[#00A94F]" />
                  </div>
                </Card>

                <div>
                  <p className="text-sm font-medium text-ink mb-2">Encabezados encontrados:</p>
                  <div className="flex flex-wrap gap-2">
                    {fileData.headers.map((header: string) => (
                      <span key={header} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-ink mb-2">Campos mapeados automáticamente:</p>
                  <div className="space-y-2">
                    {Object.entries(fieldMapping).map(([field, excelColumn]) => (
                      <div key={field} className="flex items-center justify-between text-sm">
                        <span className="text-ink-quiet">{field}</span>
                        <span className="text-[#00A94F] font-medium">{excelColumn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button onClick={nextStep} className="bg-[#00A94F] hover:bg-[#008F42]">
                  Revisar mapeo <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'mapear' && fileData && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">Mapeo de campos</h2>

              <div className="space-y-4">
                <p className="text-sm text-ink-quiet">
                  Verifique y corrija el mapeo de columnas. Seleccione la columna de Excel que corresponde a cada campo.
                </p>

                <div className="space-y-3">
                  <Field label="Fecha">
                    <Select 
                      value={fieldMapping.fecha || ''} 
                      onChange={(e) => handleMappingChange('fecha', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Hora de evento">
                    <Select 
                      value={fieldMapping.horaEvento || ''} 
                      onChange={(e) => handleMappingChange('horaEvento', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Tipo de incidente">
                    <Select 
                      value={fieldMapping.tipoIncidente || ''} 
                      onChange={(e) => handleMappingChange('tipoIncidente', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Descripción">
                    <Select 
                      value={fieldMapping.descripcion || ''} 
                      onChange={(e) => handleMappingChange('descripcion', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Ubicación">
                    <Select 
                      value={fieldMapping.ubicacion || ''} 
                      onChange={(e) => handleMappingChange('ubicacion', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Lugar de incidente">
                    <Select 
                      value={fieldMapping.lugarIncidente || ''} 
                      onChange={(e) => handleMappingChange('lugarIncidente', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Tipo de causa">
                    <Select 
                      value={fieldMapping.tipoCausa || ''} 
                      onChange={(e) => handleMappingChange('tipoCausa', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Cámara monitoreada">
                    <Select 
                      value={fieldMapping.camaraMonitoreada || ''} 
                      onChange={(e) => handleMappingChange('camaraMonitoreada', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Demora">
                    <Select 
                      value={fieldMapping.demora || ''} 
                      onChange={(e) => handleMappingChange('demora', e.target.value)}
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {fileData.headers.map((header: string) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button onClick={nextStep} className="bg-[#00A94F] hover:bg-[#008F42]">
                  Vista previa <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'preview' && fileData && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">Vista previa de datos</h2>

              <div className="space-y-4">
                <Card className="p-4 bg-surface">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">Total de registros: {fileData.totalRecords}</p>
                      <p className="text-xs text-ink-quiet">Mostrando primeros 5 registros</p>
                    </div>
                    <Eye className="w-5 h-5 text-[#00A94F]" />
                  </div>
                </Card>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="text-left px-3 py-2 font-medium text-ink-quiet text-xs uppercase">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b border-line">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-ink">
                              {value || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-ink-quiet">
                  Los campos derivados (año, mes, semana, día, rango horario) se calcularán automáticamente durante la importación.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button onClick={nextStep} className="bg-[#00A94F] hover:bg-[#008F42]">
                  Confirmar importación <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'confirmar' && (
            <Card className="p-8">
              <h2 className="text-[18px] font-semibold text-ink mb-6">Confirmar importación</h2>

              <div className="space-y-4">
                <Card className="p-4 bg-surface">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-quiet">Archivo:</span>
                      <span className="text-ink font-medium">{fileData?.fileName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-quiet">Total de registros:</span>
                      <span className="text-ink font-medium">{fileData?.totalRecords}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-quiet">Campos mapeados:</span>
                      <span className="text-ink font-medium">{Object.keys(fieldMapping).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-quiet">Fuente:</span>
                      <span className="text-ink font-medium">{importType === 'archivo' ? 'Excel/CSV' : 'URL'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Importación irreversible</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Una vez confirmada, los registros se guardarán en la base de datos. 
                        Asegúrese de que el mapeo sea correcto antes de continuar.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button 
                  onClick={handleConfirmImport} 
                  className="bg-[#00A94F] hover:bg-[#008F42]"
                  disabled={uploading}
                >
                  {uploading ? 'Importando...' : 'Confirmar y guardar'}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'resultado' && importResult && (
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#00A94F]/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#00A94F]" />
                </div>
                <h2 className="text-[22px] font-bold text-ink">Importación completada</h2>
                <p className="text-ink-quiet mt-1">Los registros han sido procesados exitosamente</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center bg-surface">
                  <p className="text-2xl font-bold text-ink">{importResult.total}</p>
                  <p className="text-xs text-ink-quiet uppercase tracking-wider">Total</p>
                </Card>
                <Card className="p-4 text-center bg-green-50 border-green-200">
                  <p className="text-2xl font-bold text-green-700">{importResult.imported}</p>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Importados</p>
                </Card>
                <Card className="p-4 text-center bg-red-50 border-red-200">
                  <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                  <p className="text-xs text-red-600 uppercase tracking-wider">Errores</p>
                </Card>
              </div>

              {importResult.errorDetails.length > 0 && (
                <Card className="p-4 bg-surface mb-6">
                  <h3 className="text-sm font-medium text-ink mb-3">Detalles de errores</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.errorDetails.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-ink-quiet">Fila {error.row}:</span>
                        <span className="text-red-600">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={resetWizard}>
                  Importar otro archivo
                </Button>
                <Button onClick={() => navigate("/monitoreo")} className="bg-[#00A94F] hover:bg-[#008F42]">
                  Ver eventos importados
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MonitoreoShell>
  );
}
