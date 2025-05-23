'use client';

import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
import React from "react"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-background text-foreground",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div 
            className="group flex overflow-hidden p-2 flex-row"
            style={{ gap: "1rem" }}
          >
            <div 
              className="flex shrink-0 justify-around flex-row"
              style={{ 
                gap: "1rem",
                animation: "marquee 40s linear infinite",
                animationPlayState: "running"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animationPlayState = "paused";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animationPlayState = "running";
              }}
            >
              {[...Array(4)].map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  {testimonials.map((testimonial, i) => (
                    <TestimonialCard 
                      key={`${setIndex}-${i}`}
                      {...testimonial}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 4)); }
        }
      `}</style>
    </section>
  )
} 