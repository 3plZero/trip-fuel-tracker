

## Technology Trainings Tracking System

A new system module for tracking DOST-CAR technology trainings, based on the spreadsheet format shown. This will allow users to create, manage, and report on trainings conducted across provinces in the Cordillera Administrative Region.

### What It Does
- Track technology trainings with details like title, date, venue, participants, firms assisted, resource persons, and expenditures
- Organize trainings by province (Abra, Apayao, Benguet, Ifugao, Kalinga, Mountain Province, Baguio City)
- Dashboard with summary statistics (total trainings, participants, expenses)
- Print-friendly report view matching the DOST-CAR spreadsheet format

---

### Technical Details

#### 1. Database Table: `technology_trainings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| province | text | e.g., Abra, Benguet, Baguio City |
| title | text | Title of training (required) |
| training_date_start | date | Start date |
| training_date_end | date | End date (nullable, for multi-day) |
| venue | text | Include municipality and barangay |
| participants_total | integer | Total participants |
| participants_female | integer | Female count |
| participants_male | integer | Male count |
| participants_senior | integer | Senior citizens |
| participants_differently_abled | integer | Differently-abled |
| firms_assisted | integer | Number of firms assisted |
| firm_names | text | Names of firms (comma-separated or free text) |
| resource_persons | text | Resource person names |
| counterpart | text | Counterpart details |
| approved_amount | numeric | Approved budget amount |
| actual_expenses | numeric | Actual DOST-CAR expenses |
| remarks | text | Additional notes |
| status | text | draft / completed |
| created_by | uuid | User who created |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

RLS policies will follow the same pattern as other tables (authenticated users can CRUD).

#### 2. New Pages

| Page | Route | Purpose |
|------|-------|---------|
| TrainingsDashboard | /trainings-dashboard | Summary stats and charts |
| Trainings | /trainings | List all trainings with filters |
| TrainingForm | /trainings/new, /trainings/:id/edit | Create/edit a training |
| TrainingView | /trainings/:id | View training details |

#### 3. Navigation Updates

- **Home page (`Home.tsx`)**: Add a 5th system card -- "Technology Trainings" with a `GraduationCap` icon and rose/pink gradient
- **AppLayout.tsx**: Add `technology-trainings` to the system selector and its navigation links (Dashboard, All Trainings)
- **App.tsx**: Add routes for all 4 new pages

#### 4. Dashboard Features
- Total trainings count
- Total participants (with gender breakdown)
- Total firms assisted
- Total expenditures vs approved amounts
- Breakdown by province (table or chart)

#### 5. Trainings List Page
- Table showing all trainings with key columns
- Filter by province, date range, status
- Search by title or venue

#### 6. Training Form
- All fields from the database table
- Province dropdown with CAR provinces
- Date picker for start/end dates
- Participant counts with auto-total calculation
- Currency inputs for amounts

#### 7. Files to Create/Modify

**New files:**
- `src/pages/TrainingsDashboard.tsx`
- `src/pages/Trainings.tsx`
- `src/pages/TrainingForm.tsx`
- `src/pages/TrainingView.tsx`

**Modified files:**
- `src/pages/Home.tsx` -- add system card
- `src/components/layout/AppLayout.tsx` -- add nav entries and system type
- `src/App.tsx` -- add routes
- Database migration for `technology_trainings` table

