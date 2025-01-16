import { Request, Response } from "express";
import { getTrainsByCities } from "../models/trainModel";

interface SearchCitiesBodyParams {
  from: string;
  to: string;
}

const searchCities = async (
  req: Request<{}, {}, SearchCitiesBodyParams>,
  res: Response
): Promise<void> => {
  const { from, to } = req.body;

  try {
    const trains = await getTrainsByCities(from, to);

    if (trains.length === 0) {
      res.status(404).json({
        success: false,
        message: `No trains found between ${from} and ${to}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Trains found.",
      data: trains,
    });
  } catch (error) {
    console.error("Error searching for cities or trains:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { searchCities };
