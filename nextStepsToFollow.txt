# Steps to Edit and Extend the Table in the App

## 1. Editing Table Data (Current Setup)
- **File:** `client/src/sampleDataBase/sampleData.json`
- **How:**
  - Open this JSON file and add, edit, or remove objects to update the table rows.
  - Each object should have keys: `S_no`, `name`, `bits_id`, `email_id`, `date`, `category`, `added_by`, `verification_status`, `points`.
- **Effect:**
  - Changes will immediately reflect in the Overview table on the frontend after saving and refreshing the browser.

## 2. Table Display Logic
- **File:** `client/src/frontEnd/components/layout/Table.tsx`
- **How:**
  - This file fetches and displays data from `sampleData.json`.
  - To change table columns or formatting, edit the JSX in this file.
- **Future SQL Integration Placeholder:**
  - There is a commented-out `useEffect` block for fetching from `/api/sampletestdata`.
  - When backend and SQL are ready, uncomment and use this block, and remove the JSON fetch logic.

## 3. Adding SQL Integration (Future)
- **Backend Business Logic:**
  - **File:** `server/src/records.ts`
  - **How:**
    - This file contains functions for filtering, verifying, and managing records.
    - To add SQL integration, update these functions to fetch/update data from the SQL database instead of in-memory arrays.
- **Backend API Route:**
  - **File:** `server/src/routes/sampleTestDataRoutes.ts`
  - **How:**
    - This Express route fetches data from the SQL table `SAMPLETESTDATA`.
    - You may edit the SQL query or add more endpoints as needed.
- **Backend Route Registration:**
  - **File:** `server/src/index.ts`
  - **How:**
    - Ensure `sampleTestDataRoutes` is imported and registered with `app.use('/api', sampleTestDataRoutes);`
- **Database Connection:**
  - **File:** `server/src/config/db.ts`
  - **How:**
    - Edit DB credentials or connection logic here if needed.
- **SQL Table Definition:**
  - **File:** `client/src/sampleDataBase/sample.sql`
  - **How:**
    - Edit this file to change the SQL schema or add sample data for the database.

## 4. Switching from JSON to SQL
- In `Table.tsx`, replace the fetch to `sampleData.json` with a fetch to `/api/sampletestdata` (uncomment the placeholder code).
- Ensure backend and database are running and accessible.
- Remove or archive `sampleData.json` if no longer needed.

## 5. General App Usage
- **Frontend:**
  - Start in `client` folder: `npm run dev`
  - Edit UI in `client/src/frontEnd/components/` and `client/src/frontEnd/views/`
- **Backend:**
  - Start in `server` folder: `npm run dev`
  - Edit API logic in `server/src/routes/` and DB config in `server/src/config/`
- **Database:**
  - Use `sample.sql` to set up or update the SQL schema.

## 6. Where to Edit for Each Aspect
- **Table Data (now):** `client/src/sampleDataBase/sampleData.json`
- **Table Columns/UI:** `client/src/frontEnd/components/layout/Table.tsx`
- **Backend Business Logic:** `server/src/records.ts`
- **Backend API:** `server/src/routes/sampleTestDataRoutes.ts`
- **Backend Route Registration:** `server/src/index.ts`
- **DB Connection:** `server/src/config/db.ts`
- **SQL Schema:** `client/src/sampleDataBase/sample.sql`

## 7. SQL Integration Points (for future)
- **Replace JSON fetch in:** `client/src/frontEnd/components/layout/Table.tsx`
- **Backend business logic in:** `server/src/records.ts` (update functions to use SQL queries)
- **Backend fetch logic in:** `server/src/routes/sampleTestDataRoutes.ts`
- **DB credentials/config in:** `server/src/config/db.ts`

---

**Summary:**
- Edit `sampleData.json` for now.
- When ready, switch to SQL by updating fetch logic and ensuring backend/database are running.
- All file paths above are relative to `project_delphi_training`.
