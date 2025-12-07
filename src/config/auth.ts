// Admin credentials configuration
// Change these values to update admin login credentials
export const ADMIN_CREDENTIALS = {
  username: "admin_dblock",
  password: "Dblock@2025",
};

// Valid flat number ranges for D Block
export const FLAT_RANGES = {
  floors: [1, 2, 3, 4, 5],
  unitsPerFloor: 30,
  getValidFlats: (): string[] => {
    const flats: string[] = [];
    for (const floor of FLAT_RANGES.floors) {
      for (let unit = 1; unit <= FLAT_RANGES.unitsPerFloor; unit++) {
        const flatNumber = `${floor}${unit.toString().padStart(2, "0")}`;
        flats.push(flatNumber);
      }
    }
    return flats;
  },
  isValidFlat: (flatNumber: string): boolean => {
    const num = parseInt(flatNumber, 10);
    if (isNaN(num)) return false;
    const floor = Math.floor(num / 100);
    const unit = num % 100;
    return floor >= 1 && floor <= 5 && unit >= 1 && unit <= 30;
  },
};

// Transaction categories
export const CATEGORIES = [
  "Maintenance",
  "Repair",
  "Electricity",
  "Water",
  "Security",
  "Festival",
  "Cleaning",
  "Gardening",
  "Lift Maintenance",
  "Miscellaneous",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Approver roles
export const APPROVER_ROLES = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
] as const;

export type ApproverRole = (typeof APPROVER_ROLES)[number];
