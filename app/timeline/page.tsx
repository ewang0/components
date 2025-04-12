"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useMotionValueEvent, useMotionValue, MotionValue } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <InfiniteScrollingCards />
    </main>
  )
}

// Generate a unique card with sequential ID
const generateCard = (id: number) => ({
  id,
  title: `Card ${id}`,
  content: `This is the content for card ${id}`,
})

// Generate initial batch of cards
const generateInitialCards = (count: number, startId = 1) => {
  return Array.from({ length: count }, (_, index) => generateCard(startId + index))
}

function InfiniteScrollingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollY = useMotionValue(0)
  const [cards, setCards] = useState(() => generateInitialCards(20))
  const [isNearTop, setIsNearTop] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(false)
  const isAddingCards = useRef(false)

  // Add cards to the beginning of the list
  const prependCards = useCallback(() => {
    if (isAddingCards.current) return
    isAddingCards.current = true

    const firstId = cards[0].id
    const newCards = generateInitialCards(10, firstId - 10)

    // Save current scroll position
    const currentScrollTop = containerRef.current?.scrollTop || 0
    const currentHeight = containerRef.current?.scrollHeight || 0

    setCards((prev) => [...newCards, ...prev])

    // After the DOM updates, restore scroll position
    setTimeout(() => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight
        const heightDifference = newHeight - currentHeight
        containerRef.current.scrollTop = currentScrollTop + heightDifference
      }
      isAddingCards.current = false
    }, 10)
  }, [cards])

  // Add cards to the end of the list
  const appendCards = useCallback(() => {
    if (isAddingCards.current) return
    isAddingCards.current = true

    const lastId = cards[cards.length - 1].id
    const newCards = generateInitialCards(10, lastId + 1)

    setCards((prev) => [...prev, ...newCards])
    isAddingCards.current = false
  }, [cards])

  // Check scroll position to determine if we need to add more cards
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current

      // Check if we're near the top (within 20% of client height)
      setIsNearTop(scrollTop < clientHeight * 0.2)

      // Check if we're near the bottom (within 20% of client height)
      setIsNearBottom(scrollHeight - scrollTop - clientHeight < clientHeight * 0.2)

      // Update scrollY motion value
      scrollY.set(scrollTop)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [scrollY])

  // Add more cards when approaching the top or bottom
  useEffect(() => {
    if (isNearTop) {
      prependCards()
    }
  }, [isNearTop, prependCards])

  useEffect(() => {
    if (isNearBottom) {
      appendCards()
    }
  }, [isNearBottom, appendCards])

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto py-16">
      <div className="max-w-md mx-auto space-y-8 px-4">
        {cards.map((card) => (
          <ScrollCard 
            key={card.id} 
            card={card} 
            scrollY={scrollY} 
            containerRef={containerRef as React.RefObject<HTMLDivElement>} 
          />
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
  scrollY: MotionValue<number>
  containerRef: React.RefObject<HTMLDivElement>
}

function ScrollCard({ card, scrollY, containerRef }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const opacity = useMotionValue(0.5)
  const scale = useMotionValue(0.95)

  const updateCardEffects = useCallback(() => {
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
  }, [containerRef, opacity, scale])

  useEffect(() => {
    updateCardEffects()

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", updateCardEffects)
      return () => container.removeEventListener("scroll", updateCardEffects)
    }
  }, [containerRef, updateCardEffects])

  // Update effects when scrollY changes
  useMotionValueEvent(scrollY, "change", updateCardEffects)

  return (
    <motion.div ref={cardRef} style={{ opacity, scale }} className="w-full origin-center">
      <Card className="w-full h-48 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
        <p className="text-center">{card.content}</p>
        <div className="mt-2 text-xs text-gray-400">ID: {card.id}</div>
      </Card>
    </motion.div>
  )
}
