"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { motion, useMotionValueEvent, useMotionValue } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <ScrollingCards />
    </main>
  )
}

function ScrollingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollY = useMotionValue(0)

  const cards = [
    { id: 1, title: "Card 1", content: "This is the content for card 1" },
    { id: 2, title: "Card 2", content: "This is the content for card 2" },
    { id: 3, title: "Card 3", content: "This is the content for card 3" },
    { id: 4, title: "Card 4", content: "This is the content for card 4" },
    { id: 5, title: "Card 5", content: "This is the content for card 5" },
    { id: 6, title: "Card 6", content: "This is the content for card 6" },
    { id: 7, title: "Card 7", content: "This is the content for card 7" },
    { id: 8, title: "Card 8", content: "This is the content for card 8" },
    { id: 9, title: "Card 9", content: "This is the content for card 9" },
    { id: 10, title: "Card 10", content: "This is the content for card 10" },
  ]

  // Track scroll position
  useEffect(() => {
    const updateScrollY = () => {
      if (containerRef.current) {
        scrollY.set(containerRef.current.scrollTop)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", updateScrollY)
      return () => container.removeEventListener("scroll", updateScrollY)
    }
  }, [scrollY])

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto py-16">
      <div className="max-w-md mx-auto space-y-8 px-4">
        {cards.map((card, index) => (
          <ScrollCard key={card.id} card={card} index={index} scrollY={scrollY} containerRef={containerRef} />
        ))}
      </div>
    </div>
  )
}

interface CardProps {
  card: {
    id: number
    title: string
    content: string
  }
  index: number
  scrollY: any
  containerRef: React.RefObject<HTMLDivElement>
}

function ScrollCard({ card, index, scrollY, containerRef }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const opacity = useMotionValue(0.5)
  const scale = useMotionValue(0.95)

  useEffect(() => {
    const updateCardEffects = () => {
      if (!cardRef.current || !containerRef.current) return

      // Get viewport height and center point
      const viewportHeight = containerRef.current.clientHeight
      const viewportCenter = viewportHeight / 2

      // Get card position and dimensions
      const cardRect = cardRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      // Calculate card's center position relative to the container
      const cardCenter = cardRect.top - containerRect.top + cardRect.height / 2

      // Calculate distance from center (normalized)
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter) / (viewportHeight / 2)

      // Calculate opacity - 1 at center, fading to 0.2 at edges
      const newOpacity = Math.max(0.2, 1 - distanceFromCenter * 0.8)
      opacity.set(newOpacity)

      // Calculate scale - 1 at center, shrinking to 0.85 at edges
      const newScale = Math.max(0.85, 1 - distanceFromCenter * 0.15)
      scale.set(newScale)
    }

    updateCardEffects()

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", updateCardEffects)
      return () => container.removeEventListener("scroll", updateCardEffects)
    }
  }, [containerRef, opacity, scale])

  // Update effects when scrollY changes
  useMotionValueEvent(scrollY, "change", () => {
    if (!cardRef.current || !containerRef.current) return

    const viewportHeight = containerRef.current.clientHeight
    const viewportCenter = viewportHeight / 2

    const cardRect = cardRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    const cardCenter = cardRect.top - containerRect.top + cardRect.height / 2
    const distanceFromCenter = Math.abs(cardCenter - viewportCenter) / (viewportHeight / 2)

    const newOpacity = Math.max(0.2, 1 - distanceFromCenter * 0.8)
    opacity.set(newOpacity)

    const newScale = Math.max(0.85, 1 - distanceFromCenter * 0.15)
    scale.set(newScale)
  })

  return (
    <motion.div ref={cardRef} style={{ opacity, scale }} className="w-full origin-center">
      <Card className="w-full h-48 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
        <p className="text-center">{card.content}</p>
      </Card>
    </motion.div>
  )
}
