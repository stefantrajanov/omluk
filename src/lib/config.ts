export const SHOP_NAME = "Фурна Омлук Коцеви";
export const SHOP_TIME_ZONE = "Europe/Skopje";

/** Max pieces (pies + pizzas) the oven can bake per hour. Soft limit. */
export const HOURLY_CAPACITY = 16;
/** Share of capacity at which an hour is shown as nearly full. */
export const CAPACITY_WARNING_RATIO = 0.75;

/** Working hours shown on the timeline: [start, end). */
export const WORK_START_HOUR = 6;
export const WORK_END_HOUR = 22;

export const SLOT_MINUTES = [0, 15, 30, 45] as const;

export const REFRESH_INTERVAL_MS = 60_000;

export const CURRENCY = "ден.";
