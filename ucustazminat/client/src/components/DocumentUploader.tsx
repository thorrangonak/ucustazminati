import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  CheckCircle, 
  FileText, 
  CreditCard, 
  Ticket, 
  Mail,
  User,
  BookOpen,
  X,
  Eye,
  Trash2,
  AlertCircle,
  Info
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Document {
  id?: number;
  type: string;
  fileName: string;
  fileUrl?: string;
  file?: File;
  uploadedAt?: Date;
}

// Mevcut claim için kullanım
interface ExistingClaimProps {
  mode: "existing";
  claimId: number;
  existingDocuments: Document[];
  onDocumentChange: () => void;
}

// Yeni claim oluşturma için kullanım
interface NewClaimProps {
  mode?: "new";
  onDocumentsChange: (documents: Document[], isValid: boolean) => void;
}

type DocumentUploaderProps = ExistingClaimProps | NewClaimProps;

// Belge kategorileri
const FLIGHT_DOCUMENTS = [
  { type: "boarding_pass", label: "Biniş Kartı", icon: Ticket, description: "Uçuş için aldığınız biniş kartı" },
  { type: "booking_confirmation", label: "Konfirmasyon Mektubu", icon: Mail, description: "Havayolundan gelen rezervasyon onayı" },
  { type: "ticket", label: "Bilet", icon: FileText, description: "E-bilet veya basılı bilet" },
];

const ID_DOCUMENTS = [
  { type: "id_card", label: "Kimlik Kartı", icon: CreditCard, description: "TC Kimlik Kartı (ön ve arka yüz)" },
  { type: "passport", label: "Pasaport", icon: BookOpen, description: "Pasaport kimlik sayfası" },
];

