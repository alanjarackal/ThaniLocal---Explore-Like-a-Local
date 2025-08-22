import { useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ItineraryPreferences {
  startDate: string
  endDate: string
  budget: number
  interests: string[]
  groupSize: number
  preferredCategories: string[]
}

interface Experience {
  id: string
  title: string
  description: string
  price: number
  duration: number
  location: string
  category: string
  max_participants: number
  images: string[] | null
}

interface ItineraryDay {
  date: string
  activities: Experience[]
  totalCost: number
  totalDuration: number
}

export default function GenerateItinerary() {
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null)
  const [preferences, setPreferences] = useState<ItineraryPreferences>({
    startDate: '',
    endDate: '',
    budget: 1000,
    interests: [],
    groupSize: 2,
    preferredCategories: []
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fetch available experiences based on preferences
      const { data: experiences, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('status', 'approved')
        .in('category', preferences.preferredCategories)
        .lte('max_participants', preferences.groupSize)
        .lte('price', preferences.budget / preferences.groupSize)

      if (error) throw error

      if (!experiences || experiences.length === 0) {
        alert('No experiences found matching your preferences.')
        return
      }

      // Generate itinerary
      const startDate = new Date(preferences.startDate)
      const endDate = new Date(preferences.endDate)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const generatedItinerary: ItineraryDay[] = []
      let remainingBudget = preferences.budget
      
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + i)
        
        // Filter experiences that fit within remaining budget and time
        const availableExperiences = experiences.filter((exp: Experience) => 
          exp.price * preferences.groupSize <= remainingBudget
        )

        if (availableExperiences.length === 0) break

        // Select experiences for the day (simple algorithm - can be improved)
        const dayActivities: Experience[] = []
        let dayDuration = 0
        let dayCost = 0

        for (const exp of availableExperiences) {
          if (dayDuration + exp.duration <= 8 && // Max 8 hours per day
              dayCost + (exp.price * preferences.groupSize) <= remainingBudget) {
            dayActivities.push(exp)
            dayDuration += exp.duration
            dayCost += exp.price * preferences.groupSize
          }
        }

        if (dayActivities.length > 0) {
          generatedItinerary.push({
            date: currentDate.toISOString().split('T')[0],
            activities: dayActivities,
            totalCost: dayCost,
            totalDuration: dayDuration
          })
          remainingBudget -= dayCost
        }
      }

      setItinerary(generatedItinerary)
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert('Error generating itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleCategoryChange = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generate Your Itinerary</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={preferences.startDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={preferences.endDate}
              onChange={handleChange}
              required
              min={preferences.startDate}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Budget (USD)</label>
            <input
              type="number"
              name="budget"
              value={preferences.budget}
              onChange={handleChange}
              required
              min="0"
              step="100"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Group Size</label>
            <input
              type="number"
              name="groupSize"
              value={preferences.groupSize}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {['food', 'adventure', 'culture', 'nature', 'workshop', 'tour'].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded"
                  />
                  <span className="capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </form>

        {itinerary && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Itinerary</h2>
            {itinerary.map((day, index) => (
              <div key={day.date} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Day {index + 1} - {day.date}</h3>
                <div className="space-y-4">
                  {day.activities.map(activity => (
                    <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Duration: {activity.duration}h</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">
                          Cost: ${activity.price * preferences.groupSize}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <p>Total Duration: {day.totalDuration}h</p>
                  <p>Total Cost: ${day.totalCost}</p>
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">
                Total Trip Cost: ${itinerary.reduce((sum, day) => sum + day.totalCost, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 