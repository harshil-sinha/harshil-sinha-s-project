import pool from "../config/db";

interface Station {
  id: string;
  station_name: string;
  location: string;
  station_code: string;
  updated_at: Date;
}

const createStation = async (
  station_name: string,
  location: string,
  station_code: string
): Promise<Station[]> => {
  try {
    const result = await pool.query(
      `INSERT INTO stations(station_name, location, station_code) VALUES($1, $2, $3) RETURNING *`,
      [station_name, location, station_code]
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error creating station:", error);
    throw new Error("Error creating station");
  }
};

const getAllStation = async (): Promise<Station[]> => {
  try {
    const result = await pool.query("SELECT * FROM stations");
    return result.rows || [];
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw new Error("Error fetching stations");
  }
};

const getStationById = async (id: string): Promise<Station[]> => {
  try {
    const result = await pool.query("SELECT * FROM stations WHERE id = $1", [
      id,
    ]);
    return result.rows || [];
  } catch (error) {
    console.error("Error fetching station:", error);
    throw new Error("Error fetching station");
  }
};

const updateStationById = async (
  id: string,
  station_name: string,
  location: string,
  station_code: string
): Promise<Station[]> => {
  try {
    const result = await pool.query(
      `UPDATE stations SET station_name = $1, location = $2, station_code = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [station_name, location, station_code, id]
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error updating station:", error);
    throw new Error("Error updating station");
  }
};

const deleteStationById = async (id: string): Promise<void> => {
  try {
    await pool.query("DELETE FROM stations WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting station:", error);
    throw new Error("Error deleting station");
  }
};

const getStationByName = async (stationName: string): Promise<Station[]> => {
  try {
    const result = await pool.query(
      "SELECT * FROM stations WHERE station_name ILIKE $1",
      [`%${stationName}%`]
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error fetching stations by name:", error);
    throw new Error("Error fetching stations by name");
  }
};

export {
  createStation,
  getStationByName,
  getAllStation,
  getStationById,
  updateStationById,
  deleteStationById,
};
