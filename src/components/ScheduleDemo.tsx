'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
interface FormData {
  name: string
  phone: string
  email: string
  company: string
  notes: string
}

export default function ScheduleDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData)
      setIsOpen(false)
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#CC5500] text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-[#FF6A00] transition-colors duration-300">
          Schedule Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">

        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-3xl w-full">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Praveen Yadav"
                className="mt-1.5"
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-base">
                Phone No. <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className="mt-1.5"
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-base">
                Email Id
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="company" className="text-base">
                Company Name
              </Label>
              <Input 
                id="company" 
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="ABC pvt ltd."
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-base">
                Notes
              </Label>
              <textarea 
                id="notes" 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter your notes here"
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#CC5500] hover:bg-[#FF6A00] text-white font-semibold py-3 rounded-lg text-lg"
          >
            Schedule Demo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

