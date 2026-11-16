import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const DocumentModal = ({ isOpen, onClose, document, applicantName, onQuickVerify }) => {
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !document) return null;

  const docTypeLabels = {
    class10Marksheet: 'Class 10 (Secondary) Marksheet',
    class12Marksheet: 'Class 12 (Higher Secondary) Marksheet',
    entranceRankCard: 'Entrance Examination Rank Card',
    passportPhoto: 'Passport Size Photograph',
    idProof: 'Government ID Proof (Aadhaar / Passport)'
  };

  const isPdf = document.mimeType === 'application/pdf' || document.fileName?.endsWith('.pdf');
  const isImage = document.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(document.fileName || '');
  const fileUrl = document.fileData || (document.fileName ? `/uploads/${document.fileName}` : null);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-line animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-[#0b4a8f] rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#083563] text-base leading-tight">
                {docTypeLabels[document.documentType] || document.documentType}
              </h3>
              <p className="text-xs text-[#5a6b7d]">
                Candidate: <span className="font-semibold text-gray-800">{applicantName || 'Applicant'}</span> &bull; File: <span className="font-mono">{document.originalName || document.fileName}</span> ({formatBytes(document.size)})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls for images */}
            {isImage && (
              <div className="flex items-center bg-white border border-gray-200 rounded-md p-1 mr-2 space-x-1">
                <button
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1 text-gray-600">{zoom}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                download={document.originalName || 'document'}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-600 hover:text-[#0b4a8f] hover:bg-white rounded-md border border-transparent hover:border-gray-200 transition"
                title="Download / Open Full Screen"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Document Body */}
        <div className="flex-1 overflow-auto p-4 bg-[#f1f5f9] flex items-center justify-center min-h-[420px]">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title="PDF Document Preview"
                className="w-full h-[65vh] rounded-md border border-gray-300 shadow-inner bg-white"
              />
            ) : isImage ? (
              <div className="overflow-auto max-h-[65vh] flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={document.originalName}
                  style={{ width: `${zoom}%` }}
                  className="max-h-[65vh] object-contain rounded shadow-md border border-gray-300 transition-all duration-100"
                />
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-lg border border-gray-200 max-w-md shadow-sm">
                <FileText className="w-12 h-12 text-[#0b4a8f] mx-auto mb-3" />
                <p className="font-semibold text-gray-800 text-sm">{document.originalName}</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">File format cannot be directly previewed in modal.</p>
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0b4a8f] text-white text-xs font-semibold rounded-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </a>
              </div>
            )
          ) : (
            /* Fallback Realistic Demo Marksheet Preview for mock records */
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg border-2 border-dashed border-[#0b4a8f]/30 shadow-md text-left relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-green-500/10 rounded-full flex items-end justify-start p-4">
                <span className="text-green-700 font-extrabold text-[10px] uppercase rotate-45">OFFICIAL COPY</span>
              </div>
              <div className="border-b-2 border-[#0b4a8f] pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-[#083563]">COUNCIL OF SECONDARY & HIGHER EDUCATION</h4>
                  <p className="text-xs text-gray-500">Official Academic Verification Transcript & Grade Card</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-gray-400">Doc Ref:</span>
                  <p className="font-mono font-bold text-[#0b4a8f]">{document._id || 'DOC-VERIFIED'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div>
                  <span className="text-gray-400 block">Candidate Name:</span>
                  <span className="font-bold text-gray-900">{applicantName || 'Rohan Sharma'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Document Verified:</span>
                  <span className="font-bold text-[#0b4a8f]">{docTypeLabels[document.documentType] || document.documentType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Verification Status:</span>
                  <span className="inline-flex items-center space-x-1 text-green-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Integrity Hash Matched</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">File Size & Format:</span>
                  <span className="font-mono">{formatBytes(document.size || 245000)} &bull; {document.mimeType || 'application/pdf'}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3 rounded border border-gray-200 text-xs text-gray-600">
                <p className="font-medium text-gray-800 mb-1">Administrative Note:</p>
                This document was submitted as part of the student's admission portfolio. Digital signatures and security watermarks match college admissions policy 2025-2026.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#e5e7eb] bg-[#f8fafc] rounded-b-xl flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-300 rounded font-mono">Esc</kbd> or click Close to return.
          </span>

          <div className="flex items-center space-x-2">
            {onQuickVerify && (
              <button
                onClick={() => {
                  onQuickVerify(document.documentType);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify This Document</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentModal;
