import {
	Button,
	Checkbox,
	Collection,
	Tree,
	TreeItem,
	TreeItemContent,
	type TreeItemContentProps,
	type TreeItemContentRenderProps,
} from 'react-aria-components'
import '@styles/common/modelTree.scss'
import '@styles/common/checkBox.scss'
// import '@styles'
import ChevronRight from 'pixelarticons/svg/chevron-right.svg'
import { twMerge } from 'tailwind-merge'
import PixelIcon from '../common/PixelIcon'
import { useModelStore } from '@/hooks/useStore'

function MyTreeItemContent(
	props: Omit<TreeItemContentProps, 'children'> & { children?: React.ReactNode }
) {
	return (
		<TreeItemContent>
			{({
				hasChildItems,
				selectionBehavior,
				selectionMode,
				allowsDragging,
				isExpanded,
				isSelected,
			}: TreeItemContentRenderProps) => (
				<>
					{allowsDragging && <Button slot="drag">X</Button>}
					{/* {selectionBehavior === 'toggle' && selectionMode !== 'none' && <p>O</p>} */}
					<Button slot="chevron">
						<PixelIcon
							icon="chevron-right"
							className={twMerge(isExpanded && 'rotate-90')}
						/>
					</Button>
					{/* <Checkbox slot="selection">
						<div className="checkbox">
							<svg viewBox="0 0 18 18" aria-hidden="true">
								<polyline points="1 9 7 14 15 4" />
							</svg>
						</div>
					</Checkbox> */}
					{props.children}
				</>
			)}
		</TreeItemContent>
	)
}

const ModelTree: React.FC = () => {
	const model = useModelStore()

	return (
		<Tree
			aria-label="Files"
			// style={{ height: '300px' }}
			defaultExpandedKeys={['documents', 'photos', 'project']}
			selectionMode="multiple"
			defaultSelectedKeys={['photos']}
			selectionBehavior="replace"
		>
			<TreeItem id="root" textValue="root" className={'react-aria-TreeItem pixel-border-1'}>
				<MyTreeItemContent>
					root
					{/* <Button aria-label="Info">boo</Button> */}
				</MyTreeItemContent>
				{model.elements.map(element => (
					<TreeItem
						key={element.id}
						id={element.id}
						textValue={element.name || element.id}
						className={'react-aria-TreeItem pixel-border-1'}
						onClick={() => {
							console.log('Clicked on tree item', element.id)
							element.setSelected(!element.selected)
						}}
					>
						<MyTreeItemContent>
							{element.name || element.id}
							{/* <Button aria-label="Info">boo</Button> */}
						</MyTreeItemContent>
					</TreeItem>
				))}
			</TreeItem>
		</Tree>
	)
}

export default ModelTree
