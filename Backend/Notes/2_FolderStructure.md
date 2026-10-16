Event Flow Project/
├── package.json              workspaces root: shared, gateway, services/*
├── tsconfig.base.json        shared compiler options (nodenext)
├── docker-compose.yml        mongo, redis, rabbitmq
├── .gitignore
│
├── shared/                   ✅ built — @eventflow/shared
│   └── src/
│       ├── utils/{AppError, asyncHandler, crudFactory}.ts
│       ├── middlewares/{auth.middleware, errorHandler}.ts
│       └── logger/logger.ts
│
├── gateway/                  ✅ built — proxies /api/auth so far
│   └── src/server.ts
│
└── services/
    ├── auth-service/         ✅ built + tested (register, login, me)
    │   └── src/{config/db.ts, models/user.model.ts, controllers/, routes/, app.ts, server.ts}
    │
    ├── venue-service/        ⬜ next — Venue, Section, Row, Seat
    ├── event-service/        ⬜ Category, Event, Show, TicketType
    ├── seat-inventory-service/  ⬜ ShowSeat (available/held/booked state machine)
    ├── booking-service/      ⬜ Booking, BookingItem, OutboxEvent
    ├── payment-service/      ⬜ Payment, IdempotencyKey
    ├── ticket-service/       ⬜ Ticket, QR code, scan log
    ├── notification-service/ ⬜ Template, NotificationLog
    └── reporting-service/    ⬜ denormalized read models



Frontend Structure-

Frontend/
├── index.html
├── vite.config.ts
├── package.json
└── src/
    ├── main.tsx                 QueryClientProvider + BrowserRouter wrap App
    ├── App.tsx                  route table
    │
    ├── api/
    │   ├── axiosClient.ts       one axios instance, baseURL = gateway (:8080), attaches JWT from storage, 401 → logout
    │   ├── auth.api.ts          register(), login(), getMe()
    │   ├── venue.api.ts
    │   ├── event.api.ts
    │   ├── seat.api.ts
    │   ├── booking.api.ts
    │   ├── payment.api.ts
    │   └── ticket.api.ts
    │
    ├── hooks/                   one file per domain, thin wrappers over TanStack Query
    │   ├── useAuth.ts           useMutation(login/register), useQuery(['me'], getMe)
    │   ├── useEvents.ts         useQuery(['events']), useQuery(['event', id])
    │   ├── useSeats.ts          useQuery(['seats', showId]) — short staleTime, this data goes stale fast
    │   ├── useBooking.ts        useMutation(holdSeats), useMutation(confirmBooking)
    │   └── useTickets.ts
    │
    ├── context/
    │   └── AuthContext.tsx      holds token + user, reads/writes localStorage, exposes useAuthContext()
    │
    ├── components/
    │   ├── ProtectedRoute.tsx   redirects to /login if no token
    │   ├── Navbar.tsx
    │   └── SeatMap.tsx
    │
    └── pages/
        ├── auth/{Login,Register}.tsx
        ├── events/{EventList,EventDetail}.tsx
        ├── booking/{SeatSelection,Checkout}.tsx
        ├── tickets/MyTickets.tsx
        └── organizer/{Dashboard,Reports}.tsx
