import { getDb, seed } from "./db";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const db = getDb();
seed(db);

// Pinned to 3000 for production. In dev, set API_PORT=3001 to run alongside Vite.
const PORT = parseInt(process.env.API_PORT || "3000", 10);
const HOST = "0.0.0.0";
const CLIENT_DIR = join(import.meta.dir, "..", "dist");

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getUserId(): number {
  return 1;
}

function getUserTier(): string {
  const row = db.query("SELECT tier FROM users WHERE id = ?").get(getUserId()) as { tier: string } | null;
  return row?.tier || "free";
}

function handleGetEntries(url: URL): Response {
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const userId = getUserId();

  const rows = db
    .query(
      `SELECT id, user_id, food_name, calories, protein, carbs, fat,
              fiber, sugar, saturated_fat, sodium, cholesterol,
              meal_type, date, created_at, photo_url
       FROM food_entries
       WHERE user_id = ? AND date = ?
       ORDER BY created_at DESC`
    )
    .all(userId, date);

  return json(rows);
}

function handlePostEntries(req: Request): Response | Promise<Response> {
  return req.json().then((body: Record<string, unknown>) => {
    const { food_name, calories, protein, carbs, fat, fiber, sugar, saturated_fat, sodium, cholesterol, meal_type, date, photo_url } = body;
    const userId = getUserId();

    if (!food_name) return json({ error: "food_name is required" }, 400);

    const entryDate = (date as string) || new Date().toISOString().slice(0, 10);

    const result = db.run(
      `INSERT INTO food_entries (user_id, food_name, calories, protein, carbs, fat, fiber, sugar, saturated_fat, sodium, cholesterol, meal_type, date, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        food_name as string,
        (calories as number) || 0,
        (protein as number) || 0,
        (carbs as number) || 0,
        (fat as number) || 0,
        (fiber as number) || 0,
        (sugar as number) || 0,
        (saturated_fat as number) || 0,
        (sodium as number) || 0,
        (cholesterol as number) || 0,
        (meal_type as string) || "snack",
        entryDate,
        (photo_url as string) || null,
      ]
    );

    const entry = db.query("SELECT * FROM food_entries WHERE id = ?").get(result.lastInsertRowid);
    return json(entry, 201);
  });
}

function handleDeleteEntry(id: number): Response {
  const userId = getUserId();
  const existing = db
    .query("SELECT id FROM food_entries WHERE id = ? AND user_id = ?")
    .get(id, userId);

  if (!existing) return json({ error: "Entry not found" }, 404);

  db.run("DELETE FROM food_entries WHERE id = ? AND user_id = ?", [id, userId]);
  return json({ success: true });
}

function handleDashboard(url: URL): Response {
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const userId = getUserId();

  const entries = db
    .query(
      `SELECT id, food_name, calories, protein, carbs, fat,
              fiber, sugar, saturated_fat, sodium, cholesterol,
              meal_type, date, created_at, photo_url
       FROM food_entries WHERE user_id = ? AND date = ? ORDER BY created_at DESC`
    )
    .all(userId, date) as Array<{
      id: number; food_name: string; calories: number; protein: number;
      carbs: number; fat: number; fiber: number; sugar: number;
      saturated_fat: number; sodium: number; cholesterol: number;
      meal_type: string; date: string; created_at: string;
      photo_url: string | null;
    }>;

  const goals = db
    .query(`SELECT calorie_goal, protein_goal, carbs_goal, fat_goal,
                   fiber_goal, sugar_goal, saturated_fat_goal, sodium_goal, cholesterol_goal
            FROM daily_goals WHERE user_id = ?`)
    .get(userId) as {
      calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number;
      fiber_goal: number | null; sugar_goal: number | null;
      saturated_fat_goal: number | null; sodium_goal: number | null; cholesterol_goal: number | null;
    } | null;

  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturated_fat: 0, sodium: 0, cholesterol: 0 };
  for (const e of entries) {
    totals.calories += e.calories;
    totals.protein += e.protein;
    totals.carbs += e.carbs;
    totals.fat += e.fat;
    totals.fiber += e.fiber || 0;
    totals.sugar += e.sugar || 0;
    totals.saturated_fat += e.saturated_fat || 0;
    totals.sodium += e.sodium || 0;
    totals.cholesterol += e.cholesterol || 0;
  }

  const g = goals || {
    calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65,
    fiber_goal: 25, sugar_goal: 50, saturated_fat_goal: 20, sodium_goal: 2300, cholesterol_goal: 300,
  };

  const pct = (value: number, goal: number | null) =>
    goal && goal > 0 ? Math.round((value / goal) * 100) : 0;

  return json({
    date,
    entries,
    totals,
    goals: g,
    progress: {
      calories: pct(totals.calories, g.calorie_goal),
      protein: pct(totals.protein, g.protein_goal),
      carbs: pct(totals.carbs, g.carbs_goal),
      fat: pct(totals.fat, g.fat_goal),
      fiber: pct(totals.fiber, g.fiber_goal),
      sugar: pct(totals.sugar, g.sugar_goal),
      saturated_fat: pct(totals.saturated_fat, g.saturated_fat_goal),
      sodium: pct(totals.sodium, g.sodium_goal),
      cholesterol: pct(totals.cholesterol, g.cholesterol_goal),
    },
  });
}

function handleWeeklyHistory(url: URL): Response {
  const dateStr = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const userId = getUserId();

  // Compute 7-day window ending on `dateStr` (inclusive)
  const endDate = new Date(dateStr + "T00:00:00");
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);
  const startStr = startDate.toISOString().slice(0, 10);

  // Aggregate food entries per day
  const rows = db
    .query(
      `SELECT dates.dte AS date,
              COALESCE(SUM(fe.calories), 0) AS total_calories,
              COALESCE(SUM(fe.protein), 0) AS protein,
              COALESCE(SUM(fe.carbs), 0) AS carbs,
              COALESCE(SUM(fe.fat), 0) AS fat,
              COALESCE(SUM(fe.fiber), 0) AS fiber,
              COALESCE(SUM(fe.sugar), 0) AS sugar,
              COALESCE(SUM(fe.saturated_fat), 0) AS saturated_fat,
              COALESCE(SUM(fe.sodium), 0) AS sodium,
              COALESCE(SUM(fe.cholesterol), 0) AS cholesterol,
              COALESCE(g.calorie_goal, 2000) AS goal_calories
       FROM (
         SELECT date(?, '+' || d || ' days') AS dte
         FROM (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
               UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6)
       ) dates
       LEFT JOIN food_entries fe ON fe.date = dates.dte AND fe.user_id = ?
       LEFT JOIN daily_goals g ON g.user_id = ?
       GROUP BY dates.dte
       ORDER BY dates.dte ASC`
    )
    .all(startStr, userId, userId) as Array<{
    date: string;
    total_calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    saturated_fat: number;
    sodium: number;
    cholesterol: number;
    goal_calories: number;
  }>;

  return json(rows);
}

function handleGetGoals(): Response {
  const goals = db
    .query(`SELECT calorie_goal, protein_goal, carbs_goal, fat_goal,
                   fiber_goal, sugar_goal, saturated_fat_goal, sodium_goal, cholesterol_goal,
                   date
            FROM daily_goals WHERE user_id = ?`)
    .get(getUserId());
  return json(goals || {
    calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65,
    fiber_goal: 25, sugar_goal: 50, saturated_fat_goal: 20, sodium_goal: 2300, cholesterol_goal: 300,
  });
}

function handleUpdateGoals(req: Request): Response | Promise<Response> {
  // Gating: only pro users can update goals
  if (getUserTier() !== "pro") {
    return json({ error: "Upgrade to Pro to customize your nutrition goals" }, 403);
  }
  return req.json().then((body: Record<string, unknown>) => {
    const userId = getUserId();
    const { calorie_goal, protein_goal, carbs_goal, fat_goal,
            fiber_goal, sugar_goal, saturated_fat_goal, sodium_goal, cholesterol_goal } = body;

    const existing = db.query("SELECT id FROM daily_goals WHERE user_id = ?").get(userId);

    if (existing) {
      db.run(
        `UPDATE daily_goals SET
           calorie_goal=?, protein_goal=?, carbs_goal=?, fat_goal=?,
           fiber_goal=?, sugar_goal=?, saturated_fat_goal=?, sodium_goal=?, cholesterol_goal=?,
           date=date('now')
         WHERE user_id=?`,
        [
          (calorie_goal as number) ?? 2000,
          (protein_goal as number) ?? 150,
          (carbs_goal as number) ?? 250,
          (fat_goal as number) ?? 65,
          (fiber_goal as number) ?? 25,
          (sugar_goal as number) ?? 50,
          (saturated_fat_goal as number) ?? 20,
          (sodium_goal as number) ?? 2300,
          (cholesterol_goal as number) ?? 300,
          userId,
        ]
      );
    } else {
      db.run(
        `INSERT INTO daily_goals (user_id, calorie_goal, protein_goal, carbs_goal, fat_goal,
           fiber_goal, sugar_goal, saturated_fat_goal, sodium_goal, cholesterol_goal)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          (calorie_goal as number) ?? 2000,
          (protein_goal as number) ?? 150,
          (carbs_goal as number) ?? 250,
          (fat_goal as number) ?? 65,
          (fiber_goal as number) ?? 25,
          (sugar_goal as number) ?? 50,
          (saturated_fat_goal as number) ?? 20,
          (sodium_goal as number) ?? 2300,
          (cholesterol_goal as number) ?? 300,
        ]
      );
    }
    return handleGetGoals();
  });
}

