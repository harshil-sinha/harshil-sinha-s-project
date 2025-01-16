import { Request, Response } from "express";
import {
  createStation,
  getAllStation,
  getStationById,
  updateStationById,
  deleteStationById,
} from "../models/stationModel";

interface StationRequestBody {
  station_name: string;
  location: string;
  station_code: string;
}

const createStationHandler = async (
  req: Request<{}, {}, StationRequestBody>,
  res: Response
): Promise<Response> => {
  const { station_name, location, station_code } = req.body;

  try {
    const newStation = await createStation(
      station_name,
      location,
      station_code
    );
    return res
      .status(201)
      .json({ message: "Station created successfully", station: newStation });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllStationHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stations = await getAllStation();
    return res.status(200).json({
      success: true,
      message: "Stations retrieved successfully.",
      data: stations, 
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getStationByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const station = await getStationById(id);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }
    return res.status(200).json(station);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateStationByIdHandler = async (
  req: Request<{ id: string }, {}, StationRequestBody>,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { station_name, location, station_code } = req.body;

  try {
    const updatedStation = await updateStationById(
      id,
      station_name,
      location,
      station_code
    );
    if (!updatedStation) {
      return res.status(404).json({ message: "Station not found" });
    }
    return res.status(200).json({
      message: "Station updated successfully",
      station: updatedStation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStationByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    await deleteStationById(id);
    return res.status(200).json({ message: "Station deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createStationHandler,
  getAllStationHandler,
  getStationByIdHandler,
  updateStationByIdHandler,
  deleteStationByIdHandler,
};
