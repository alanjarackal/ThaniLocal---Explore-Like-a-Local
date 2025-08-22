import { useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

interface ExperienceForm {
  title: string
  description: string
  duration: number
  location: string
  category: string
  maxParticipants: number
  images: FileList | null
}

export default function CreateExperience() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ExperienceForm>({
    title: '',
    description: '',
    duration: 1,
    location: '',
    category: '',
    maxParticipants: 1,
    images: null
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user logged in')

      const { data: experience, error: experienceError } = await supabase
        .from('experiences')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            location: formData.location,
            category: formData.category,
            max_participants: formData.maxParticipants,
            creator_id: user.id,
            status: 'pending' // Requires admin approval
          }
        ])
        .select()
        .single()

      if (experienceError) throw experienceError

      // Handle image upload if images are provided
      if (formData.images && formData.images.length > 0) {
        const imageUrls: string[] = []
        
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i]
          const fileExt = file.name.split('.').pop()
          const filePath = `${user.id}/${experience.id}/${i}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('experience-images')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('experience-images')
            .getPublicUrl(filePath)

          imageUrls.push(publicUrl)
        }

        // Update experience with image URLs
        const { error: updateError } = await supabase
          .from('experiences')
          .update({ images: imageUrls })
          .eq('id', experience.id)

        if (updateError) throw updateError
      }

      navigate('/experiences')
    } catch (error) {
      console.error('Error creating experience:', error)
      // Handle error appropriately
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev: ExperienceForm) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev: ExperienceForm) => ({
        ...prev,
        images: e.target.files
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create a New Experience</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="0.5"
              step="0.5"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a category</option>
            <option value="food">Food & Dining</option>
            <option value="adventure">Adventure</option>
            <option value="culture">Culture & Arts</option>
            <option value="nature">Nature</option>
            <option value="workshop">Workshop</option>
            <option value="tour">Guided Tour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Maximum Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="w-full p-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">You can upload multiple images</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Experience'}
        </button>
      </form>
    </div>
  )
} 