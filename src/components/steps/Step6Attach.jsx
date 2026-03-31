import { useRef, useState } from 'react'
import { FileText, Upload, X, Video } from 'lucide-react'

const MAX_ATTACHMENTS = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/', 'video/', 'application/pdf', 'text/plain']

export function Step6Attach({ data, update, wizard }) {
  const inputRef = useRef(null)
  const [fileMessage, setFileMessage] = useState('')

  const uploadAcceptedFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          await wizard.uploadAttachment(file, file.type.startsWith('image/') ? e.target.result : null)
          setFileMessage('')
        } catch (error) {
          setFileMessage(error.message || 'Attachment upload failed.')
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = (files) => {
    const currentKeys = new Set(data.attachments.map(file => `${file.name}-${file.bytes}`))
    const validFiles = Array.from(files).filter(file => {
      const isSupported = ACCEPTED_TYPES.some(type => file.type.startsWith(type) || file.type === type)
      if (!isSupported) return false
      if (file.size > MAX_FILE_SIZE) return false
      if (currentKeys.has(`${file.name}-${file.size}`)) return false
      return true
    })

    const availableSlots = Math.max(0, MAX_ATTACHMENTS - data.attachments.length)
    const accepted = validFiles.slice(0, availableSlots)

    if (validFiles.length !== files.length || accepted.length !== validFiles.length) {
      setFileMessage(`Only unique images, videos, PDFs, and text logs up to 10 MB are accepted. Maximum ${MAX_ATTACHMENTS} files.`)
    } else {
      setFileMessage('')
    }

    uploadAcceptedFiles(accepted)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeAttachment = (id) => {
    update({ attachments: data.attachments.filter(a => a.id !== id) })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Attach evidence</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Add screenshots, recordings, PDFs, or logs to make the issue easier to reproduce. This step is optional.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload supporting evidence"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onPaste={(e) => {
          const items = Array.from(e.clipboardData?.items ?? [])
          const pastedFiles = items
            .filter(item => item.kind === 'file')
            .map((item, index) => {
              const blob = item.getAsFile()
              if (!blob) return null
              const extension = blob.type.split('/')[1] || 'png'
              return new File([blob], blob.name || `pasted-screenshot-${Date.now()}-${index}.${extension}`, {
                type: blob.type || 'image/png',
              })
            })
            .filter(Boolean)

          if (pastedFiles.length > 0) {
            e.preventDefault()
            handleFiles(pastedFiles)
          }
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 transition-colors hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Upload size={32} className="text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Drop files here, click to browse, or paste a screenshot</p>
          <p className="mt-1 text-xs text-gray-400">Images, videos, PDFs, TXT, and LOG files up to 10 MB each. You can also press Cmd/Ctrl+V.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.txt,.log"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {fileMessage && (
        <div role="alert" className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {fileMessage}
        </div>
      )}

      {data.attachments.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.attachments.map(file => (
            <div key={file.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {file.url ? (
                <img src={file.url} alt={file.name} className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 w-full items-center justify-center bg-gray-100 text-gray-500">
                  {file.type?.startsWith('video/') ? <Video size={22} /> : <FileText size={22} />}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => removeAttachment(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="rounded-full bg-white p-1 text-gray-700 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="bg-white px-3 py-2">
                <p className="truncate text-xs text-gray-600">{file.name}</p>
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
