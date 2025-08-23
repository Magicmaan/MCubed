import * as React from 'react'
import { twMerge } from 'tailwind-merge'

type PixelIconProps = {
	icon: string
	className?: string
}

const svgs = import.meta.glob('/node_modules/pixelarticons/svg/*.svg', { eager: false, as: 'url' })

const PixelIcon: React.FC<PixelIconProps> = ({ icon, className }) => {
	const [svgPath, setSvgPath] = React.useState<string | null>(null)

	React.useLayoutEffect(() => {
		const importSvg = svgs[`/node_modules/pixelarticons/svg/${icon}.svg`]
		if (!importSvg) {
			console.warn(`Icon "${icon}" not found in pixelarticons.`)
			setSvgPath(null)
			return
		}
		importSvg().then((url: string) => {
			setSvgPath(url)
		})
	}, [icon])

	if (!svgPath) {
		return null
	}

	return (
		<img
			src={svgPath}
			className={twMerge(' transition-transform duration-200', className)}
			alt="icon"
		/>
	)
}

export default PixelIcon
