import express, { Router, Request, Response, NextFunction } from "express";
import {
  createStationHandler,
  getAllStationHandler,
  getStationByIdHandler,
  updateStationByIdHandler,
  deleteStationByIdHandler,
} from "../controllers/stationController";

const router: Router = express.Router();

router.post(
  "/create_station",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createStationHandler(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/get_station",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllStationHandler(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/get_station_by_id/:id",
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await getStationByIdHandler(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/update_station_by_id/:id",
  async (
    req: Request<{ id: string }>, 
    res: Response,
    next: NextFunction
  ) => {
    try {
      await updateStationByIdHandler(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/delete_station_by_id/:id",
  async (
    req: Request<{ id: string }>, 
    res: Response,
    next: NextFunction
  ) => {
    try {
      await deleteStationByIdHandler(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
