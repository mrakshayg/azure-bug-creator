import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

export function Step6Attach({ data, update }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const current = [...data.attachments]
    Array.from(files).slice(0, 5 - current.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        update({
          attachments: [...current, {
            id: crypto.randomUUID(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            url: e.target.result,
          }]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeAttachment = (id) => {
    update({ attachments: data.attachments.filter(a => a.id !== id) })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Attach Screenshots</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload screenshots or screen recordings to help reproduce the bug. (Optional — max 5 files)
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Upload size={32} className="text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP up to 5 files</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {data.attachments.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {data.attachments.map(file => (
            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="rounded-full bg-white p-1 text-gray-700 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="px-2 py-1 bg-white">
                <p className="text-xs text-gray-600 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.attachments.length === 0 && (
        <p className="text-center text-sm text-gray-400">No screenshots yet. You can skip this step.</p>
      )}
    </div>
  )
}
