import Button from '@/components/common/Button'
import { useActionStore, useStore } from '@/hooks/useStore'
import Cube from '@/objects/Cube'
import { useShallow } from 'zustand/shallow'

const ModelTreeToolbar = () => {
	const addCube = useStore(state => state.addCube)

	return (
		<div className="model-tree-toolbar pixel-border-1-green w-full h-10 pointer-events-auto flex items-center">
			<Button
				title="Add Cube"
				onClick={() => {
					console.log('Adding cube from toolbar')
					const cube = new Cube()
					addCube(cube)
				}}
			>
				+
			</Button>
		</div>
	)
}

export default ModelTreeToolbar
