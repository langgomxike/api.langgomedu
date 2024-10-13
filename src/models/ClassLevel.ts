import ClassLevelDTO from "../dtos/ClassLevelDTO";

export default class ClassLevel {
    public id: number;
    public vnName: string;
    public jpName: string;
    public enName: string;

    constructor(id = -1, vnName = "", jpName = "", enName = "") {
        this.id = id;
        this.vnName = vnName;
        this.jpName = jpName;
        this.enName = enName;
    }

    fromDTO(levelDTO: ClassLevelDTO): ClassLevel {
        return new ClassLevel(
            levelDTO.id,
            levelDTO.vn_name,
            levelDTO.jp_name,
            levelDTO.en_name,
        );
    }
}