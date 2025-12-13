export class CreateMountainDto {
  altitude?: string;
  hasDeathZone?: boolean;
  first_climber?: string;
  first_climbed_date?: Date;
  mountain_img?: string;
  country_flag_img?: string;
  translations?: {
    language: string;
    name: string;
    description?: string;
    location: string;
  }[];
}
