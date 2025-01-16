import express, { Request, Response } from "express";
import { searchCities } from "../controllers/searchController";

const router = express.Router();

interface SearchCitiesBodyParams {
  from: string;
  to: string;
}

router.post(
  "/search", 
  express.json(), 
  async (req: Request<{}, {}, SearchCitiesBodyParams>, res: Response) => {
    try {
      await searchCities(req, res); 
    } catch (error) {
      console.error("Error during city search:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during city search.",
      });
    }
  }
);

export default router;
