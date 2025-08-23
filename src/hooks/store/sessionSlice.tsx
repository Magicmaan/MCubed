import type { StateCreator } from 'zustand'

interface SessionSlice {
	session: {
		id: number
		name: string
		description: string
		createdAt: Date | null
		updatedAt: Date | null
		authorId: string | null
		authorName: string
		thumbnailUrl: string
	}
	setSession: (scene: SessionSlice['session']) => void
	updateSession: (updates: Partial<SessionSlice['session']>) => void
	resetSession: () => void
}

const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set, get) => ({
	session: {
		id: 0,
		name: 'Default Scene',
		description: 'Default scene description',
		createdAt: null,
		updatedAt: null,
		authorId: null,
		authorName: 'Default Author',
		thumbnailUrl: '',
		isPublic: false,
	},
	setSession: scene => set({ session: scene }),
	updateSession: updates => {
		const currentScene = get().session
		set({
			session: {
				...currentScene,
				...updates,
				updatedAt: new Date(),
			},
		})
	},
	resetSession: () =>
		set({
			session: {
				id: 0,
				name: 'Default Scene',
				description: 'Default scene description',
				createdAt: null,
				updatedAt: null,
				authorId: null,
				authorName: 'Default Author',
				thumbnailUrl: '',
			},
		}),
})

export default createSessionSlice
export type { SessionSlice }
