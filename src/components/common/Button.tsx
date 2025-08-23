import { Button as AriaButton, type ButtonProps } from 'react-aria-components'

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
	return (
		<AriaButton
			{...props}
			className={' pixel-border-box bg-blue-500 pointer-events-auto hover:cursor-grab'}
		>
			{children}
		</AriaButton>
	)
}

export default Button
