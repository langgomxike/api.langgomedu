import CertificateSeeder from "./CertificateSeeder";
import GenderSeeder from "./GenderSeeder";
import PermissionSeeder from "./PermissionSeeder";
import RoleSeeder from "./RoleSeeder";

export default class DatabaseSeeder {
    public static seed() {
        PermissionSeeder.seedAllPermissions();
        RoleSeeder.seedAllRoles();
        GenderSeeder.seedAllGenders();   
        CertificateSeeder.seedAllCertificates();
    } 

    public static fake() {
        
    }
}