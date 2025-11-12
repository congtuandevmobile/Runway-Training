import { RouteName } from "src/screens/HomeScreen/contant";

export type RotRow = {
  exit_location: string | number;    
  aircraft_type: string;             
  final_approach: number;            
  exit_angle: number;                
  temperature: number;               
  time: string;                      
  windspeed: number;                 
  visibility: number;                
  rot: number;                       
};

/* Chuẩn hóa */
function NumberHandler(v: unknown) {
  if (v === null || v === undefined) return null;
  const num = Number(String(v).trim());
  return Number.isFinite(num) ? num : null;
}
function StringHandler(v: unknown) {
  return String(v ?? '').trim().toLowerCase();
}

/* Thống kê nhỏ */
function median(nums: number[]) {
  const arr = [...nums].sort((a, b) => a - b);
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
}

/**
 * Từ 6 trường đầu vào → tìm các bản ghi khớp → gom theo exit_location
 * - Chọn nhóm exit_location có số lượng lớn nhất (mode)
 * - ROT đại diện = median(ROT trong nhóm đã chọn)
 * Trả về { exit_location, rotSeconds } nếu tìm thấy.
 */

export function inferExitLocationAndRot(input: {
  aircraftType: string | number;
  finalApproach: string | number;
  temperature: string | number;
  time: string;
  windspeed: string | number;
  visibility: string | number;
}): { exit_location: number; rotSeconds: number } | undefined {
  const q = {
    aircraft_type: StringHandler(input.aircraftType),
    final_approach: NumberHandler(input.finalApproach),
    temperature: NumberHandler(input.temperature),
    time: StringHandler(input.time),
    windspeed: NumberHandler(input.windspeed),
    visibility: NumberHandler(input.visibility),
  };

  if (
    q.final_approach == null ||
    q.temperature == null ||
    q.windspeed == null ||
    q.visibility == null
  ) {
    return undefined;
  }

  // Lọc ứng viên khớp đúng 6 trường (không xét exit_angle, exit_location, rot)
  const candidates = ROT_DATA.filter(r =>
    StringHandler(r.aircraft_type) === q.aircraft_type &&
    NumberHandler(r.final_approach) === q.final_approach &&
    NumberHandler(r.temperature) === q.temperature &&
    StringHandler(r.time) === q.time &&
    NumberHandler(r.windspeed) === q.windspeed &&
    NumberHandler(r.visibility) === q.visibility
  );
  if (!candidates.length) return undefined;

  // Gom theo exit_location
  const groups = new Map<number, number[]>();
  for (const row of candidates) {
    const el = NumberHandler(row.exit_location);
    const rot = NumberHandler(row.rot);
    if (el == null || rot == null) continue;
    const arr = groups.get(el) ?? [];
    arr.push(rot);
    groups.set(el, arr);
  }
  if (!groups.size) return undefined;

  // Chọn exit_location có nhiều mẫu nhất (mode)
  let chosenExitLoc: number | null = null;
  let bestCount = -1;
  for (const [el, rots] of groups.entries()) {
    if (rots.length > bestCount) {
      bestCount = rots.length;
      chosenExitLoc = el;
    }
  }
  if (chosenExitLoc == null) return undefined;

  const chosenRots = groups.get(chosenExitLoc)!;
  const rotSeconds = median(chosenRots); 

  return { exit_location: chosenExitLoc, rotSeconds };
}

/** Map exit_location → route name (mở rộng nếu cần) */
// export type RouteName = 'P4' | 'P5';

const EPS = 1e-6;
const near = (a: number, b: number) => Math.abs(a - b) < EPS;

export function routeByExitLocation(el: number): RouteName {
  if (near(el, 1750)) return 'P4';
  if (near(el, 2086.35)) return 'P5';
  return 'SPECIAL';
}

