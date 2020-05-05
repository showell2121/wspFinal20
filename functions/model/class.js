class newClass {

    constructor(){
        this.name;
        this.id;            //Class ID, level of class e.g 4910, mulitple classes 
        this.crn;           //Class CRN, specific class
        this.department;
        this.classStart;    //month class starts
        this.classEnd;
        this.startTime;     //Time class starts
        this.endTime; 
        this.daysOfClass;   //What days of the week is class help
        this.classRoom;     //Room class is held in. 
        this.classProf;
    }

    // constructor(className){
    //     this.name = className;
    //     this.id;            //Class ID, level of class e.g 4910, mulitple classes 
    //     this.crn;           //Class CRN, specific class
    //     this.department;
    //     this.classStart;    //month class starts
    //     this.classEnd;
    //     this.startTime;     //Time class starts
    //     this.endTime; 
    //     this.daysOfClass;   //What days of the week is class help
    //     this.classRoom;     //Room class is held in. 
    //     this.classProf;
    // }

    static setname(nam){ this.name = nam; }
    static getname(){ return this.name;}

    static setId(ID){ this.id = ID; }
    static getId(){ return this.id;}

    static setCrn(cr){ this.crn = cr; }
    static getCrn(){ return this.crn;}

    static setDepartment(depart){ this.department = depart; }
    static getDepartment(){ return this.department;}

    static setclassStart(classSt){ this.classStart = classSt; }
    static getclassStart(){ return this.classStart;}

    static setclassEnd(classE){ this.classEnd = classE; }
    static getclassEnd(){ return this.classEnd;}
   
    static setstartTime(startT){ this.startTime = startT; }
    static getstartTime(){ return this.startTime;}

    static setendTime(endT){ this.endTime = endT; }
    static getendTime(){ return this.endTime;}
        
    static setdaysOfClass(daysOfCl){ this.daysOfClass = daysOfCl; }
    static getdaysOfClass(){ return this.daysOfClass;}
    
    static setclassRoom(classR){ this.classRoom = classR; }
    static getclassRoom(){ return this.classRoom;}

    static setclassProf(classPr){ this.classProf = classPr; }
    static getclassProf(){ return this.classProf;}


}//end of class

module.exports = newClass;