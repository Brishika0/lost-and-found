import express from "express";
import {
  getZones,
  getZoneById,
  getNearbyZones,
  createZone,
  updateZone,
  deleteZone,
  addRoomToZone,
  removeRoomFromZone,
} from "../controller/zone.controller";
import { auth, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

//  PUBLIC ROUTES
// These require collegeId in query
router.get("/", getZones);
router.get("/nearby", getNearbyZones);
router.get("/:id", getZoneById);

//  PROTECTED ROUTES (Admin Only)
router.use(auth);
router.use(requireRole(["college_admin", "super_admin"]));

// Zone CRUD
router.post("/", createZone);
router.put("/:id", updateZone);
router.delete("/:id", deleteZone);

// Room management
router.post("/:id/rooms", addRoomToZone);
router.delete("/:id/rooms/:roomNumber", removeRoomFromZone);

export default router;
