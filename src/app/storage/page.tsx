"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, HardDrive, MoreVertical, Search, Trash2, Download, AlertCircle } from 'lucide-react';

// Helper to format bytes
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface StoredFile {
  name: string;
  size: number;
  type: string;
  date: string;
  handle?: FileSystemFileHandle; // OPFS handle
}

export default function StoragePage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize OPFS
  useEffect(() => {
    const initStorage = async () => {
      if (typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage) {
        try {
          const root = await navigator.storage.getDirectory();
          setRootHandle(root);
          await loadFiles(root);
        } catch (err) {
          console.error("OPFS not supported or failed:", err);
        }
      }
      setIsLoading(false);
    };
    initStorage();
  }, []);

  const loadFiles = async (dirHandle: FileSystemDirectoryHandle) => {
    const entries: StoredFile[] = [];
    let size = 0;
    
    try {
      // @ts-ignore - Iterate over directory handle
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          entries.push({
            name: name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            date: new Date(file.lastModified).toLocaleDateString(),
            handle: fileHandle
          });
          size += file.size;
        }
      }
    } catch (e) {
      console.error("Error iterating files:", e);
    }
    
    setFiles(entries.sort((a, b) => a.name.localeCompare(b.name)));
    setTotalSize(size);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!rootHandle || !event.target.files) return;
    
    const fileList = Array.from(event.target.files);
    
    for (const file of fileList) {
      try {
        // Create file in OPFS
        const newFileHandle = await rootHandle.getFileHandle(file.name, { create: true });
        // @ts-ignore - createWritable is standard in OPFS
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      } catch (err) {
        console.error(`Failed to save ${file.name}:`, err);
      }
    }
    
    await loadFiles(rootHandle);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (fileName: string) => {
    if (!rootHandle) return;
    if (confirm(`Permanently delete "${fileName}"? This cannot be undone.`)) {
      try {
        await rootHandle.removeEntry(fileName);
        await loadFiles(rootHandle);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleDownload = async (file: StoredFile) => {
    if (!file.handle) return;
    try {
      const f = await file.handle.getFile();
      const url = URL.createObjectURL(f);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="min-h-screen pt-8 px-6 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Local Storage</h1>
          <p className="text-neutral-500">
            Secure, persistent browser storage. Files stored here do not use your cloud quota.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Local Usage</div>
              <div className="text-xl font-semibold">{formatSize(totalSize)}</div>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full opacity-50" />
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <File className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Total Files</div>
              <div className="text-xl font-semibold">{files.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-sm text-neutral-500 font-medium">
          <div className="col-span-6">Name</div>
          <div className="col-span-3">Size</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {files.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 flex flex-col items-center">
              <HardDrive className="w-12 h-12 mb-4 opacity-20" />
              <p>No files stored locally.</p>
              <p className="text-sm opacity-60 mt-1">Upload game ROMs or assets to use them in emulators.</p>
            </div>
          ) : (
            files.map((file, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                key={file.name} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group"
              >
                <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                  <File className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  <span className="text-sm text-white group-hover:text-blue-400 transition-colors truncate">{file.name}</span>
                </div>
                <div className="col-span-3 text-sm text-neutral-500">{formatSize(file.size)}</div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleDownload(file)}
                    className="p-2 hover:bg-white/10 rounded text-neutral-500 hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(file.name)}
                    className="p-2 hover:bg-red-500/10 rounded text-neutral-500 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
