import { useState, useEffect } from "react"

import { Navigation } from "../components/navigation"
import { Footer } from "../components/footer"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
} from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

export default function ContactPage() {
  const { theme } = useTheme()

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setSubmitted(true)

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })

    setTimeout(() => {
      setSubmitted(false)
    }, 4000)
  }

  if (!mounted) return null

  const contactInfo = [
    {
      icon: MapPin,
      title: "Location",
      content: ["Piassa", "Addis Ababa, Ethiopia"],
    },
    {
      icon: Phone,
      title: "Phone",
      content: ["+251 95 431 3273"],
    },
    {
      icon: Mail,
      title: "Email",
      content: ["support@tradebridge.com"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: [
        "Mon - Fri : 9:00 AM - 6:00 PM",
        "Saturday : 10:00 AM - 2:00 PM",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden relative transition-colors duration-500">
      
      {/* Header */}
      <Navigation />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 120, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-6 pt-40 pb-20">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white">
            Get in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Have questions about TradeBridge? Contact our team and we
            will help you as soon as possible.
          </p>
        </motion.div>

        {/* Contact Section */}
        <div className="grid lg:grid-cols-2 gap-14 max-w-7xl mx-auto">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Card className="border-0 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              
              <CardHeader>
                <CardTitle className="text-3xl text-gray-900 dark:text-white">
                  Send Message
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>

                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="h-12 rounded-xl border-2 border-blue-100 dark:border-gray-700 bg-blue-50/50 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>

                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="h-12 rounded-xl border-2 border-cyan-100 dark:border-gray-700 bg-cyan-50/50 dark:bg-gray-800 dark:text-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>

                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="h-12 rounded-xl border-2 border-purple-100 dark:border-gray-700 bg-purple-50/50 dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>

                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Write your message..."
                      required
                      className="rounded-xl border-2 border-pink-100 dark:border-gray-700 bg-pink-50/50 dark:bg-gray-800 dark:text-white resize-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                      >
                        <p className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                          <MessageSquare className="w-4 h-4" />
                          Message sent successfully!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white hover:scale-[1.02] transition-all duration-300"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contact Information
            </h2>

            {contactInfo.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={index}
                  whileHover={{ x: 10 }}
                  className="flex gap-5 items-start bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>

                    {item.content.map((line, i) => (
                      <p
                        key={i}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )
            })}

            {/* Map */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="overflow-hidden rounded-3xl shadow-2xl h-72 border border-gray-200 dark:border-gray-800"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6177618537944!2d38.7578!3d9.0192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sPiassa%2C%20Addis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1635959542000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter:
                    theme === "dark"
                      ? "invert(90%) hue-rotate(180deg)"
                      : "none",
                }}
                allowFullScreen
                loading="lazy"
                title="TradeBridge Location"
              />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}