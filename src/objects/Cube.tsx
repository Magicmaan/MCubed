import { useStore } from '@/hooks/useStore'
import { Outlines } from '@react-three/drei'
import { extend, type ThreeElement, type ThreeEvent } from '@react-three/fiber'
import * as Three from 'three'

class Cube extends Three.Mesh {
	size: Three.Vector3
	position: Three.Vector3
	rotation: Three.Euler
	selected: boolean = false

	geometry: Three.BoxGeometry
	material: Three.Material
	type: string = 'Cube'

	constructor(
		size = new Three.Vector3(1, 1, 1),
		position = new Three.Vector3(0, 0, 0),
		rotation = new Three.Euler(0, 0, 0)
	) {
		super()
		this.size = size
		this.position = position
		this.rotation = rotation

		this.geometry = new Three.BoxGeometry(this.size.x, this.size.y, this.size.z)
		this.material = new Three.MeshPhongMaterial({ color: 0x00ff00 })

		this.userData = { id: this.id }

		this.name = 'cube_' + useStore.getState().model.elements.length

		// this.add(outlines.props.ref)
	}
	updateSize(size: Three.Vector3) {
		this.size.copy(size)
		this.geometry.dispose()
		this.geometry = new Three.BoxGeometry(this.size.x, this.size.y, this.size.z)
	}
	updatePosition(position: Three.Vector3) {
		this.position.copy(position)
		this.position.set(this.position.x, this.position.y, this.position.z)
	}
	updateRotation(rotation: Three.Euler) {
		this.rotation.copy(rotation)
		this.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
	}
	setSelected(selected: boolean) {
		this.selected = selected

		// toggle outline
		// need better way to do this
		this.children[0].visible = selected
	}

	onClick?(e: ThreeEvent<MouseEvent>) {
		console.log('Clicked on cube', e)
		console.log('Cube ID:', e.object.selected)
		e.stopPropagation()
	}
}
declare module '@react-three/fiber' {
	interface ThreeElements {
		cube: ThreeElement<typeof Cube>
	}
}
extend({ Cube })

export default Cube
