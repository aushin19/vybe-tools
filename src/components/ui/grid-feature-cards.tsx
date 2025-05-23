import { cn } from '@/lib/utils';
import React from 'react';

type FeatureType = {
	title: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	description: string;
};

type FeatureCardPorps = React.ComponentProps<'div'> & {
	feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardPorps) {
	const p = genRandomPattern();

	return (
		<div 
			className={cn(
				'group relative overflow-hidden p-6 transition-all duration-300',
				'after:absolute after:inset-0 after:z-0 after:bg-gradient-to-br after:from-emerald-500/0 after:to-emerald-500/0 after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-10',
				'before:absolute before:-inset-1 before:-z-10 before:bg-gradient-to-br before:from-emerald-500/20 before:via-emerald-500/0 before:to-emerald-500/20 before:opacity-0 before:blur-xl before:transition-opacity before:duration-500 hover:before:opacity-100',
				'first:rounded-tl-xl last:rounded-br-xl md:first:rounded-bl-none md:last:rounded-tr-none',
				className
			)} 
			{...props}
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-emerald-500/[0.01] opacity-100">
					<GridPattern
						width={20}
						height={20}
						x="-12"
						y="4"
						squares={p}
						className="absolute inset-0 h-full w-full fill-emerald-500/[0.02] stroke-emerald-500/10 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-50"
					/>
				</div>
			</div>
			<div className="relative z-10">
				<div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-2 group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-colors duration-300">
					<feature.icon className="size-5 text-emerald-500" strokeWidth={1.5} aria-hidden />
				</div>
				<h3 className="text-base font-medium md:text-lg group-hover:text-emerald-500 transition-colors duration-300">{feature.title}</h3>
				<p className="text-muted-foreground relative z-20 mt-2 text-sm font-light">{feature.description}</p>
			</div>
		</div>
	);
}

function GridPattern({
	width,
	height,
	x,
	y,
	squares,
	...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
	const patternId = React.useId();

	return (
		<svg aria-hidden="true" {...props}>
			<defs>
				<pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
					<path d={`M.5 ${height}V.5H${width}`} fill="none" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
			{squares && (
				<svg x={x} y={y} className="overflow-visible">
					{squares.map(([x, y], index) => (
						<rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
					))}
				</svg>
			)}
		</svg>
	);
}

function genRandomPattern(length?: number): number[][] {
	length = length ?? 5;
	return Array.from({ length }, () => [
		Math.floor(Math.random() * 4) + 7, // random x between 7 and 10
		Math.floor(Math.random() * 6) + 1, // random y between 1 and 6
	]);
} 