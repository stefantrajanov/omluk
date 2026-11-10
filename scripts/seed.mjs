// Seeds example orders. Usage: pnpm seed | pnpm seed:clear
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { itemLabel, parseProductKey, productKey, unitPrice } from "../src/lib/menu.ts";
import { addDaysISO, formatHM, nowHM, parseISODate, todayISO } from "../src/lib/dates.ts";

const IDS_FILE = new URL("../supabase/.seed-ids.json", import.meta.url);

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (run via pnpm seed).");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

// Item shorthands
const pie = (size, meat, filling, quantity, note) => ({
  sel: { category: "pie", size, meat, filling },
  quantity,
  note,
});
const eggsPie = (size, quantity, note) => ({ sel: { category: "eggs_pie", size }, quantity, note });
const pizza = (size, quantity, note) => ({ sel: { category: "pizza", size }, quantity, note });
const bake = (size, quantity, note) => ({ sel: { category: "bake_only", size }, quantity, note });

// Today's showcase. Pieces per hour: 7→3, 9→4, 11→5, 12→19 (over), 13→14 (near), 15→5, 17→10, 18→3, 20→2
const TODAY = [
  { time: "07:15", name: "Петар Николовски", phone: "070 555 011", items: [pie("large", "pork", "cheese", 2)] },
  { time: "07:45", name: "Елена", items: [eggsPie("small", 1)], notes: "Да биде добро печена" },
  { time: "09:30", name: "Горан Стојановски", phone: "071 555 012", items: [pie("small", "chicken", "cheese_eggs", 2), pizza("small", 1, "маргарита"), bake("small", 1)] },
  { time: "11:00", name: "Марија", items: [pie("large", "chicken", "eggs", 3)], notes: "Се плаќа при подигање" },
  { time: "11:45", name: "Бојан Трајковски", phone: "075 555 013", items: [pizza("large", 1, "пеперони"), pizza("large", 1, "вегетаријанска")] },
  { time: "12:00", name: "Зоран Петровски", phone: "070 555 014", items: [bake("large", 6), bake("small", 4)], notes: "За слава, ќе дојдат со комбе" },
  { time: "12:15", name: "Ивана", items: [pie("large", "pork", "eggs", 2), pie("small", "pork", "cheese", 2)] },
  { time: "12:30", name: "Никола Јовановски", phone: "078 555 015", items: [eggsPie("large", 3)], notes: "Ќе дојде по неа сопругата" },
  { time: "12:45", name: "Билјана", items: [pizza("small", 1, "капричиоза"), pizza("small", 1, "обична")] },
  { time: "13:15", name: "Александар", items: [pie("large", "chicken", "eggs", 2)] },
  { time: "13:15", name: "Маја", items: [pie("small", "pork", "eggs", 1)] },
  { time: "13:30", name: "Душан", items: [eggsPie("large", 2)] },
  { time: "13:30", name: "Спасен", items: [pizza("large", 1, "пеперони"), pizza("large", 1, "капричиоза"), pizza("large", 1, "обична")] },
  { time: "13:45", name: "Ана Димитровска", phone: "071 555 016", items: [pie("large", "chicken", "cheese", 3), pie("small", "chicken", "cheese_eggs", 3)], notes: "Без лук" },
  { time: "15:00", name: "Стефан", items: [bake("large", 3)] },
  { time: "15:30", name: "Весна Илиевска", phone: "070 555 017", items: [pie("small", "pork", "cheese_eggs", 2)], notes: "Да се јави кога е готово" },
  { time: "17:15", name: "Драган Ристовски", phone: "075 555 018", items: [pie("large", "pork", "cheese_eggs", 4), pie("large", "chicken", "cheese_eggs", 4)], notes: "Се плаќа при подигање" },
  { time: "17:45", name: "Катерина", items: [pizza("small", 2, "пеперони")] },
  { time: "18:30", name: "Мартин Георгиевски", items: [eggsPie("small", 3)] },
  { time: "20:00", name: "Сашка", phone: "078 555 019", items: [pie("small", "chicken", "eggs", 2)] },
];

