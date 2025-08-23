import { cva } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

type LayoutSectionProps = {
	children?: React.ReactNode
	className?: string
	region: 'main' | 'left' | 'right' | 'top' | 'bottom'
}

const layoutVariants = cva('layout-section', {
	variants: {
		region: {
			main: 'layout-main',
			left: 'layout-left',
			right: 'layout-right',
			top: 'layout-top',
			bottom: 'layout-footer',
		},
	},
})

const LayoutSection: React.FC<LayoutSectionProps> = ({ children, className, region }) => {
	return (
		<section className={twMerge(layoutVariants({ region }), className)}>
			<div className="bg-white">{children}</div>
		</section>
	)
}

export default LayoutSection
