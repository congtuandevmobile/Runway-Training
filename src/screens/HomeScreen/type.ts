export type LatLng = { latitude: number; longitude: number };
export type AirplanePosition = LatLng;
export type AnimateRouteOptions = {
  firstLegDurationMs?: number;
}

export type PredictPayload = {
  final_approach: number;
  aircraft_type: 'Heavy' | 'Medium' | 'Light';
  temperature: number;
  time: 'Day' | 'Night';
  windspeed: number;
  visibility: number;
};

export type ApiResponse = {
    best_index: number;
    best_probability: number;
    mean_rot: number;
    all_probabilities: number[];
    all_means: number[];
    exit_locations: number[];
}


export type PredictResponse = {
  status: "success" | "error";
  data?: ApiResponse;
  message?: string;
};
