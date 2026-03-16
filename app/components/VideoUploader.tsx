'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function VideoUploader({ onUploadComplete }: { 
  onUploadComplete?: (video: any) => void 
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um arquivo de vídeo!')
      return
    }

    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Arquivo muito grande! Máximo 500MB.')
      return
    }

    setUploading(true)

    try {
      // Sanitizar nome do arquivo
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
      
      const fileName = `${Date.now()}-${sanitizedName}`
      
      console.log('Enviando:', fileName)

      // Upload para Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('video-uploads')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      console.log('Upload OK:', uploadData)

      // Pegar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || '00000000-0000-0000-0000-000000000000'

      // Salvar no banco
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert({
          filename: file.name,
          storage_path: uploadData.path,
          status: 'pending',
          user_id: userId
        })
        .select()
        .single()

      if (dbError) throw dbError

      alert('✅ Vídeo enviado com sucesso!')
      if (onUploadComplete) onUploadComplete(video)
      
    } catch (error: any) {
      console.error('Erro:', error)
      alert('❌ Erro: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-blue-200">
      <div className="text-center">
        <div className="mb-4 text-6xl">📹</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload de Vídeo</h2>
        <p className="text-gray-600 mb-6">Selecione seu vídeo de aula (até 500MB)</p>

        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="video-upload"
        />
        
        <label
          htmlFor="video-upload"
          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold cursor-pointer
            ${uploading ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {uploading ? 'Enviando...' : 'Selecionar Vídeo'}
        </label>
      </div>
    </div>
  )
}