function handleGetTier(): Response {
  const tier = getUserTier();
  const features = {
    free: [
      "Manual food logging",
      "Basic dashboard",
      "Daily calorie goal",
      "3 saved meals per day",
      "Weekly trend charts",
      "History view",
    ],
    pro: [
      "Unlimited meal logging",
      "Barcode scanning",
      "Photo meal logging",
      "Macros & micronutrients",
      "Custom nutrition goals",
      "Data export",
    ],
  };
  return json({ tier, features: features[tier] });
}

function handleUpdateTier(): Response {
  const userId = getUserId();
  db.run("UPDATE users SET tier = 'pro' WHERE id = ?", [userId]);
  return json({ tier: "pro", features: [
    "Unlimited meal logging",
    "Barcode scanning",
    "Photo meal logging",
    "Macros & micronutrients",
    "Custom nutrition goals",
    "Data export",
  ]});
}

function handleMealCount(url: URL): Response {
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const userId = getUserId();
  const row = db.query(
    "SELECT COUNT(*) as count FROM food_entries WHERE user_id = ? AND date = ?"
  ).get(userId, date) as { count: number } | null;
  return json({ count: row?.count || 0, limit: 3 });
}

function handleOnboarding(): Response {
  const userId = getUserId();
  
  // Check if user has any food entries at all
  const entryCount = db.query(
    "SELECT COUNT(*) as count FROM food_entries WHERE user_id = ?"
  ).get(userId) as { count: number } | null;
  
  // Check if user has custom goals (not the defaults)
  const goals = db.query(
    "SELECT calorie_goal FROM daily_goals WHERE user_id = ?"
  ).get(userId) as { calorie_goal: number } | null;
  
  const hasEntries = (entryCount?.count || 0) > 0;
  const hasCustomGoals = goals !== null && goals.calorie_goal !== 2000;
  
  // Onboarding is needed only if no entries AND no custom goals
  const needsOnboarding = !hasEntries && !hasCustomGoals;
  
  return json({ needsOnboarding });
}

