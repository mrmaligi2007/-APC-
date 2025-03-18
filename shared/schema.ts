import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unitNumber: text("unit_number").notNull(),
  password: text("password").notNull(),
  relaySettings: text("relay_settings").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  deviceId: serial("device_id").references(() => devices.id),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  serialNumber: text("serial_number").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(), 
  deviceId: serial("device_id").references(() => devices.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  success: boolean("success").notNull(),
  category: text("category").notNull()
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true
});

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
