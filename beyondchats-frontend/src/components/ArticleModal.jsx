import { useState } from "react";
import Tabs from "./Tabs";

export default function ArticleModal({ open, onClose, original, updated }) {
  const [activeTab, setActiveTab] = useState("original");

  if (!open) return null;

  const content =
    activeTab === "original"
      ? original?.content
      : updated?.content || "Updated version not available.";

  const referenceUrls =
    activeTab === "updated" && updated?.source_url
      ? JSON.parse(updated.source_url)
      : original?.source_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Modal Box */}
      <div className="relative bg-[#1f1f1f] text-white w-[90%] max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#1f1f1f] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{original.title}</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <Tabs active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto text-sm leading-relaxed whitespace-pre-line">
          {content}
        </div>

        {activeTab === "updated" && referenceUrls.length > 0 && (
          <div className="mt-8 border-t border-gray-700 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              References
            </h3>

            <div className="flex flex-col gap-2">
              {referenceUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
        {activeTab === "original" && original?.source_url !== null && (
          <div className="mt-8 border-t border-gray-700 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Source
            </h3>

            <div className="flex flex-col gap-2">
                <a
                  href={referenceUrls}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  {referenceUrls}
                </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