function handleExportCSV(url: URL): Response {
  // Only Pro users can export
  if (getUserTier() !== "pro") {
    return json({ error: "Upgrade to Pro to export data" }, 403);
  }
  
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const userId = getUserId();
  
  const rows = db
    .query(
      `SELECT food_name, calories, protein, carbs, fat, fiber, sugar, 
              saturated_fat, sodium, cholesterol, meal_type, date, created_at
       FROM food_entries
       WHERE user_id = ? AND date = ?
       ORDER BY created_at ASC`
    )
    .all(userId, date) as Array<Record<string, unknown>>;
  
  const headers = ["Food", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", 
                   "Fiber (g)", "Sugar (g)", "Sat. Fat (g)", "Sodium (mg)", 
                   "Cholesterol (mg)", "Meal Type", "Date"];
  
  const csvRows = [headers.join(",")];
  for (const row of rows) {
    csvRows.push([
      `"${String(row.food_name || "").replace(/"/g, '""')}"`,
      row.calories,
      row.protein,
      row.carbs,
      row.fat,
      row.fiber,
      row.sugar,
      row.saturated_fat,
      row.sodium,
      row.cholesterol,
      `"${row.meal_type}"`,
      `"${row.date}"`,
    ].join(","));
  }
  
  const csv = csvRows.join("\n");
  
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="nibble-export-${date}.csv"`,
    },
  });
}

async function handleUpload(req: Request): Promise<Response> {
  const uploadsDir = join(import.meta.dir, "..", "public", "uploads");
  try {
    if (!existsSync(uploadsDir)) {
      await Bun.$`mkdir -p ${uploadsDir}`.quiet();
    }
  } catch {
    // directory creation failed, try anyway
  }

  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!file || !(file instanceof File)) {
      return json({ error: "No photo file provided" }, 400);
    }

    const ext = file.name.slice(file.name.lastIndexOf(".")) || ".jpg";
    const filename = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = join(uploadsDir, filename);

    await Bun.write(filePath, file);

    return json({ url: `/uploads/${filename}` });
  } catch {
    return json({ error: "Upload failed" }, 500);
  }
}

function serveStatic(pathname: string): Response | null {
  let filePath = join(CLIENT_DIR, pathname === "/" ? "index.html" : pathname);
  if (!existsSync(filePath)) filePath = join(CLIENT_DIR, "index.html");
  if (!existsSync(filePath)) return null;

  const ext = filePath.slice(filePath.lastIndexOf("."));
  const contentType = MIME[ext] || "application/octet-stream";
  return new Response(readFileSync(filePath), { headers: { "Content-Type": contentType } });
}

// Free the port, then bind
await Bun.$`sudo sh -c 'lsof -t -iTCP:${PORT} -sTCP:LISTEN | xargs -r kill' 2>/dev/null || true`.quiet().nothrow();
await Bun.sleep(200);

for (let attempt = 1; ; attempt++) {
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req) {
        const url = new URL(req.url);
        const pathname = url.pathname;

        if (pathname === "/api/entries" && req.method === "GET") return handleGetEntries(url);
        if (pathname === "/api/entries" && req.method === "POST") return handlePostEntries(req);

        const deleteMatch = pathname.match(/^\/api\/entries\/(\d+)$/);
        if (deleteMatch && req.method === "DELETE") return handleDeleteEntry(parseInt(deleteMatch[1]));

        if (pathname === "/api/dashboard" && req.method === "GET") return handleDashboard(url);
        if (pathname === "/api/history/weekly" && req.method === "GET") return handleWeeklyHistory(url);
        if (pathname === "/api/goals" && req.method === "GET") return handleGetGoals();
        if (pathname === "/api/goals" && req.method === "PUT") return handleUpdateGoals(req);

        if (pathname === "/api/user/tier" && req.method === "GET") return handleGetTier();
        if (pathname === "/api/user/tier" && req.method === "PUT") return handleUpdateTier();
        if (pathname === "/api/user/meal-count" && req.method === "GET") return handleMealCount(url);

        if (pathname === "/api/user/onboarding" && req.method === "GET") return handleOnboarding();
        if (pathname === "/api/entries/export" && req.method === "GET") return handleExportCSV(url);

        if (pathname === "/api/uploads" && req.method === "POST") return handleUpload(req);

        const sr = serveStatic(pathname);
        if (sr) return sr;
        return new Response("Not Found", { status: 404 });
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`Nibble server running on http://${HOST}:${PORT}`);
