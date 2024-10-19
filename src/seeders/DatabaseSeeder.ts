import CertificateSeeder from "./CertificateSeeder";
import GenderSeeder from "./GenderSeeder";
import RoleSeeder from "./RoleSeeder";

export default class DatabaseSeeder {
    public static seed() {
        RoleSeeder.seedAllRoles();
        GenderSeeder.seedAllGenders();
        CertificateSeeder.seedAllCertificates();
    }

    public static fake() {

    }
}