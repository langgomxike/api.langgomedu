export interface DTO {
  fromModel(o: object): DTO | null;

  toDTO(dto: DTO): object | null;
}
