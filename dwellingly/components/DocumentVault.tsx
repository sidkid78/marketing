import React from 'react';
import { Transaction, Document, DocStatus } from '../types';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import { FileText, Upload, Download, Eye, Share2, Info } from 'lucide-react';

interface DocumentVaultProps {
  transaction: Transaction;
  onUpload: (docId: string) => void;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ transaction, onUpload }) => {
  const getStatusVariant = (status: DocStatus) => {
    switch (status) {
      case DocStatus.UPLOADED: return 'success';
      case DocStatus.MISSING: return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Vault</h2>
          <p className="text-slate-500">Secure storage for all required transaction paperwork.</p>
        </div>
        <Button variant="secondary">
          <Share2 className="w-4 h-4 mr-2" />
          Share Buyer Packet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Upload Zone */}
         <div className="md:col-span-3 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900">Drag & Drop new files here</p>
            <p className="text-sm text-slate-500 mt-1">Supports PDF, DOCX, JPG (Max 20MB)</p>
         </div>

         {/* Document List */}
         <div className="md:col-span-3 space-y-4">
            {transaction.documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        {doc.name}
                        {doc.description && (
                          <div className="group relative">
                             <Info className="w-4 h-4 text-slate-400 cursor-help" />
                             <div className="absolute left-0 bottom-6 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {doc.description}
                             </div>
                          </div>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                        {doc.milestoneTag && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">{doc.milestoneTag}</span>
                        )}
                        {doc.version && (
                          <span className="text-xs text-slate-400">v{doc.version}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === DocStatus.MISSING ? (
                      <Button size="sm" onClick={() => onUpload(doc.id)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline">
                           <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                           <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
         </div>
      </div>
    </div>
  );
};

export default DocumentVault;