export const ROT_DATA: RotRow[] = [
{
    "exit_location": 1750,
    "aircraft_type": "Medium",
    "final_approach": 151,
    "exit_angle": 30,
    "temperature": 27,
    "time": "Day",
    "windspeed": 3,
    "visibility": 8,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 155,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Day",
    "windspeed": 6,
    "visibility": 9,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 153,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Day",
    "windspeed": -5,
    "visibility": 8,
    "rot": 60,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Light",
    "final_approach": 120,
    "exit_angle": 30,
    "temperature": 25,
    "time": "Day",
    "windspeed": -3,
    "visibility": 7,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 149,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Night",
    "windspeed": -2,
    "visibility": 9,
    "rot": 56,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 148,
    "exit_angle": 30,
    "temperature": 23,
    "time": "Night",
    "windspeed": -4,
    "visibility": 5,
    "rot": 53,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 156,
    "exit_angle": 30,
    "temperature": 24,
    "time": "Night",
    "windspeed": -1,
    "visibility": 6,
    "rot": 59,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 154,
    "exit_angle": 30,
    "temperature": 25,
    "time": "Night",
    "windspeed": 3,
    "visibility": 5,
    "rot": 61,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 148,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Day",
    "windspeed": 5,
    "visibility": 10,
    "rot": 58,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Medium",
    "final_approach": 153,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Day",
    "windspeed": -4,
    "visibility": 8,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 155,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Night",
    "windspeed": 3,
    "visibility": 7,
    "rot": 60,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Light",
    "final_approach": 110,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Day",
    "windspeed": -2,
    "visibility": 10,
    "rot": 59,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Light",
    "final_approach": 125,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": -4,
    "visibility": 10,
    "rot": 52,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 147,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Night",
    "windspeed": -1,
    "visibility": 7,
    "rot": 58,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 146,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 3,
    "visibility": 5,
    "rot": 56,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 138,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Day",
    "windspeed": 2,
    "visibility": 6,
    "rot": 56,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Medium",
    "final_approach": 135,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Night",
    "windspeed": -6,
    "visibility": 8,
    "rot": 57,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 160,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Night",
    "windspeed": 6,
    "visibility": 10,
    "rot": 62,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 140,
    "exit_angle": 30,
    "temperature": 32,
    "time": "Day",
    "windspeed": -5,
    "visibility": 5,
    "rot": 52,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Medium",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 0,
    "visibility": 10,
    "rot": 51,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 148,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Day",
    "windspeed": 0,
    "visibility": 10,
    "rot": 59,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 137,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Day",
    "windspeed": 0,
    "visibility": 10,
    "rot": 60,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Light",
    "final_approach": 118,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 2,
    "visibility": 10,
    "rot": 56,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Medium",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 27,
    "time": "Night",
    "windspeed": 7,
    "visibility": 7,
    "rot": 63,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 133,
    "exit_angle": 30,
    "temperature": 25,
    "time": "Night",
    "windspeed": 6,
    "visibility": 9,
    "rot": 60,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 130,
    "exit_angle": 30,
    "temperature": 34,
    "time": "Day",
    "windspeed": 5,
    "visibility": 4,
    "rot": 62,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 143,
    "exit_angle": 30,
    "temperature": 33,
    "time": "Day",
    "windspeed": -5,
    "visibility": 6,
    "rot": 56,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 148,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Night",
    "windspeed": -3,
    "visibility": 10,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Day",
    "windspeed": 7,
    "visibility": 10,
    "rot": 59,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 156,
    "exit_angle": 30,
    "temperature": 29,
    "time": "Day",
    "windspeed": 9,
    "visibility": 8,
    "rot": 57,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 153,
    "exit_angle": 30,
    "temperature": 28,
    "time": "Night",
    "windspeed": -5,
    "visibility": 9,
    "rot": 64,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 32,
    "time": "Night",
    "windspeed": -4,
    "visibility": 9,
    "rot": 59,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Heavy",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 23,
    "time": "Night",
    "windspeed": -5,
    "visibility": 10,
    "rot": 62,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Light",
    "final_approach": 80,
    "exit_angle": 30,
    "temperature": 31,
    "time": "Day",
    "windspeed": 7,
    "visibility": 10,
    "rot": 76,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 155,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 6,
    "visibility": 8,
    "rot": 57,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 151,
    "exit_angle": 30,
    "temperature": 25,
    "time": "Day",
    "windspeed": 8,
    "visibility": 9,
    "rot": 58,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 149,
    "exit_angle": 30,
    "temperature": 26,
    "time": "Day",
    "windspeed": 6,
    "visibility": 9,
    "rot": 55,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 149,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 6,
    "visibility": 9,
    "rot": 53,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Meidum",
    "final_approach": 148,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Day",
    "windspeed": 5,
    "visibility": 10,
    "rot": 58,
  },
  {
    "exit_location": 1750,
    "aircraft_type": "Heavy",
    "final_approach": 149,
    "exit_angle": 30,
    "temperature": 24,
    "time": "Night",
    "windspeed": 0,
    "visibility": 6,
    "rot": 60,
  },
  {
    "exit_location": 2086.35,
    "aircraft_type": "Medium",
    "final_approach": 150,
    "exit_angle": 30,
    "temperature": 30,
    "time": "Night",
    "windspeed": 2,
    "visibility": 9,
    "rot": 55,
  }
]