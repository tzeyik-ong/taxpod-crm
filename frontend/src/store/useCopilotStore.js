import { create } from 'zustand'

const useCopilotStore = create((set, get) => ({
  isOpen:    false,
  messages:  [],   // { id, role: 'user'|'assistant', content, error? }
  isLoading: false,

  toggleOpen: () => set(state => ({ isOpen: !state.isOpen })),
  setOpen:    (open) => set({ isOpen: open }),

  addMessage: (msg) =>
    set(state => ({ messages: [...state.messages, { id: Date.now(), ...msg }] })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),

  // Returns only user/assistant turns (no system) for the API call
  getApiHistory: () =>
    get().messages
      .filter(m => !m.error)
      .map(m => ({ role: m.role, content: m.content })),
}))

export default useCopilotStore
