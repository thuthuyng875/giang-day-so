import { FileText } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";

interface FileListTableProps {
  includedFiles: string;
  product?: any;
}

export function FileListTable({ includedFiles, product }: FileListTableProps) {
  const { openPaymentModal } = usePayment();
  const files = includedFiles
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-[#94A3B8] border border-dashed border-[#ECECEC] rounded-[14px]">
        Không có thông tin danh sách file.
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[360px] overflow-y-auto pr-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {files.map((file, idx) => {
        const lower = file.toLowerCase();
        let fileType = "FILE";

        if (lower.includes(".ppt") || lower.includes(".pptx")) { fileType = "PPT" }
        else if (lower.includes(".doc") || lower.includes(".docx")) { fileType = "DOCX"; }
        else if (lower.includes(".pdf")) { fileType = "PDF" }
        else if (lower.includes(".zip") || lower.includes(".rar")) { fileType = "ZIP"; }

        return (
          <div key={idx} className="flex items-center justify-between py-2.5 px-2 border-b border-gray-100 last:border-b-0 text-[13px] group hover:bg-gray-50 transition-colors rounded-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 bg-blue-50 text-[#2563EB] rounded flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <span className="text-[7px] font-bold tracking-widest leading-none">
                  {fileType}
                </span>
              </div>
              <span className="font-semibold text-[#0F172A] line-clamp-1" title={file}>
                {file}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (product) openPaymentModal(product);
                }}
                className="text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 p-1.5 rounded transition-colors" 
                title="Tải xuống"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
