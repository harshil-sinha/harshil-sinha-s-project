import pool from "../config/db";

interface Train {
  train_name: string;
  train_number: string;
  arrival_time: string;
  departure_time: string;
  date: string;
  train_class: string;
  train_type: string;
  days_of_running: string;
  quota: string;
  travel_time: string;
  fare: number;
}

const getStationByName = async (stationName: string): Promise<string> => {
  try {
    const result = await pool.query(
      "SELECT * FROM stations WHERE station_name ILIKE $1",
      [`%${stationName}%`]
    );
    return result.rows[0]?.id || ""; 
  } catch (error) {
    console.error("Error fetching station by name:", error);
    throw new Error("Error fetching station by name");
  }
};

const getTrainsByCities = async (
  sourceStationName: string,
  destinationStationName: string
): Promise<Train[]> => {
  try {
    const sourceStationId = await getStationByName(sourceStationName);
    const destinationStationId = await getStationByName(destinationStationName);

    if (!sourceStationId || !destinationStationId) {
      throw new Error("One or both station names not found.");
    }

    const query = `
      SELECT 
        t.train_name, 
        t.train_number, 
        t.arrival_time, 
        t.departure_time, 
        t.date, 
        t.train_class, 
        t.train_type, 
        t.days_of_running,
        t.quota,
        t.travel_time,
        rd.fare
      FROM trains t
      JOIN route_details rd ON rd.train_id = t.id
      WHERE t.source_station_id = $1 AND t.destination_station_id = $2;
    `;
    const result = await pool.query(query, [
      sourceStationId,
      destinationStationId,
    ]);

    return result.rows;
  } catch (error) {
    console.error("Error fetching trains from DB:", error);
    throw error;
  }
};

export { getTrainsByCities };
