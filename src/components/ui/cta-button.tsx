import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CTAButtonProps extends React.ComponentProps<typeof Button> {
  href?: string;
  children: React.ReactNode;
  showArrow?: boolean;
  animate?: boolean;
}

export function CTAButton({
  href,
  children,
  className,
  variant = "default",
  size = "lg",
  showArrow = true,
  animate = true,
  ...props
}: CTAButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight className="ml-1 h-4 w-4" />}
    </>
  );

  const buttonClass = cn(
    buttonVariants({ variant, size }),
    "font-medium rounded-lg transition-all duration-300",
    animate && "hover:scale-105",
    className
  );

  if (animate) {
    return href ? (
      <Link href={href} className={buttonClass} {...props}>
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {content}
        </motion.div>
      </Link>
    ) : (
      <Button className={buttonClass} {...props}>
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {content}
        </motion.div>
      </Button>
    );
  }

  return href ? (
    <Link href={href} className={buttonClass} {...props}>
      <div className="flex items-center justify-center">{content}</div>
    </Link>
  ) : (
    <Button className={buttonClass} {...props}>
      <div className="flex items-center justify-center">{content}</div>
    </Button>
  );
} 