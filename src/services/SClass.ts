import Class from './../models/Class';
export default class SClass {
    public static getAllClasses(onNext: (classes: Class[]) => void) { }

    public static getClassById(id: number, onNext: (_class: Class | undefined) => void) { }

    public static getClassesByKey(key: string, onNext: (classes: Class[]) => void) { }

    public static storeClass(_class: Class, onNext: (id: number | undefined) => void) { }

    public static updateClass(_class: Class, onNext: (result: boolean) => void) { }
    
    public static softDeleteClass(_class: Class, onNext: (result: boolean) => void) { }
}