type AppLayoutProps = {
	children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	return <div className="app-layout">{children}</div>
}

export default AppLayout