export default function DocumentUploader(props: DocumentUploaderProps) {
  const isExistingMode = props.mode === "existing";
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  
  // Yeni claim modu için local state
  const [localDocuments, setLocalDocuments] = useState<Document[]>([]);
  
  // Mevcut claim modu için
  const uploadMutation = isExistingMode ? trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Belge başarıyla yüklendi");
      if (isExistingMode) {
        (props as ExistingClaimProps).onDocumentChange();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Belge yüklenirken bir hata oluştu");
    },
  }) : null;
  
  const deleteMutation = isExistingMode ? trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Belge silindi");
      if (isExistingMode) {
        (props as ExistingClaimProps).onDocumentChange();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Belge silinirken bir hata oluştu");
    },
  }) : null;
  
  // Belgeleri al (moda göre)
  const documents = isExistingMode 
    ? (props as ExistingClaimProps).existingDocuments 
    : localDocuments;
  
  // Validasyon kontrolü
  const checkValidity = useCallback((docs: Document[]) => {
    const hasFlightDoc = FLIGHT_DOCUMENTS.some(fd => 
      docs.some(d => d.type === fd.type)
    );
    const hasIdDoc = ID_DOCUMENTS.some(id => 
      docs.some(d => d.type === id.type)
    );
    return hasFlightDoc && hasIdDoc;
  }, []);
  
  // Yeni claim modunda belge değişikliğini bildir
  const notifyChange = useCallback((docs: Document[]) => {
    if (!isExistingMode) {
      const isValid = checkValidity(docs);
      (props as NewClaimProps).onDocumentsChange(docs, isValid);
    }
  }, [isExistingMode, props, checkValidity]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;
    
    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }
    
    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece JPG, PNG, WebP ve PDF dosyaları yüklenebilir");
      return;
    }
    
    if (isExistingMode) {
      // Mevcut claim modunda sunucuya yükle
      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        // Base64'ten data kısmını ayıkla
        const base64Data = base64.split(',')[1] || base64;
        const mimeType = file.type;
        
        uploadMutation?.mutate({
          claimId: (props as ExistingClaimProps).claimId,
          type: selectedType as any,
          fileName: file.name,
          fileData: base64Data,
          mimeType: mimeType,
        });
      } catch (error) {
        toast.error("Dosya okunamadı");
      } finally {
        setUploading(false);
        setSelectedType("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      // Yeni claim modunda local state'e ekle
      const newDoc: Document = {
        type: selectedType,
        fileName: file.name,
        file: file,
      };
      
      const updatedDocs = [...localDocuments, newDoc];
      setLocalDocuments(updatedDocs);
      notifyChange(updatedDocs);
      
      setSelectedType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Belge eklendi");
    }
  };
  
  const handleDelete = (doc: Document, index?: number) => {
    if (isExistingMode && doc.id) {
      deleteMutation?.mutate({ id: doc.id });
    } else if (!isExistingMode && index !== undefined) {
      const updatedDocs = localDocuments.filter((_, i) => i !== index);
      setLocalDocuments(updatedDocs);
      notifyChange(updatedDocs);
      toast.success("Belge kaldırıldı");
    }
  };
  
  const triggerFileInput = (type: string) => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };
  
  // Kategori bazlı yükleme durumu
  const hasFlightDocument = FLIGHT_DOCUMENTS.some(fd => 
    documents.some(d => d.type === fd.type)
  );
  const hasIdDocument = ID_DOCUMENTS.some(id => 
    documents.some(d => d.type === id.type)
  );
  
  const getDocumentsByType = (type: string) => {
    return documents.filter(d => d.type === type);
  };
  
  return (
    <div className="space-y-6">
      {/* Bilgi Kutusu */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800">Belge Gereksinimleri</div>
            <p className="text-sm text-blue-700 mt-1">
              Her kategoriden <strong>en az bir belge</strong> yüklemeniz gerekmektedir. 
              İsterseniz tüm belgeleri ayrı ayrı da yükleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
      
      {/* Uçuş Belgeleri */}
      <Card className={`border-2 ${hasFlightDocument ? 'border-green-500/50 bg-green-50/30' : 'border-foreground/10'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Uçuş Belgeleri
              {hasFlightDocument && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Yüklendi
                </Badge>
              )}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Aşağıdaki belgelerden <strong>en az birini</strong> yükleyin
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {FLIGHT_DOCUMENTS.map((docType) => {
              const uploadedDocs = getDocumentsByType(docType.type);
              const Icon = docType.icon;
              
              return (
                <div 
                  key={docType.type}
                  className={`p-4 border rounded-lg transition-colors ${
                    uploadedDocs.length > 0 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        uploadedDocs.length > 0 ? 'bg-green-100' : 'bg-secondary'
                      }`}>
                        <Icon className={`w-5 h-5 ${uploadedDocs.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {docType.label}
                          {uploadedDocs.length > 0 && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{docType.description}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerFileInput(docType.type)}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {uploadedDocs.length > 0 ? 'Ekle' : 'Yükle'}
                    </Button>
                  </div>
                  
                  {/* Yüklenen belgeler */}
                  {uploadedDocs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedDocs.map((doc, index) => (
                        <div 
                          key={doc.id || index}
                          className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="truncate max-w-[200px]">{doc.fileName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.fileUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc, isExistingMode ? undefined : localDocuments.indexOf(doc))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Kimlik Belgeleri */}
      <Card className={`border-2 ${hasIdDocument ? 'border-green-500/50 bg-green-50/30' : 'border-foreground/10'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Kimlik Belgeleri
              {hasIdDocument && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Yüklendi
                </Badge>
              )}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Aşağıdaki belgelerden <strong>en az birini</strong> yükleyin
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {ID_DOCUMENTS.map((docType) => {
              const uploadedDocs = getDocumentsByType(docType.type);
              const Icon = docType.icon;
              
              return (
                <div 
                  key={docType.type}
                  className={`p-4 border rounded-lg transition-colors ${
                    uploadedDocs.length > 0 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        uploadedDocs.length > 0 ? 'bg-green-100' : 'bg-secondary'
                      }`}>
                        <Icon className={`w-5 h-5 ${uploadedDocs.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {docType.label}
                          {uploadedDocs.length > 0 && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{docType.description}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerFileInput(docType.type)}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {uploadedDocs.length > 0 ? 'Ekle' : 'Yükle'}
                    </Button>
                  </div>
                  
                  {/* Yüklenen belgeler */}
                  {uploadedDocs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedDocs.map((doc, index) => (
                        <div 
                          key={doc.id || index}
                          className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="truncate max-w-[200px]">{doc.fileName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.fileUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc, isExistingMode ? undefined : localDocuments.indexOf(doc))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Durum Özeti */}
      <div className={`p-4 rounded-lg border-2 ${
        hasFlightDocument && hasIdDocument 
          ? 'bg-green-50 border-green-300' 
          : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {hasFlightDocument && hasIdDocument ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Tüm gerekli belgeler yüklendi</div>
                <p className="text-sm text-green-700">Devam edebilirsiniz.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">Eksik belgeler var</div>
                <p className="text-sm text-amber-700">
                  {!hasFlightDocument && "Uçuş belgelerinden en az birini yükleyin. "}
                  {!hasIdDocument && "Kimlik belgelerinden en az birini yükleyin."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
      />
    </div>
  );
}

// Helper function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
