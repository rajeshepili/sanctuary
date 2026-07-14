import { http, HttpResponse } from 'msw'

// In-memory demo data
let demoEntries = [
  {
    id: 'demo-1',
    content:
      '<p>Welcome to Sanctuary Demo Mode! 🌿</p><p>This is a completely private, in-memory demo. Nothing you type here is saved to your computer or any server. If you refresh the page, it will disappear!</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: 'demo,welcome',
    mood: 'peaceful',
    isPinned: true,
  },
]

let demoPreferences = {
  id: 1,
  name: 'Demo User',
  layoutMode: 'standard',
  disclaimerAgreed: true,
  pinHash: null,
  pinEnabled: false,
}

let demoHabits: any[] = []
const demoCategories: any[] = []

export const handlers = [
  // TanStack Start uses RPC calls to /_server
  http.all('/_server', async ({ request }) => {
    const url = new URL(request.url)
    const fnName =
      url.searchParams.get('_serverFnName') ||
      url.searchParams.get('_serverFnId')

    // Parse payload if it's a POST
    let payload: any = {}
    if (request.method === 'POST') {
      try {
        payload = await request.json()
      } catch (e) {}
    }

    switch (fnName) {
      // ── Journal ──
      case 'getAllEntries':
      case 'listEntries':
        return HttpResponse.json(demoEntries)
      case 'getDeletedEntries':
        return HttpResponse.json([])
      case 'createEntry': {
        const newEntry = {
          id: `demo-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
          media: [],
          ...payload,
        }
        demoEntries = [newEntry, ...demoEntries]
        return HttpResponse.json(newEntry)
      }
      case 'deleteEntry':
        demoEntries = demoEntries.filter((e) => e.id !== payload.id)
        return HttpResponse.json({ success: true })
      case 'updateEntry':
        demoEntries = demoEntries.map((e) =>
          e.id === payload.id
            ? { ...e, ...payload, updatedAt: new Date().toISOString() }
            : e,
        )
        return HttpResponse.json(demoEntries.find((e) => e.id === payload.id))
      case 'togglePin':
        demoEntries = demoEntries.map((e) =>
          e.id === payload.id ? { ...e, isPinned: !e.isPinned } : e,
        )
        return HttpResponse.json(demoEntries.find((e) => e.id === payload.id))

      // ── Habits / Identities ──
      case 'getAllHabits':
      case 'getAllIdentities':
        return HttpResponse.json(demoHabits)
      case 'createHabit':
      case 'createIdentity': {
        const newHabit = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          completions: [],
          status: 'active',
          ...payload,
        }
        demoHabits = [newHabit, ...demoHabits]
        return HttpResponse.json(newHabit)
      }
      case 'toggleHabitCompletion':
      case 'toggleIdentityCompletion':
        return HttpResponse.json({ success: true })
      case 'deleteHabit':
      case 'deleteIdentity':
        demoHabits = demoHabits.filter((h) => h.id !== payload.id)
        return HttpResponse.json({ success: true })

      // ── Categories ──
      case 'getAllCategories':
        return HttpResponse.json(demoCategories)

      // ── Preferences ──
      case 'getPreferences':
        return HttpResponse.json(demoPreferences)
      case 'updatePreferences':
        demoPreferences = { ...demoPreferences, ...payload }
        return HttpResponse.json(demoPreferences)

      default:
        console.warn(`[MSW] Unmocked TanStack Start RPC Call: ${fnName}`)
        return HttpResponse.json(null)
    }
  }),
]
