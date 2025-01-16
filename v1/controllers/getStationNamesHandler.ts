import { Request, Response } from "express";
import { getAllStation } from "../models/stationModel";

const getStationNamesHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stations = await getAllStation();
    const stationNames = stations.map((station) => station.station_name);
    return res.status(200).json({
      success: true,
      message: "Station names retrieved successfully.",
      data: stationNames,
    });
  } catch (error) {
    console.error("Error fetching station names:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { getStationNamesHandler };
