import { routeByExitLocation } from "src/data/rot-data";
import { ApiResponse } from "src/screens/HomeScreen/type";

export type Formatted = {
  P4?: { probability: number; rot: number };
  P5?: { probability: number; rot: number };
  SPECIAL?: { probability: number; rot: number };
  best_run_way: 'P4' | 'P5' | 'SPECIAL';
  best_probability: number;
  best_rot: number;
};

export function formatPredictResponse(raw: ApiResponse): Formatted {
  const n = raw.exit_locations.length;
  if (
    raw.all_probabilities.length !== n ||
    raw.all_means.length !== n ||
    n === 0
  ) {
    throw new Error('Dữ liệu predict không hợp lệ (độ dài mảng không khớp).');
  }

  const formatted: Partial<Formatted> = {};
  for (let i = 0; i < n; i++) {
    const route = routeByExitLocation(raw.exit_locations[i]);
    formatted[route] = {
      probability: raw.all_probabilities[i],
      rot: raw.all_means[i],
    };
  }

  const bestIdx = Math.max(1, Math.min(raw.best_index, n)) - 1;
  const bestRoute = routeByExitLocation(raw.exit_locations[bestIdx]);

  return {
    ...(formatted.P4 ? { P4: formatted.P4 } : {}),
    ...(formatted.P5 ? { P5: formatted.P5 } : {}),
    ...(formatted.SPECIAL ? { SPECIAL: formatted.SPECIAL } : {}),
    best_run_way: bestRoute,
    best_probability: raw.all_probabilities[bestIdx],
    best_rot: raw.all_means[bestIdx],
  };
}
