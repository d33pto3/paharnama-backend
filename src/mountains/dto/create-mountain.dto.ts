export class CreateMountainDto {
  key: string;
  altitude?: string;
  hasDeathZone?: boolean;
  first_climbed_date?: Date;
  mountain_img?: string;
  country_flag_img?: string;

  translations?: {
    language: string;
    key: string;
    description?: string;
    location?: string;
    first_climber?: string;
  }[];
}
