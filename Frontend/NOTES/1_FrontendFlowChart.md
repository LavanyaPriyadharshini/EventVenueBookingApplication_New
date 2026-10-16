Frontend/
└── src/
    ├── main.tsx                     # QueryClientProvider + BrowserRouter + AuthProvider wrap App
    ├── App.tsx                      # route table only
    │
    ├── lib/
    │   ├── axiosClient.ts           # ONE axios instance — baseURL = gateway (:8080), attaches JWT, 401 → logout
    │   └── createResourceApi.ts     # generic factory: given a base path + action paths, returns {getAll, getById, create, update, remove}
    │                                 (this is the frontend mirror of your shared/crudFactory.ts — every *.api.ts file becomes ~5 lines)
    │
    ├── hooks/
    │   ├── createResourceHooks.ts   # generic factory: wraps a resource-api in useQuery/useMutation (useList, useItem, useCreate, useUpdate, useRemove)
    │   │                             (mirrors createResourceApi — one generic hook-set instead of useVenues/useSections/useRows/useSeats each reimplemented)
    │   └── useAuth.ts               # the one hook that ISN'T generic (login/register/me has real custom logic)
    │
    ├── api/                         # one tiny file per domain — each just calls createResourceApi() with that domain's real endpoint names
    │   ├── auth.api.ts              # register(), login(), getMe() — custom, not CRUD-shaped
    │   ├── venue.api.ts              # createResourceApi('/api/venues', {create:'createVenue', getAll:'getAllVenues', ...})
    │   ├── section.api.ts
    │   ├── row.api.ts
    │   ├── seat.api.ts
    │   └── event.api.ts             # (future — event-service)
    │
    ├── context/
    │   └── AuthContext.tsx          # holds token + user, reads/writes localStorage, exposes useAuthContext()
    │
    ├── components/
    │   ├── ui/                      # dumb, reusable, no business logic — used everywhere
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── FormField.tsx        # label + input + error message, one place for form row styling
    │   │   ├── Modal.tsx
    │   │   ├── Table.tsx            # generic <Table columns={} data={} /> — avoids rewriting <table> markup per list page
    │   │   └── Spinner.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── ProtectedRoute.tsx   # redirects to /login if no token; restrictTo(role) variant mirrors backend's restrictTo
    │   └── venue/
    │       └── SeatMap.tsx          # domain-specific, not reusable elsewhere
    │
    └── pages/
        ├── auth/{Login,Register}.tsx
        ├── venues/{VenueList,VenueDetail,VenueForm}.tsx
        └── organizer/Dashboard.tsx
