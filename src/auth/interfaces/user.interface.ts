export interface User {
  id: string;
  email: string;
  name?: string;
  // Add other properties your user has, but NOT password
  role?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
