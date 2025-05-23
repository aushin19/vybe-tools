'use client';
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { FeatureCard } from '@/components/ui/grid-feature-cards';

const features = [
	{
		title: 'Lightning Fast',
		icon: Zap,
		description: 'Optimized for speed to provide the best user experience with minimal latency.',
	},
	{
		title: 'Powerful Suite',
		icon: Cpu,
		description: 'Enterprise-level tools and features to help your business scale and grow.',
	},
	{
		title: 'Secure Platform',
		icon: Fingerprint,
		description: 'Enterprise-grade security with end-to-end encryption to keep your data safe.',
	},
	{
		title: 'Full Customization',
		icon: Pencil,
		description: 'Tailor the platform to your specific business needs with extensive customization options.',
	},
	{
		title: 'Complete Control',
		icon: Settings2,
		description: 'Take full control of your business operations with powerful management tools.',
	},
	{
		title: 'AI Integration',
		icon: Sparkles,
		description: 'Leverage the power of AI to automate processes and gain valuable insights.',
	},
];

interface FeatureGridSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FeatureGridSection({ 
  title = "Power. Speed. Control.", 
  subtitle = "Everything you need to build a fast, secure, scalable business.",
  className 
}: FeatureGridSectionProps) {
	return (
		<section className={className}>
			<div className="mx-auto w-full max-w-5xl space-y-12 px-4">
				<AnimatedContainer className="mx-auto max-w-3xl text-center relative">
					<div className="absolute inset-0 -z-10">
						<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 blur-3xl opacity-50" />
					</div>
					<h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-white">
						{title}
					</h2>
					<p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
						{subtitle}
					</p>
				</AnimatedContainer>

				<AnimatedContainer
					delay={0.4}
					className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/40 via-emerald-500/20 to-emerald-500/40 p-4 backdrop-blur-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
					{features.map((feature, i) => (
						<div key={i} className="bg-background/50 rounded-lg backdrop-blur-sm">
							<FeatureCard feature={feature} />
						</div>
					))}
				</AnimatedContainer>
			</div>
		</section>
	);
}

type ViewAnimationProps = {
	delay?: number;
	className?: React.ComponentProps<typeof motion.div>['className'];
	children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
} 