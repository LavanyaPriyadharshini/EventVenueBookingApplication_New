# EventFlow

A distributed event-ticketing & booking platform, built service by service to learn distributed-systems
patterns (seat concurrency, the Outbox pattern, sagas), SQL Server performance tuning, caching, applied
DSA, and backend security — end to end, with a React frontend.

> This README is the living documentation of the project. It is updated after every step, in the same
> session that builds it — not written up afterwards. If a section looks unfinished, that part hasn't
> been built yet.

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local infrastructure](#local-infrastructure)
- [Running the project](#running-the-project)
- [Build progress](#build-progress)
- [Concepts index](#concepts-index)
- [Modules](#modules)

---

## Architecture

Nine services, each owning its own database — no service reads another service's tables directly.

| Service | Database | Owns | Talks to |
|---|---|---|---|
| Identity | IdentityDb | Users, Roles, RefreshTokens, OrganizerProfiles | — (issues the JWTs every service validates) |
| Venue | VenueDb | Venues, Sections, Rows, physical Seats | — |
| Event | EventDb | Categories, Events, Shows, TicketTypes & pricing | Venue |
| SeatInventory | SeatDb | ShowSeats (status, hold expiry, booking id, row version) | Venue, Event |
| Booking | BookingDb | Bookings, BookingItems, Outbox, saga state | SeatInventory, Payment |
| Payment | PaymentDb | Payments, IdempotencyKeys | FakePaymentProvider |
| Ticket | TicketDb | Tickets, QR codes, scan log | consumes `BookingConfirmed` |
| Notification | NotificationDb | Templates, NotificationLog | consumes events |
| Reporting | ReportingDb | Denormalized read models | consumes events |

Requests reach services through a YARP **Gateway**. Until Phase 7, services call each other directly over
HTTP; from Phase 7 on, cross-service communication moves to RabbitMQ via the transactional Outbox.

The seat-booking core is a state machine:

```
Available → (hold, all-or-nothing) → Held → (payment succeeds) → Booked
                                       │
                                       └─ (hold expires / payment fails / cancelled) → back to Available
```

## Tech stack

| Layer | Choice |
|---|---|
| Backend | ASP.NET Core (.NET 10), EF Core, Clean Architecture per service |
| Database | SQL Server 2022, running on the **host machine** (not containerized) — one instance, one database per service |
| Cache | Redis (Docker) |
| Messaging | RabbitMQ (Docker, used from Phase 7) |
| Gateway | YARP reverse proxy |
| Frontend | React 19 + TypeScript + Vite, TanStack Query |
| Logging | Serilog → Seq (Docker) |
| Observability | OpenTelemetry → Prometheus/Grafana/Jaeger (from Phase 14) |
| Testing | xUnit, Shouldly, NSubstitute, Testcontainers, Playwright, k6 |
| CI/CD | GitHub Actions (from Phase 15) |

## Repository structure

```
Project Development/
├── Backend/
│   ├── EventFlow.sln
│   ├── Directory.Build.props       shared project settings (net10.0, nullable, analyzers)
│   ├── Directory.Packages.props    every NuGet version, pinned once (Central Package Management)
│   ├── .editorconfig
│   ├── src/
│   │   ├── Gateway/                 (added when Identity exists)
│   │   ├── BuildingBlocks/          shared code — Common, Authentication, Messaging, Logging, Observability
│   │   └── Services/                Identity, Venue, Event, SeatInventory, Booking, Payment, Ticket, Notification, Reporting
│   └── tests/
│       ├── Unit/  Integration/  Architecture/  Load/
├── Frontend/                        React + Vite app
├── deploy/
│   ├── docker-compose.yml           local infra: Redis, RabbitMQ, Seq (NOT SQL Server — see below)
│   ├── .env.example                 committed — placeholders only
│   └── .env                         gitignored — real local credentials
└── Notes/                           phase-by-phase learning notes
```

*(This tree grows as each module is built — see [Build progress](#build-progress) for what exists today.)*

## Prerequisites

| Tool | Version | Status |
|---|---|---|
| .NET SDK | 10.0+ | ⚠️ **Not installed yet** — only 9.0.312 is present. Needs an elevated/interactive install: `winget install Microsoft.DotNet.SDK.10` (the automated terminal can't click the UAC prompt, so this one has to be run manually). |
| SQL Server | 2022 | ✅ running in Docker (`eventflow-sqlserver`) — see below. (Originally planned to run on the host machine; switched to Docker during Module 1 so `docker compose up` gives every dev the same database with no separate local install.) |
| Node.js | 22.12+ | ✅ installed (22.14.0) |
| Docker Desktop | latest | ✅ installed and running |
| Git | any recent | ✅ installed, repo initialized |

## Local infrastructure

**All infra, including SQL Server, runs in Docker**, defined in
[`deploy/docker-compose.yml`](deploy/docker-compose.yml):

| Service | Container | Host port(s) | UI |
|---|---|---|---|
| SQL Server | eventflow-sqlserver | 1433 | — (connect with any SQL client, `sa` / `deploy/.env`'s `SQL_SA_PASSWORD`) |
| Redis | eventflow-redis | 6379 | — |
| RabbitMQ | eventflow-rabbitmq | 5672, 15672 | http://localhost:15672 |
| Seq (logs) | eventflow-seq | 5341, 8081 | http://localhost:8081 (login `admin`, password in `deploy/.env`) |

All ports are bound to `127.0.0.1` only — not reachable from other devices on the network, even in dev.
Because the SQL Server image is Linux-based, it only supports **SQL authentication** (the `sa` account),
not Windows auth — that's the one real tradeoff versus the original host-machine plan.

Credentials live in `deploy/.env` (gitignored, generated locally with a CSPRNG). `deploy/.env.example`
documents which keys are required, with no real values, so another developer knows what to fill in.
`SQL_SA_PASSWORD` was already generated back in Module 0, before SQL Server was even running in Docker —
nothing new to add there.

```bash
# from the repo root
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d      # start infra
docker compose -f deploy/docker-compose.yml ps                                # check health
docker compose -f deploy/docker-compose.yml down                              # stop (data persists)
docker compose -f deploy/docker-compose.yml down -v                           # stop AND wipe all data
```

**Current status:** SQL Server, Redis, and RabbitMQ are up and healthy; Seq is up.

**Connecting `Identity.Api` to it:** the connection string is a secret (it embeds the `sa` password), so
it does **not** go in `appsettings.json` — same rule as `Jwt:SigningKey`. Once the .NET 10 SDK is
installed, set it via user-secrets:

```bash
dotnet user-secrets init --project Backend/src/Services/Identity/Identity.Api
dotnet user-secrets set "ConnectionStrings:IdentityDb" "Server=127.0.0.1,1433;Database=IdentityDb;User Id=sa;Password=<SQL_SA_PASSWORD from deploy/.env>;TrustServerCertificate=True;" --project Backend/src/Services/Identity/Identity.Api
dotnet user-secrets set "Jwt:SigningKey" "<a long random string, 32+ chars>" --project Backend/src/Services/Identity/Identity.Api
```

`TrustServerCertificate=True` is a local-dev-only shortcut (skips TLS certificate validation against the
container's self-signed cert) — flag this if it's ever still present in a non-local connection string.

## Running the project

*(Filled in once the first runnable service exists — Module 1.)*

## Build progress

Tick marks reflect what's actually been built and verified, not what's planned.

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Foundation | 🟡 In progress | Step 2/3 done: repo/infra, and the `EventFlow.Common` shared kernel built + explained |
| 1 | Identity | ⚪ Not started | |
| 2 | Venue | ⚪ Not started | |
| 3 | Event | ⚪ Not started | |
| 4 | SeatInventory | ⚪ Not started | |
| 5 | Booking (sync) | ⚪ Not started | |
| 6 | Payment (sync) | ⚪ Not started | |
| 7 | RabbitMQ + Outbox | ⚪ Not started | |
| 8 | Saga | ⚪ Not started | |
| 9 | Ticket | ⚪ Not started | |
| 10 | Notification | ⚪ Not started | |
| 11 | Redis | ⚪ Not started | |
| 12 | Reporting + DSA | ⚪ Not started | |
| 13 | Admin | ⚪ Not started | |
| 14 | Observability | ⚪ Not started | |
| 15 | CI/CD | ⚪ Not started | |

## Concepts index

Every DSA, security, and optimization/caching technique used, and exactly where. Updated as each module
is built — this answers "which DSA did I use and why" from one table instead of hunting through code.

| Module | DSA / algorithms | Security | Optimization / caching |
|---|---|---|---|
| 0 Foundation | — | secrets generated with a CSPRNG, kept out of git (`.env` + `.env.example`); Docker ports bound to `127.0.0.1` only; Seq given a real admin password instead of disabled auth | Central Package Management (no version drift across services) |

*(More rows added as each module is built.)*

## Modules

### Module 0 — Foundation

**Goal:** everything every other service depends on — repo hygiene, shared build settings, and local
infrastructure — before any business logic exists.

**Step 1 of 3 — Connections & infrastructure** ✅

What was created:

- `.gitignore` — keeps `bin/`, `obj/`, `node_modules/`, and `deploy/.env` out of git
- `Backend/Directory.Build.props` — settings every project inherits automatically: target `net10.0`,
  nullable reference types on, .NET analyzers on, warnings fail the build **only in CI**
- `Backend/Directory.Packages.props` — Central Package Management: every NuGet package version is pinned
  in one file, so 9 services can't silently drift onto different versions of the same library
- `Backend/.editorconfig` — naming conventions (`I`-prefixed interfaces, `_camelCase` private fields),
  file-scoped namespaces, indentation
- `deploy/docker-compose.yml` — Redis, RabbitMQ, Seq, each with a health check and a named volume, on
  their own Docker network, loopback-only ports. SQL Server is **not** containerized — it runs on the
  host machine instead (your choice); the service definition is kept, commented out, for later.
- `deploy/.env.example` (committed) and `deploy/.env` (gitignored, generated locally)

**Why these before any code:**

- *Directory.Build.props / Directory.Packages.props* — without them, every one of the ~40 projects this
  solution will eventually have (9 services × 4 layers + BuildingBlocks + Gateway) would repeat the same
  settings, and NuGet versions would drift apart one `dotnet add package` at a time.
- *Docker for Redis/RabbitMQ/Seq* — Redis has no official Windows build, RabbitMQ needs Erlang, and
  whatever runs locally should be the same image CI and Testcontainers use later.
- *`127.0.0.1`-only ports* — even in local dev, nothing listens on the network interface other devices
  on your network could reach.

**What went wrong, and the fix (keeping this honest — these are real debugging reps):**

1. `RandomNumberGenerator.Fill(...)` silently failed under Windows PowerShell 5.1 (that static method
   needs a newer .NET runtime than PowerShell 5.1 ships with) — the secrets it "generated" were actually
   the same repeated character. Caught it with a sanity check (counting unique characters), switched to
   `RNGCryptoServiceProvider.GetBytes(...)` instead, wiped the containers and volumes that had already
   started with the weak credentials, and regenerated properly. **Lesson: verify a generated secret isn't
   degenerate before trusting it — a silent failure in security-sensitive code is worse than a loud one.**
2. The Seq image's newer versions refuse to start with no admin account and no explicit opt-out
   (`SEQ_FIRSTRUN_ADMINPASSWORD` or `SEQ_FIRSTRUN_NOAUTHENTICATION` is required on first run). Set a real
   generated admin password rather than disabling auth, even for a local dev log viewer.

**DSA used:** none — this step is infrastructure, not logic.

**Pending on you:** install .NET 10 SDK (`winget install Microsoft.DotNet.SDK.10`, run manually — the
automated terminal can't approve the UAC prompt it needs). Still only 9.0.312 as of this step, so
`EventFlow.Common` has source written but hasn't been compiled yet.

**Step 2 of 3 — Shared kernel (`EventFlow.Common`)** ✅

Every service's Domain layer will reference this project — it's the small set of types with no business
meaning of their own that every aggregate is built from. Explained one type at a time, as each is walked
through:

| Type | File | Explained |
|---|---|---|
| `Entity<TId>` | `Entities/Entity.cs` | ✅ |
| `Result` / `Result<T>` | `Results/Result.cs` | ✅ |
| `IDomainEvent` | `Entities/IDomainEvent.cs` | ✅ |
| `Error` / `ErrorType` | `Results/Error.cs` | ✅ |
| `PagedResult<T>` | `Paging/PagedResult.cs` | ✅ |

**`IDomainEvent` — what it is:**

A *domain event* (Domain-Driven Design term) is an immutable record of something that already happened
inside an aggregate, named in the past tense — `SeatsHeldDomainEvent`, `BookingConfirmedDomainEvent`. The
aggregate raises it and doesn't know or care who reacts: Reporting might update a dashboard count,
Notification might send an email, Ticket might generate a QR code — all decoupled from the aggregate and
from each other.

`IDomainEvent` itself is a **marker interface** with two members:

```csharp
public interface IDomainEvent
{
    Guid EventId { get; }
    DateTimeOffset OccurredOn { get; }
}
```

- **Security:** `EventId` gives every event a stable identity a consumer can use to detect a *replayed or
  redelivered* message and refuse to act on it twice (e.g. RabbitMQ's at-least-once delivery means the
  same message can legitimately arrive more than once — without a dedup key, that could double-process a
  refund). `DateTimeOffset` (not `DateTime`) carries its UTC offset explicitly, so a hold-expiry or
  audit-time check can't be fooled by a local-time/UTC mix-up. And because this is a marker interface, each
  service's own Domain layer defines its own concrete events privately — only Infrastructure chooses what
  subset becomes an integration event crossing a service boundary (Phase 7), so internal aggregate detail
  isn't exposed by default.
- **Reliability:** `EventId` is exactly the key the Outbox pattern (Phase 7) needs: the domain event and
  the aggregate's DB change are written in one transaction, then a background dispatcher publishes it and
  marks it sent — if the dispatcher crashes between those two steps and retries, the consumer recognizes
  "I've already handled this `EventId`" and skips it, turning at-least-once delivery into effectively-once
  business behavior.
- **Scalability — where this grows later:**
  - It stays a 2-member marker interface on purpose (Open/Closed Principle): any of the 9 services can add
    a brand-new concrete event type any time with zero changes to `EventFlow.Common`, and no coordination
    between services.
  - `EventId` is a client-generated `Guid`, not a database identity/sequence — any service instance, behind
    any number of load-balanced replicas, can create a valid event id with no round trip to a shared
    counter. That's what lets this scale horizontally later without a single point of contention.
  - If event sourcing is ever added for Reporting, a `Version`/sequence number could be added via a new
    `IVersionedDomainEvent : IDomainEvent`, instead of changing this interface — existing events keep
    working unmodified.
  - Once 3+ concrete domain events exist, the repeated `EventId = Guid.NewGuid(); OccurredOn =
    DateTimeOffset.UtcNow;` boilerplate in each one is the natural trigger to add a shared
    `abstract record DomainEvent : IDomainEvent` base that sets both in its constructor — deliberately not
    built yet, since there's nothing to de-duplicate with only one implementer so far.

**`Error` / `ErrorType` — what it is:**

```csharp
public enum ErrorType { Validation, NotFound, Conflict, Forbidden, Unexpected }

public sealed record Error(string Code, string Message, ErrorType Type)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.Unexpected);

    public static Error Validation(string code, string message) => new(code, message, ErrorType.Validation);
    public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);
    public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);
    public static Error Forbidden(string code, string message) => new(code, message, ErrorType.Forbidden);
    public static Error Unexpected(string code, string message) => new(code, message, ErrorType.Unexpected);
}
```

`Error` is a **value object** — unlike `Entity<TId>` (same `Id` = same thing, contents can differ), two
`Error`s are equal if *all their fields* match, which a `record` gives for free (structural equality,
immutable by default). `ErrorType` is a small closed set of failure *categories*, each mapped to exactly
one HTTP status, once, in the Api layer — a handler never thinks about HTTP at all:

```csharp
var result = await _bookingService.HoldSeatsAsync(request);
if (result.IsFailure)
    return result.Error.Value.Type switch
    {
        ErrorType.Validation => Results.BadRequest(result.Error),
        ErrorType.NotFound   => Results.NotFound(result.Error),
        ErrorType.Conflict   => Results.Conflict(result.Error),      // e.g. "Booking.SeatAlreadyHeld"
        ErrorType.Forbidden  => Results.Forbid(),
        _                    => Results.Problem(),                   // ErrorType.Unexpected → 500
    };
```

- **Security:** `Message` is documented as "safe to show to a caller" — the contract is that nothing
  internal (stack traces, SQL text, exception type names) ever reaches the wire, because every failure path
  is forced through this type instead of an unhandled exception leaking its `.ToString()`. This also matters
  for *enumeration attacks*: a login endpoint should return the same generic `Error.Validation("Auth.InvalidCredentials",
  "Invalid email or password")` whether the email doesn't exist or the password is wrong — never
  `Error.NotFound("User not found")`, which would let an attacker enumerate valid accounts. `Code` being a
  separate, stable machine string (not the message) also means the frontend/tests match on `"Booking.SeatAlreadyHeld"`,
  never on fragile message text that a copy-edit could silently break.
- **Reliability:** Pairing `Error` with `Result`'s constructor check (from last step — success can't carry
  an error, failure must carry one) makes an invalid state *unconstructible*, not just discouraged. A closed
  `enum ErrorType` also means the Api-layer mapping switch above can be made exhaustive — if a 6th
  `ErrorType` is ever added and a service forgets to map it, the compiler (with `warnings-as-errors` in CI,
  already set in `Directory.Build.props`) flags the non-exhaustive switch instead of that service silently
  falling through to a wrong status code in production.
- **Scalability — where this grows later:**
  - New failure categories are additive: e.g. `ErrorType.RateLimited` → 429 (needed once Redis-backed rate
    limiting lands, Phase 11) is one enum value + one new `Error.RateLimited(...)` factory + one new switch
    arm — none of the other 8 services need to change.
  - Localization: `Code` is already the stable i18n lookup key and `Message` the English fallback — when
    the frontend needs multiple languages, nothing in this type has to change, only what wraps it.
  - Right now `Result` carries exactly one `Error`. Multi-field validation (e.g. a form with 3 bad fields
    reported at once) isn't modeled yet; the natural extension is a `ValidationError : Error` carrying a
    list, or a `Result.Failure(IEnumerable<Error>)` overload — additive, won't break any existing
    single-error call site.
  - Because `Error` is just a record, it's trivially JSON-serializable — when Booking calls Payment over
    HTTP (pre-Phase 7, before the Outbox exists), Payment's `Error` can cross that boundary as-is and Booking
    can re-wrap it, without the two services sharing anything beyond this one common type.

**`PagedResult<T>` — what it is:**

```csharp
public sealed class PagedResult<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public string? NextCursor { get; init; }
    public bool HasMore => NextCursor is not null;

    public static PagedResult<T> Create(IReadOnlyList<T> items, string? nextCursor) =>
        new() { Items = items, NextCursor = nextCursor };
}
```

**Concept:** this is **keyset (cursor) pagination**, not offset/`SKIP`-`TAKE` pagination. Offset pagination
asks "give me page 47" — the database still walks past and discards the first 46 pages' worth of rows every
time, so it gets slower as the offset grows. Keyset pagination asks "give me items after this cursor" — a
`WHERE Id > @lastId ORDER BY Id` the database can answer with an index seek regardless of how deep into the
results the caller is. Example, Phase 3's Event search:

```csharp
GET /events?cursor=eyJsYXN0SWQiOjEyM30&pageSize=20
→ PagedResult<EventSummary> { Items = [...20 events...], NextCursor = "eyJsYXN0SWQiOjE0M30" }
```

The caller never parses `NextCursor` — it's opaque, just echoed back verbatim as the next request's `cursor`.

- **Security:** because the cursor is opaque to the caller, it must never be *just* `Convert.ToBase64String("123")`
  with no integrity check — a caller could edit the decoded bytes and hand back a crafted cursor (e.g. jump
  to another tenant's row range, or re-inject a filter the original query had). When this is implemented
  (Phase 3), the cursor needs to either be signed/HMACed so tampering is detectable, or the query must
  re-apply every authorization filter (organizer ID, published-only, etc.) independently of what the cursor
  claims — the cursor is a hint for *where*, never a substitute for re-checking *who's allowed to see it*.
  `IReadOnlyList<T>` also matters here: it stops a caller from mutating the `Items` collection in place,
  which matters once a `PagedResult` is shared across requests via a cache (Redis, Phase 11) — one caller
  can't corrupt what another caller reads from the same cached page.
- **Reliability:** this is exactly why the doc comment calls out keyset over offset — an `Event` inserted or
  cancelled between two page requests can shift every later *offset* page under the caller, silently
  skipping or repeating rows; a keyset cursor's results stay stable through concurrent writes, which matters
  a lot for a ticket-search page getting hit while new shows are being published. `required` on `Items`
  means the compiler rejects constructing a `PagedResult<T>` without it (no silent null-items bug at
  runtime), and `HasMore` being computed from `NextCursor` rather than a separate stored bool means the two
  can never disagree with each other.
- **Scalability — where this grows later:**
  - No `TotalCount` is exposed, on purpose — an exact total usually needs a separate `COUNT(*)` that gets
    slower at the same rate offset pagination does, and for a ticket-drop scenario it would also leak exact
    remaining-inventory counts to anything scraping the search endpoint. If a rough total is ever needed, it
    should be a cheap approximate count, added separately, not derived from this type.
  - The cursor can grow from "last id" into a composite key once search gains multi-column sorting (e.g.
    sort by date then id, for Phase 3) — the cursor's *encoding* changes, but `PagedResult<T>` itself doesn't,
    since it only ever stores the cursor as an opaque string.
  - This same type is reusable for every future paged list in the system (Venue's seats, Reporting's
    denormalized tables, Admin's audit log) without modification — it's generic over `T` and carries no
    assumptions about what's being paged.
  - A `PagedResult<TOut> Map<TOut>(Func<T, TOut> selector)` helper (projecting `Items` while carrying the
    same `NextCursor` through) is a natural addition once 2+ call sites need to transform items after
    fetching — not added yet since there's no second call site to justify it.

That's the full shared kernel (`EventFlow.Common`) explained — `Entity<TId>`, `Result`/`Result<T>`,
`IDomainEvent`, `Error`/`ErrorType`, and `PagedResult<T>`.

---

### Module 1 — Identity

**Goal:** the first real service — user accounts, authentication, and the JWTs every other service trusts.
Built one Clean Architecture layer at a time: **Model → Repository → Service → Controller**, each layer
explained before the next is written.

⚠️ **.NET 10 SDK still not installed** (only 9.0.312 present) — every file below is real source, but none of
it has been compiled yet. `dotnet new` / `dotnet build` need the SDK; install it with
`winget install Microsoft.DotNet.SDK.10` (run manually — the automated terminal can't approve the UAC
prompt) whenever you want to actually build and run this.

**Clean Architecture, briefly:** four projects, dependencies only ever pointing *inward*:

```
Identity.Api  →  Identity.Application  →  Identity.Domain  ←  Identity.Infrastructure
(Controllers)      (Services)              (Models)            (Repository, DbContext)
```

- **Domain** (Models) depends on nothing but `EventFlow.Common` — no EF Core, no ASP.NET Core, no HTTP.
  This is the business rules, in their purest form.
- **Application** (Services) depends on Domain, and defines *interfaces* for anything it needs from the
  outside world (e.g. `IUserRepository`) without knowing who implements them.
- **Infrastructure** (Repository/DbContext) depends on Application + Domain and *implements* those
  interfaces — this is the only layer that knows SQL Server or EF Core exist.
- **Api** (Controllers) wires everything together (dependency injection) and talks HTTP.

The payoff: Domain and Application can be unit-tested with zero database, and swapping SQL Server for
something else later only touches Infrastructure.

| Layer | File | Explained |
|---|---|---|
| Model | `Identity.Domain/Entities/User.cs` (+ `ValueObjects/Address.cs`) | ✅ updated — see "Extending User" below |
| Repository (interface) | `Identity.Application/Interfaces/IUserRepository.cs` | ✅ |
| Persistence (DbContext) | `Identity.Infrastructure/Persistence/IdentityDbContext.cs` | ✅ |
| Repository (implementation) | `Identity.Infrastructure/Repositories/UserRepository.cs` (EF Core) | ✅ |
| Password hashing (interface) | `Identity.Application/Interfaces/IPasswordHasher.cs` | ✅ |
| Password hashing (implementation) | `Identity.Infrastructure/Security/BCryptPasswordHasher.cs` | ✅ |
| Service (Register) | `Identity.Application/Services/AuthService.cs` | ✅ |
| JWT access-token generation (interface) | `Identity.Application/Interfaces/ITokenGenerator.cs` | ✅ |
| JWT access-token generation (implementation) | `Identity.Infrastructure/Security/JwtTokenGenerator.cs` | ⚪ not yet |
| Service (Login + JWT) | `Identity.Application/Services/AuthService.cs` | ⚪ not yet |
| JWT validation (shared) | `BuildingBlocks/EventFlow.Authentication` | ⚪ not yet |
| Controller | `Identity.Api/Controllers/AuthController.cs` | ⚪ not yet |

**`User` — what it is:**

```csharp
public sealed class User : Entity<Guid>
{
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string DisplayName { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private readonly List<string> _roles = [];
    public IReadOnlyList<string> Roles => _roles;

    public static Result<User> Register(string email, string passwordHash, string displayName) { ... }
    public void AssignRole(string role) { ... }
    public void Deactivate() => IsActive = false;
}
```

**Concept:** this is the **aggregate root** pattern — all the invariants about what makes a "valid user"
live inside this one class, enforced through a private constructor and a `Register` factory, never through
a public settable property. Every property has a `private set`; the only way in is a method that enforces a
rule. This directly reuses `Entity<Guid>` and `Result<User>` from the shared kernel — `Register` can't throw
on bad input, it returns a `Result<User>` the caller is forced to check, exactly like `Error.Validation` was
designed for.

- **Security:**
  - `PasswordHash` is named and typed to make clear Domain **never sees a plaintext password** — hashing
    (BCrypt/Argon2) happens one layer out, in Infrastructure, so there's no code path inside Domain that
    could accidentally log or serialize a plaintext secret.
  - Email is trimmed and lowercased *once*, inside `Register` — without this, `"User@x.com"`,
    `" user@x.com "` and `"user@x.com"` would look like three different accounts to a naive uniqueness
    check, which is a real account-duplication/enumeration bug class, not a hypothetical one.
  - `Roles` is `IReadOnlyList<string>` and can only grow through `AssignRole` — nothing outside this class
    can reach into the list and add `"Admin"`. That one line is what stands between this being a proper
    authorization boundary and a privilege-escalation bug.
  - Accounts are **disabled** (`IsActive = false` via `Deactivate()`), never deleted — a compromised or
    banned account needs to stop working immediately without losing the audit trail, and without orphaning
    every `Booking`/`Ticket` row elsewhere in the system that references this user's id.
- **Reliability:**
  - `Register` returns `Result<User>` instead of throwing on bad input — invalid registration (bad email,
    blank name) is an expected, value-level failure, handled the same way as every other failure in this
    codebase, not a special case.
  - The private parameterless constructor exists *only* for EF Core to materialize a `User` row back into
    an object — there's no public parameterless constructor, so nothing can accidentally construct a
    half-initialized `User` from application code.
  - `CreatedAt` is stamped once, in the constructor, and never exposed with a setter — a reliable "when was
    this account actually created" that later profile edits can't accidentally overwrite.
- **Scalability — where this grows later:**
  - `Email` will need a **unique index at the database level** (added when `Identity.Infrastructure`'s EF
    Core configuration is built) — an application-level "is this email free?" check alone has a race
    condition: two concurrent registrations can both pass the check before either has inserted, and both
    succeed. The DB constraint is the real guarantee; the app-level check is just a fast, friendly
    pre-check.
  - `Roles` is a flat `List<string>` today, which is enough for "Customer" vs "Organizer" vs "Admin". If
    authorization grows more granular later (e.g. per-venue organizer permissions), this is the seam to
    replace with a proper `Role`/`Permission` join table — nothing else about `User`'s public surface has to
    change.
  - Because `User` depends on nothing but `EventFlow.Common`, it's unit-testable with **zero database and
    zero HTTP** — `User.Register(...)` can be exercised directly in an xUnit test. That's what keeps domain
    logic fast to test as all 9 services' worth of business rules accumulate.
  - No domain events are raised yet (e.g. a `UserRegisteredDomainEvent`) — deliberately deferred until
    something actually needs to react to a registration (a welcome email via Notification, Phase 10). Adding
    it later is additive: an `AggregateRoot<TId> : Entity<TId>` with a private events list and a
    `RaiseDomainEvent`/`PullDomainEvents` pair, which `User` would then extend instead of `Entity<TId>`
    directly.

**`IUserRepository` — what it is:**

```csharp
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
```

**Concept:** the **Repository pattern** — an abstraction over data access. `Identity.Application` depends on
this interface only, never on EF Core directly (**Dependency Inversion Principle**: the thing that *uses*
data access defines the contract; the thing that *implements* it, SQL Server/EF Core in
`Identity.Infrastructure`, depends on that contract — not the other way around). A future `AuthService` just
calls `_userRepository.GetByEmailAsync(email)` with no idea whether that's SQL Server, Postgres, or an
in-memory fake.

- **Security:** every User lookup goes through one reviewed implementation — no scattered hand-written SQL
  elsewhere that could be built unsafely. `ExistsByEmailAsync` returns a plain `bool`, not a `User`, so the
  registration "is this email taken?" check can't leak any actual user data just to answer yes/no.
  `CancellationToken` on every method lets a request get cancelled (e.g. client disconnected) instead of an
  abandoned query holding a database connection open — connection exhaustion is itself a denial-of-service
  risk under load.
- **Reliability:** because Application only knows this interface, `AuthService` can be unit tested against a
  fake `IUserRepository` with no real database — fast, deterministic tests. Everything is `Task`-based async,
  matching ASP.NET Core's threading model (a blocking synchronous DB call would tie up a thread-pool thread
  per request, which is how a service falls over under real traffic). `GetByIdAsync`/`GetByEmailAsync`
  return `User?` rather than throwing — "not found" is an expected, routine outcome, not an exceptional one;
  the Service layer decides whether to turn a `null` into an `Error.NotFound`.
- **Scalability — where this grows later:** swapping in a read replica or a Redis cache-aside layer for
  `GetByEmailAsync` under heavy login traffic (Phase 11) only touches the `Identity.Infrastructure`
  implementation — nothing in Application or the controller changes. New query needs (e.g. `GetByRoleAsync`
  for an admin screen) are additive interface members. As roles grow into their own table, a parallel
  `IRoleRepository` can be added without touching this one.

**`IdentityDbContext` — what it is:**

`Backend/src/Services/Identity/Identity.Infrastructure/Persistence/IdentityDbContext.cs`

```csharp
public sealed class IdentityDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Roles).HasField("_roles").UsePropertyAccessMode(PropertyAccessMode.Field);
        });
    }
}
```

**Concept:** the `DbContext` is EF Core's **Unit of Work** — it tracks every entity it loads and turns
changes into one SQL transaction on `SaveChangesAsync()`. This is the only file in the entire Identity
service allowed to know EF Core or SQL Server exist; `Identity.Domain` and `Identity.Application` never
reference it. `OnModelCreating` is where a plain C# class like `User` gets mapped onto an actual table —
column lengths, keys, indexes.

- **Security:** `Email`'s `.IsUnique()` index makes the uniqueness rule a **database guarantee**, not just an
  application-level check — this is what actually closes the race condition flagged back when `User.Register`
  was written (two concurrent signups can both pass an app-level "is it taken?" check before either commits;
  only the DB constraint rejects the second insert). Mapping `Roles` through `.HasField("_roles")` means even
  EF Core — reading rows back from the database — goes through the same single entry point as every other
  caller; there's no ORM back door that bypasses `AssignRole`'s invariants.
- **Reliability:** `SaveChangesAsync()` wraps every tracked change in one transaction — if a later step in a
  multi-entity save fails, nothing partially commits. Fixed `HasMaxLength` values aren't just documentation —
  they become real `nvarchar(n)` column limits, so an oversized value fails fast at the database rather than
  silently truncating.
- **Scalability — where this grows later:** more entities (RefreshTokens, OrganizerProfiles, per the
  architecture table) are added as more `DbSet<T>` properties and more `OnModelCreating` blocks — this file
  grows, but `IUserRepository`'s callers never see the difference. When read traffic outgrows one SQL Server
  instance, a read-only replica or a cache-aside layer slots in *behind* `IUserRepository`'s implementation —
  this file is exactly the one place that would change.

**`UserRepository` — what it is:**

`Backend/src/Services/Identity/Identity.Infrastructure/Repositories/UserRepository.cs`

```csharp
public sealed class UserRepository : IUserRepository
{
    private readonly IdentityDbContext _dbContext;

    public UserRepository(IdentityDbContext dbContext) => _dbContext = dbContext;

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant(), cancellationToken);

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _dbContext.Users.AnyAsync(u => u.Email == email.Trim().ToLowerInvariant(), cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

**Concept:** the concrete adapter satisfying `IUserRepository`, turning LINQ into SQL via `IdentityDbContext`.
Constructor-injected — the DI container (wired up later in `Identity.Api`) hands it one `DbContext` per
request.

- **Security:** email is normalized (trim + lowercase) again *here*, independently of `User.Register` —
  defense in depth, since a login lookup carries raw user input that never passed through `Register`.
  `ExistsByEmailAsync` uses `AnyAsync`, which never pulls back a full row. Everything is parameterized LINQ,
  never raw SQL string-building — this is what makes centralizing data access behind a Repository a real
  SQL-injection control, not just tidiness.
- **Reliability:** `AddAsync` calls `SaveChangesAsync` itself, so "add a user" is one complete unit of work —
  callers can't forget to save. `FirstOrDefaultAsync`/`AnyAsync` translate to efficient `TOP(1)`/`EXISTS` SQL
  instead of loading whole tables into memory.
- **Scalability:** because everything depends on the interface, a `CachedUserRepository : IUserRepository`
  can later wrap this one with Redis (Phase 11) as a pure decorator — `AuthService` never changes.
  `GetByEmailAsync` (the login hot path) is the natural first candidate for a covering index if it's ever
  slow.

**`IPasswordHasher` — what it is:**

`Backend/src/Services/Identity/Identity.Application/Interfaces/IPasswordHasher.cs`

```csharp
public interface IPasswordHasher
{
    string Hash(string password);

    bool Verify(string password, string passwordHash);
}
```

**Concept:** same Dependency Inversion as `IUserRepository` — Application declares *that* it needs to hash
and verify passwords, without committing to *which* algorithm (BCrypt, Argon2id, PBKDF2); that choice lives
in Infrastructure. **Hashing vs. encryption**: encryption is reversible with a key; hashing is one-way.
Passwords must never be stored encrypted or in plaintext — only as a hash. And not just any hash: password
hashing algorithms (bcrypt, Argon2) are deliberately *slow* and memory-hard, unlike SHA-256 (fast, built for
integrity checks) — so that someone who steals the whole `Users` table still can't brute-force millions of
password guesses per second on commodity hardware.

- **Security:** `Hash(password)` returns one self-contained string — bcrypt/Argon2 output embeds the random
  salt and cost factor directly in the returned string (e.g. `$2a$12$...`), so this codebase only ever needs
  one `PasswordHash` column, never a separate `Salt` column to keep in sync. `Verify` is a dedicated method,
  not "hash again and `==` compare" — a correct implementation extracts the embedded salt/cost from the
  stored hash, recomputes, and compares in **constant time**. A naive byte-by-byte `==` comparison that
  returns early on the first mismatching byte leaks, through response timing, how many leading characters
  matched — a real, exploitable timing side-channel, not a theoretical one.
- **Reliability:** being an interface, `AuthService` can be unit-tested against a fast fake `IPasswordHasher`
  instead of running real bcrypt (which is deliberately slow) on every test run. Centralizing hashing behind
  one implementation means there's exactly one place in the codebase that sets the work-factor/cost
  parameter — no call site can accidentally use weaker settings.
- **Scalability — where this grows later:** the cost parameter needs periodic increases as hardware gets
  faster to keep brute-force cost constant — a one-file change, because it's centralized. If Argon2id is
  adopted later, `Verify` can detect which algorithm produced a given stored hash (from its prefix) and
  route accordingly, letting old bcrypt hashes keep working while new registrations use the newer algorithm
  — no forced mass password reset. A `NeedsRehash(hash)` method is a natural later addition: a successful
  login can detect an outdated cost factor and transparently re-hash with current settings.

**`BCryptPasswordHasher` — what it is:**

`Backend/src/Services/Identity/Identity.Infrastructure/Security/BCryptPasswordHasher.cs`

Needs the `BCrypt.Net-Next` package: a `<PackageVersion Include="BCrypt.Net-Next" Version="4.0.3" />` line in
`Directory.Packages.props`, and `<PackageReference Include="BCrypt.Net-Next" />` in
`Identity.Infrastructure.csproj`.

```csharp
using BCrypt.Net;
using Identity.Application.Interfaces;

namespace Identity.Infrastructure.Security;

/// <summary>
/// Wraps the well-reviewed BCrypt.Net-Next library — password hashing is exactly the kind of code
/// you don't write yourself from scratch.
/// </summary>
public sealed class BCryptPasswordHasher : IPasswordHasher
{
    // 2^12 = 4096 rounds. Review periodically — bump as hardware gets faster (see IPasswordHasher notes).
    private const int WorkFactor = 12;

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);

    public bool Verify(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (SaltParseException)
        {
            // A malformed/corrupted stored hash should fail the login, not crash the request.
            return false;
        }
    }
}
```

**Concept:** the concrete adapter for `IPasswordHasher`. `HashPassword` generates a fresh cryptographically
random salt on every call and embeds both the salt and the work factor into the single returned string.

- **Security:** the work factor lives in exactly one named constant — reviewed and bumped in one place as
  hardware gets faster. A fresh random salt per call means two users who happen to pick the same password
  get completely different stored hashes — this defeats precomputed rainbow-table attacks and hides whether
  any two accounts share a password. `Verify` is delegated to the library rather than hand-rolled — bcrypt's
  own comparison is constant-time, and "don't write your own crypto/comparison logic" is a deliberate choice,
  not laziness. One real caveat worth knowing: bcrypt silently truncates input past 72 bytes, so very long
  passwords should be length-validated (not silently accepted) when `AuthService` builds its request
  validation next.
- **Reliability:** `Verify` catches `SaltParseException` and returns `false` instead of letting a corrupted
  or unexpected hash format throw all the way up through a login request — a bad stored value should look
  like "wrong password" to the caller, never a 500.
- **Scalability — where this grows later:** this is the one file that changes if the algorithm is ever
  upgraded (e.g. to Argon2id) — `IPasswordHasher`'s contract doesn't change, only what's behind it.

**`AuthService` (Register) — what it is:**

`Backend/src/Services/Identity/Identity.Application/Services/AuthService.cs`

```csharp
public sealed record RegisterUserRequest(string Email, string Password, string DisplayName);

public sealed record RegisterUserResponse(Guid UserId, string Email, string DisplayName);

public sealed class AuthService
{
    private const int MaxPasswordLength = 72; // bcrypt's effective limit — see BCryptPasswordHasher

    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<RegisterUserResponse>> RegisterAsync(
        RegisterUserRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return Result.Failure<RegisterUserResponse>(
                Error.Validation("User.WeakPassword", "Password must be at least 8 characters."));

        if (request.Password.Length > MaxPasswordLength)
            return Result.Failure<RegisterUserResponse>(
                Error.Validation("User.PasswordTooLong", $"Password cannot exceed {MaxPasswordLength} characters."));

        if (await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken))
            return Result.Failure<RegisterUserResponse>(
                Error.Conflict("User.EmailAlreadyRegistered", "That email is already registered."));

        var passwordHash = _passwordHasher.Hash(request.Password);
        var userResult = User.Register(request.Email, passwordHash, request.DisplayName);
        if (userResult.IsFailure)
            return Result.Failure<RegisterUserResponse>(userResult.Error);

        var user = userResult.Value;
        await _userRepository.AddAsync(user, cancellationToken);

        return new RegisterUserResponse(user.Id, user.Email, user.DisplayName);
    }
}
```

**Concept:** an **Application Service** is a use-case orchestrator — it sequences the *steps* of one
scenario (validate → check preconditions → hash → construct → persist → respond), coordinating the Domain
entity and the interfaces (`IUserRepository`, `IPasswordHasher`) without owning business invariants itself —
those stay inside `User`. `RegisterUserRequest`/`RegisterUserResponse` are **DTOs** (Data Transfer Objects):
plain records shaped around what this one use case needs in and out, not the Domain entity itself. Note the
last line reuses `User<T>`'s implicit conversion from Module 0 — returning `new RegisterUserResponse(...)`
directly works without an explicit `Result.Success(...)` wrap.

- **Security:**
  - `RegisterUserResponse` deliberately has only three fields: `UserId`, `Email`, `DisplayName`. It does
    **not** include `PasswordHash`, `IsActive`, or `Roles` — this is the actual reason DTOs exist at an Api
    boundary. If `User` were ever returned directly from a controller, `PasswordHash` would get serialized
    straight into the HTTP response. A narrow, explicit response type makes that impossible by construction,
    even if `User` gains new sensitive fields later.
  - The password length check (`MaxPasswordLength = 72`) exists *because* of bcrypt's silent 72-byte
    truncation (flagged in `BCryptPasswordHasher`) — rejecting an over-length password outright is safer than
    silently accepting one bcrypt would partially ignore, which could leave someone believing their password
    is stronger than what's actually being checked.
  - The duplicate-email case returns a direct, specific message ("that email is already registered") rather
    than a generic one — unlike *login*, where revealing whether an account exists is a real enumeration
    risk, registration conventionally does confirm this (almost every production signup form does), because
    the endpoint is already an existence oracle by nature. The real mitigation here is rate-limiting/CAPTCHA
    at the Api layer, not obscuring this message — worth knowing as a deliberate, common tradeoff rather than
    an oversight.
  - Cheap checks run before any database or hashing work — garbage input is rejected before it costs a
    repository round-trip or an expensive bcrypt hash.
- **Reliability:** nothing is written to the database until every check has passed — no partial state.
  `AuthService` depends only on `IUserRepository` and `IPasswordHasher`, so it's fully unit-testable with
  fakes — no real database, no real (slow) bcrypt needed in tests. Every failure, from every layer, surfaces
  as the same `Result<T>` shape — the controller (next file) only ever has one kind of failure to handle.
- **Scalability — where this grows later:** future registration rules (email verification before
  activation, invite-only mode, CAPTCHA) are additional steps inside this one method — Domain and
  Infrastructure don't change. The password rule (currently just a length check) is an isolated, swappable
  step — later it could delegate to a dedicated `IPasswordPolicy` (e.g. checking against a breached-password
  list per NIST 800-63B) without touching the rest of the flow. `LoginAsync`, next, will follow the same
  shape and reuse these same two dependencies.

**`ITokenGenerator` — what it is:**

`Backend/src/Services/Identity/Identity.Application/Interfaces/ITokenGenerator.cs`

```csharp
namespace Identity.Application.Interfaces;

public interface ITokenGenerator
{
    /// <summary>A short-lived, signed JWT access token proving who this request is and what roles they hold.</summary>
    string GenerateAccessToken(Guid userId, string email, IReadOnlyList<string> roles);
}
```

**Concept:** a **JWT (JSON Web Token)** is a compact, self-contained token — three base64url parts joined by
dots: `header.payload.signature`. The payload carries **claims** (`sub` = user id, `email`, `role`, ...) —
this is literally what the Architecture table meant by "Identity issues the JWTs every service validates."
Because it's *signed*, not encrypted, any service holding the same signing key (or Identity's public key,
for asymmetric signing) can verify it **locally**, with no call back to Identity's database — this is
**stateless authentication**. Same Dependency Inversion pattern as before: Application only needs "a way to
generate an access token"; which JWT library, which algorithm, and the actual signing key live in
`Identity.Infrastructure`.

- **Security:**
  - Signed ≠ encrypted — the payload is plainly base64-readable by anyone who intercepts it, just
    tamper-*proof*. This is exactly why nothing sensitive (never `PasswordHash`, never anything from
    `Error`'s "unsafe to show" category) can ever go into a JWT claim.
  - Access tokens are deliberately **short-lived** — if one ever leaks (XSS, a stray log line, a proxy),
    the exposure window is bounded. This is also *why* a separate, longer-lived, revocable refresh token
    exists as a different mechanism (a later step) — a stateless JWT can't be un-issued early on its own.
  - Baking `roles` into the token means every service can authorize locally without phoning Identity — but
    it also means revoking a role (e.g. an admin demotes an organizer) doesn't take effect until that user's
    current token expires. Worth knowing as a real limitation, not something to paper over.
  - The signing key is the single most sensitive secret in the whole system — anyone holding it can forge a
    token for *any* user, including an admin. It belongs in `deploy/.env` (already gitignored, already
    CSPRNG-generated, same pattern from Module 0), never hard-coded or committed.
- **Reliability:** as an interface, `AuthService`'s future `LoginAsync` can be unit-tested with a fake
  `ITokenGenerator` — no real signing key or crypto config needed in tests. Stateless validation also means a
  brief Identity outage doesn't break the other 8 services' ability to accept *already-issued* tokens — only
  new logins are affected, not every in-flight authenticated request across the platform.
- **Scalability — where this grows later:** this is the core scalability property of the whole architecture
  — 9 services' worth of requests never make a synchronous call back to Identity just to authenticate; Identity
  is only hit at login/refresh time. Symmetric HMAC signing (the simplest starting implementation) is a
  natural candidate to later upgrade to asymmetric signing (RSA/ECDSA): Identity keeps the private key, every
  other service only needs the public key to verify, so the actual signing secret never has to be distributed
  to 8 other services' configuration. New claims (e.g. a tenant/organization id for multi-tenancy) are
  additive, as long as services tolerate unknown claims gracefully.

**Next:** `JwtTokenGenerator.cs` — the concrete implementation in `Identity.Infrastructure/Security/`, then
`LoginAsync`, then the shared validation piece every other service uses.

---

### Extending `User` — profile fields

Adding Age, Address, First/Last name, Mobile number, Photo, and registration timestamp to the account.
A change to the Model ripples outward through every layer built so far — this is what that ripple looks
like, and where each piece lives:

| Field | Lives in | File |
|---|---|---|
| First name / Last name | `Identity.Domain` | `Entities/User.cs` (replaces the old single `DisplayName`) |
| Date of birth (→ `Age`) | `Identity.Domain` | `Entities/User.cs` — stored as `DateOfBirth`, **not** `Age` directly |
| Mobile number | `Identity.Domain` | `Entities/User.cs` |
| Address | `Identity.Domain` | new `ValueObjects/Address.cs`, referenced from `User.cs` |
| Registered date/time | `Identity.Domain` | already exists — `CreatedAt`, nothing to add |
| Photo | `Identity.Domain` | `User.cs` only stores a `PhotoUrl` string — the upload mechanism itself is a separate, later step |
| Column mapping for all of the above | `Identity.Infrastructure` | `Persistence/IdentityDbContext.cs` — **not done yet, next step** |
| Accepting these fields over HTTP | `Identity.Application` + `Identity.Api` | `AuthService.cs`'s `RegisterUserRequest`, then the controller — **not done yet** |

**`User.cs` (updated) — what changed:**

`Backend/src/Services/Identity/Identity.Domain/Entities/User.cs`

```csharp
using EventFlow.Common.Entities;
using EventFlow.Common.Results;
using Identity.Domain.ValueObjects;

namespace Identity.Domain.Entities;

public sealed class User : Entity<Guid>
{
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string FullName => $"{FirstName} {LastName}";
    public DateOnly DateOfBirth { get; private set; }
    public int Age => CalculateAge(DateOfBirth);
    public string MobileNumber { get; private set; }
    public Address? Address { get; private set; }
    public string? PhotoUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private readonly List<string> _roles = [];
    public IReadOnlyList<string> Roles => _roles;

    private User()
    {
        Email = string.Empty;
        PasswordHash = string.Empty;
        FirstName = string.Empty;
        LastName = string.Empty;
        MobileNumber = string.Empty;
    }

    private User(Guid id, string email, string passwordHash, string firstName, string lastName,
        DateOnly dateOfBirth, string mobileNumber) : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        DateOfBirth = dateOfBirth;
        MobileNumber = mobileNumber;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
        _roles.Add("Customer");
    }

    public static Result<User> Register(
        string email, string passwordHash, string firstName, string lastName,
        DateOnly dateOfBirth, string mobileNumber)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result.Failure<User>(Error.Validation("User.InvalidEmail", "A valid email address is required."));

        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure<User>(Error.Validation("User.InvalidFirstName", "First name is required."));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure<User>(Error.Validation("User.InvalidLastName", "Last name is required."));

        var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);
        if (dateOfBirth > today)
            return Result.Failure<User>(Error.Validation("User.InvalidDateOfBirth", "Date of birth cannot be in the future."));

        if (CalculateAge(dateOfBirth) < 13)
            return Result.Failure<User>(Error.Validation("User.TooYoung", "You must be at least 13 years old to register."));

        if (string.IsNullOrWhiteSpace(mobileNumber))
            return Result.Failure<User>(Error.Validation("User.InvalidMobileNumber", "A mobile number is required."));

        var normalizedEmail = email.Trim().ToLowerInvariant();

        return Result.Success(new User(
            Guid.NewGuid(), normalizedEmail, passwordHash, firstName.Trim(), lastName.Trim(),
            dateOfBirth, mobileNumber.Trim()));
    }

    // Address and photo are intentionally NOT required at registration — added later via profile
    // completion, to keep signup friction (and upfront PII collection) minimal.
    public void SetAddress(Address address) => Address = address;

    public void SetPhoto(string photoUrl) => PhotoUrl = photoUrl;

    public void AssignRole(string role)
    {
        if (!_roles.Contains(role))
            _roles.Add(role);
    }

    public void Deactivate() => IsActive = false;

    private static int CalculateAge(DateOnly dateOfBirth)
    {
        var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth > today.AddYears(-age))
            age--;
        return age;
    }
}
```

**New file — `Address.cs`:**

`Backend/src/Services/Identity/Identity.Domain/ValueObjects/Address.cs`

```csharp
namespace Identity.Domain.ValueObjects;

/// <summary>
/// A VALUE OBJECT, not an entity — two addresses are equal if every field matches; there's no identity
/// to compare. Contrast with User, an Entity&lt;Guid&gt; compared only by Id, no matter what else differs.
/// A record gives this structural equality for free, same as Error did back in the shared kernel.
/// </summary>
public sealed record Address(string Street, string City, string State, string PostalCode, string Country);
```

**Concept:** this is the **Value Object** pattern, foreshadowed back in `Entity.cs`'s own doc comment
("EventFlow.Common doesn't need one yet"). `Address` has no `Id` and no identity of its own — a `User`
doesn't care *which* `Address` instance it holds, only what the fields say; two addresses with identical
fields are simply the same address. That's the opposite of `User`, where two instances with every field
identical except `Id` are still two different people.

Two deliberate modeling choices worth calling out:

- **`DateOfBirth`, not `Age`, is what's stored.** `Age` is *derived* data — it changes every year without
  the user doing anything. Storing `Age` directly means it silently goes stale the moment it's saved;
  computing it from `DateOfBirth` on every read means it's never wrong. This is the same principle as
  `PagedResult.HasMore` being computed from `NextCursor` rather than stored as its own flag, back in the
  shared kernel.
- **`FirstName`/`LastName` replaced the old single `DisplayName`.** Keeping both a `DisplayName` and
  separate name parts would mean two sources of truth that could drift apart (someone updates their last
  name; `DisplayName` doesn't); `FullName` is now a computed property instead, same reasoning as `Age`.

- **Security:**
  - `MobileNumber` and `Address` are personal data (PII) the same way `Email` is — once `IdentityDbContext`
    maps them (next step), they need the same discipline already established: never logged, never returned
    from an endpoint that doesn't need them, and `RegisterUserResponse` (back in `AuthService`) will need
    re-checking to make sure none of these new fields leak into a response that shouldn't carry them.
  - A minimum-age check (13) exists because collecting birthdate/personal data from children triggers real
    legal obligations in most jurisdictions (COPPA in the US, similar rules elsewhere) — rejecting
    underage registration at the Domain boundary is cheaper than discovering the problem after the fact.
  - `PhotoUrl` is a plain `string`, not raw file bytes — Domain never handles the uploaded file itself. That
    keeps all the real security concerns of file upload (content-type sniffing, size limits, malware
    scanning, where the file is actually stored and who can read it back) contained to one future
    Infrastructure/Api piece, instead of leaking into the entity.
- **Reliability:** every new field goes through the same `Result<User>`-returning `Register` factory as
  before — no way to end up with a `User` that has an invalid date of birth or a blank name, any more than
  the original version allowed a blank email.
- **Scalability — where this grows later:**
  - `Address` being a separate type (not just more flat properties on `User`) sets up the exact seam needed
    for Venue's seat-layout coordinates later, mentioned as a future example back when `Entity<TId>` was
    first explained — the same Value Object pattern, reused.
  - `MobileNumber` is a plain string with light validation for now; a dedicated phone-number parsing library
    (e.g. `libphonenumber`) is a natural upgrade once international formats/SMS verification matter, without
    changing `User`'s public shape.
  - `SetAddress`/`SetPhoto` are separate methods from `Register` on purpose — this is the seam for a future
    "complete your profile" use case distinct from registration itself, and for `Address` specifically, EF
    Core will map it as an **owned entity** (next step) rather than a second table, which keeps it simple
    while this stays a 1-user-to-1-address relationship.

**Next:** update `IdentityDbContext` to map these new fields — `Address` specifically as an EF Core **owned
entity**, a new mapping concept distinct from the simple scalar columns mapped so far.

---
