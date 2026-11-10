export type OrderStatus = "pending" | "done";

export type OrderItem = {
  id: string;
  productKey: string;
  label: string;
  quantity: number;
  unitPrice: number;
  note: string | null;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string | null;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  notes: string | null;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
};

export type OrderInput = {
  customerName: string;
  phone?: string | null;
  date: string;
  time: string;
  notes?: string | null;
  items: { productKey: string; quantity: number; note?: string | null }[];
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
