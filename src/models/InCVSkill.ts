import User from "./User";
import Skill from "./Skill";
export default class InCVSkill {
    public user: User | undefined;
    public skill: Skill | undefined;

    constructor(user: User | undefined = undefined, skill: Skill | undefined = undefined) {
        this.user = user;
        this.skill = skill;
    }
}