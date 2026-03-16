'use client'

import { useState, useEffect } from 'react'
import VideoUploader from './components/VideoUploader'
import { supabase } from './lib/supabase'

interface Video {
  id: string
  filename: string
  status: 'pending' | 'processing' | 'transcribed' | 'completed'
  created_at: string
  storage_path: string
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar vídeos ao carregar
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setVideos(data)
    setLoading(false)
  }

  const handleTranscribe = async (videoId: string) => {
    // Atualizar status
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId)
    
    // Recarregar lista
    fetchVideos()
    
    // Aqui virá a integração com Whisper (próximo passo)
    alert('🎤 Transcrição iniciada! (Integração Whisper em breve)')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎬 Editor de Vídeo com IA
        </h1>
        <p className="text-gray-600 mb-8">
          Faça upload e a IA detecta automaticamente erros para cortar.
        </p>

        <VideoUploader onUploadComplete={fetchVideos} />
        
        {/* Lista de Vídeos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📁 Seus Vídeos ({videos.length})
          </h2>
          
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Nenhum vídeo enviado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎬</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-md">
                        {video.filename}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          video.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          video.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          video.status === 'transcribed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {video.status === 'pending' && '⏳ Pendente'}
                          {video.status === 'processing' && '🔄 Processando'}
                          {video.status === 'transcribed' && '✅ Transcrito'}
                          {video.status === 'completed' && '🎉 Finalizado'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(video.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {video.status === 'pending' && (
                      <button
                        onClick={() => handleTranscribe(video.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        🎤 Transcrever
                      </button>
                    )}
                    {video.status === 'transcribed' && (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        ✏️ Editar Cortes
                      </button>
                    )}
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video-uploads/${video.storage_path}`}
                      target="_blank"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      ▶️ Ver
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}