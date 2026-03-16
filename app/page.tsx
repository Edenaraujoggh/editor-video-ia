'use client'

import { useState } from 'react'
import VideoUploader from './components/VideoUploader'

export default function Home() {
  const [videos, setVideos] = useState([])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎬 Editor de Vídeo com IA
        </h1>
        <p className="text-gray-600 mb-8">
          Faça upload do seu vídeo de aula e a IA irá detectar automaticamente 
          os erros e hesitações para cortar.
        </p>

        <VideoUploader onUploadComplete={(video) => {
          setVideos([video, ...videos])
        }} />
      </div>
    </main>
  )
}