// Deterministic PRNG (mulberry32)
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = prng(20261110);
const pick = (list) => list[Math.floor(rand() * list.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

const FIRST = ["Александар", "Ана", "Бојан", "Валентина", "Горан", "Даниела", "Дејан", "Елена", "Зоран", "Ивана", "Јована", "Кирил", "Љупчо", "Марија", "Марко", "Миле", "Наташа", "Никола", "Оливера", "Петар", "Рада", "Сашо", "Снежана", "Тамара", "Тони", "Христина", "Филип", "Цветанка", "Борче", "Весна"];
const LAST = ["Петровски", "Стојанова", "Николовски", "Илиевска", "Трајковски", "Јованова", "Ристовски", "Митрева", "Костовски", "Атанасова"];
const NOTES = ["Да биде добро печена", "Ќе дојде по неа сопругата", "Без лук", "Се плаќа при подигање", "Да се јави кога е готово", "Да се исече на парчиња"];
const PIZZA_NOTES = ["пеперони", "капричиоза", "обична", "маргарита", "со печурки"];

function randomItem() {
  const size = rand() < 0.6 ? "large" : "small";
  const r = rand();
  if (r < 0.45) return pie(size, pick(["pork", "chicken"]), pick(["eggs", "cheese", "cheese_eggs"]), int(1, 3));
  if (r < 0.65) return eggsPie(size, int(1, 3));
  if (r < 0.85) return pizza(size, int(1, 2), pick(PIZZA_NOTES));
  return bake(size, int(1, 4));
}

function randomOrder(n) {
  const big = n % 9 === 4; // occasional large order
  const items = big
    ? [bake("large", int(4, 6)), pie("large", pick(["pork", "chicken"]), pick(["eggs", "cheese", "cheese_eggs"]), int(4, 6))]
    : Array.from({ length: rand() < 0.7 ? 1 : 2 }, randomItem);
  const name = rand() < 0.5 ? `${pick(FIRST)} ${pick(LAST)}` : pick(FIRST);
  return {
    time: formatHM(int(7, 20), pick([0, 15, 30, 45])),
    name,
    phone: rand() < 0.5 ? `07${pick([0, 1, 5, 8])} 555 ${String(20 + (n % 80)).padStart(3, "0")}` : undefined,
    notes: rand() < 0.33 ? pick(NOTES) : undefined,
    items,
  };
}

let serial = 0;
const randomDay = (count) =>
  Array.from({ length: count }, () => randomOrder(serial++)).sort((a, b) => a.time.localeCompare(b.time));

// Same payload shape as buildSavePayload in src/lib/orders/validation.ts
function toPayload(date, o) {
  const items = o.items.map((it) => {
    const key = productKey(it.sel);
    const sel = parseProductKey(key);
    if (!sel) throw new Error(`Bad product key ${key}`);
    return {
      product_key: key,
      label: itemLabel(sel),
      quantity: it.quantity,
      unit_price: unitPrice(sel),
      note: it.note ?? null,
    };
  });
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  return {
    order: {
      customer_name: o.name,
      phone: o.phone ?? null,
      order_date: date,
      order_time: o.time,
      notes: o.notes ?? null,
      total,
    },
    items,
  };
}

function buildPlan() {
  const today = todayISO();
  const nowHour = nowHM().hour;
  const plan = [];

  // Today: past hours done, except the latest past order stays pending
  const pastIdx = TODAY.map((o, i) => (Number(o.time.slice(0, 2)) < nowHour ? i : -1)).filter((i) => i >= 0);
  const keepPending = pastIdx.at(-1);
  TODAY.forEach((o, i) => plan.push({ date: today, o, done: pastIdx.includes(i) && i !== keepPending }));

  // Previous two days: mostly done
  for (const [offset, count] of [[-2, 7], [-1, 9]]) {
    randomDay(count).forEach((o, i) => plan.push({ date: addDaysISO(today, offset), o, done: i !== 2 }));
  }

  // Next 10 days: weekends busier, first Monday empty
  let mondaySeen = false;
  for (let offset = 1; offset <= 10; offset++) {
    const date = addDaysISO(today, offset);
    const dow = parseISODate(date).getDay();
    let count = dow === 0 || dow === 6 ? int(7, 9) : int(1, 5);
    if (dow === 1 && !mondaySeen) {
      mondaySeen = true;
      count = 0;
    }
    randomDay(count).forEach((o) => plan.push({ date, o, done: false }));
  }
  return plan;
}

async function clear() {
  if (!existsSync(IDS_FILE)) {
    console.log("Nothing to clear.");
    return;
  }
  const ids = JSON.parse(readFileSync(IDS_FILE, "utf8"));
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await db.from("orders").delete().in("id", ids.slice(i, i + 100));
    if (error) throw error;
  }
  unlinkSync(IDS_FILE);
  console.log(`Deleted ${ids.length} seeded orders.`);
}

async function seed() {
  await clear();
  const ids = [];
  const doneIds = [];
  for (const { date, o, done } of buildPlan()) {
    const { order, items } = toPayload(date, o);
    const { data: id, error } = await db.rpc("save_order", { p_id: null, p_order: order, p_items: items });
    if (error) throw error;
    ids.push(id);
    writeFileSync(IDS_FILE, JSON.stringify(ids, null, 2));
    if (done) doneIds.push(id);
  }
  if (doneIds.length) {
    const { error } = await db.from("orders").update({ status: "done" }).in("id", doneIds);
    if (error) throw error;
  }
  console.log(`Inserted ${ids.length} orders (${doneIds.length} done).`);
}

const run = process.argv.includes("--clear") ? clear : seed;
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
