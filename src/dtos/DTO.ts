export interface DTO {
  fromModel(o: object): DTO | null;
}
